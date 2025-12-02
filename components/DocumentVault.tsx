import React, { useState, useRef } from 'react';
import { DocumentRecord } from '../types';
import { analyzeDocument } from '../services/geminiService';
import { FileText, Upload, Sparkles, Loader2, Search, X, FileCheck, AlertCircle, Image as ImageIcon } from 'lucide-react';

const DocumentVault: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([
    { id: '1', name: 'TCC-2023.pdf', type: 'Certificate', uploadDate: new Date().toISOString(), category: 'Compliance', summary: 'Tax Clearance Certificate for 2023 Tax Year.' }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    // 5MB Limit
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Maximum size is 5MB.");
      return;
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'text/plain', 'text/csv'];
    // Check if type is valid or if it's a known extension for text
    const isText = file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.json');
    
    if (!validTypes.includes(file.type) && !isText) {
       // We can be permissive or strict. Let's alert but allow for now if user insists, or block.
       // Let's block strictly for demo purposes to avoid confusion
       // alert("Unsupported file type. Please upload PDF, PNG, JPG, or Text files.");
       // actually, let's just accept it but warn
    }

    setSelectedFile(file);

    // If text, auto-populate the textarea for analysis
    if (isText) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') setInputText(text);
      };
      reader.readAsText(file);
    } else {
      // If binary, clear text input to avoid confusion (or keep it if they want to add notes?)
      // Let's keep existing text if any, or leave blank.
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    // Optionally clear text if it came from the file? Let's leave text alone in case user edited it.
  };

  const handleUpload = async () => {
    if (!inputText && !selectedFile) return;
    setIsAnalyzing(true);
    
    try {
      let analysis = { type: 'Unknown', summary: 'No summary available', amount: 0 };
      
      // 1. Try AI Analysis if text is present
      if (inputText) {
        try {
          const result = await analyzeDocument(inputText);
          analysis = { ...analysis, ...result };
        } catch (err) {
          console.warn("AI Analysis failed or returned partial data", err);
          analysis.summary = "Manual review required (AI analysis failed)";
        }
      } else if (selectedFile) {
        // 2. Fallback for binary files without text content (since we can't do OCR client-side easily here)
        analysis.summary = `Uploaded file: ${selectedFile.name}`;
        // Simple heuristics based on filename
        const name = selectedFile.name.toLowerCase();
        if (name.includes('invoice')) analysis.type = 'Invoice';
        else if (name.includes('receipt')) analysis.type = 'Receipt';
        else if (name.includes('tax') || name.includes('tcc') || name.includes('firs')) analysis.type = 'Tax Document';
        else if (name.includes('contract')) analysis.type = 'Contract';
        else analysis.type = selectedFile.type.split('/')[1]?.toUpperCase() || 'FILE';
      }

      const newDoc: DocumentRecord = {
        id: Date.now().toString(),
        name: selectedFile ? selectedFile.name : `Note-${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`,
        type: analysis.type || 'Unknown',
        uploadDate: new Date().toISOString(),
        summary: analysis.summary || 'Uploaded document',
        category: analysis.amount ? 'Financial' : 'General',
        content: inputText
      };

      setDocuments(prev => [newDoc, ...prev]);
      setInputText('');
      setSelectedFile(null);
      setShowUploadModal(false);
    } catch (error) {
      alert("Failed to process document. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Document Vault</h2>
          <p className="text-slate-500">Securely store and analyze your compliance documents.</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
        >
          <Upload className="w-4 h-4" />
          Add Document
        </button>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                Upload & Analyze
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Drag and Drop Zone */}
              {!selectedFile ? (
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                    ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
                  `}
                >
                  <input 
                    type="file" 
                    hidden 
                    ref={fileInputRef} 
                    onChange={handleFileSelect}
                    accept=".pdf,.png,.jpg,.jpeg,.txt,.csv,.json"
                  />
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500 mt-1">PDF, PNG, JPG or TXT (max. 5MB)</p>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {selectedFile.type.includes('image') ? <ImageIcon className="w-5 h-5 text-indigo-600" /> : <FileCheck className="w-5 h-5 text-indigo-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button onClick={removeSelectedFile} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Text Area fallback/editor */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Document Content / Notes
                </label>
                <textarea
                  className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                  placeholder={selectedFile ? "Add notes about this file..." : "Paste document text here for AI analysis..."}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                {selectedFile && !inputText && !selectedFile.type.startsWith('text') && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    AI analysis is limited for binary files without text content.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload}
                disabled={isAnalyzing || (!inputText && !selectedFile)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isAnalyzing ? 'Analyzing...' : 'Save Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300" 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Date Added</th>
                <th className="p-4 font-medium">AI Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No documents stored yet.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition group">
                    <td className="p-4 flex items-center gap-3 font-medium text-slate-900">
                      <div className={`p-2 rounded ${doc.type === 'Unknown' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-600'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      {doc.name}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium border border-slate-200 uppercase">
                        {doc.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                    <td className="p-4 text-slate-600 max-w-md truncate" title={doc.summary}>
                      {doc.summary}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentVault;