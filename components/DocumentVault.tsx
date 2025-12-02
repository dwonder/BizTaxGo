import React, { useState } from 'react';
import { DocumentRecord } from '../types';
import { analyzeDocument } from '../services/geminiService';
import { FileText, Upload, Sparkles, Loader2, Search } from 'lucide-react';

const DocumentVault: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([
    { id: '1', name: 'TCC-2023.pdf', type: 'Certificate', uploadDate: new Date().toISOString(), category: 'Compliance', summary: 'Tax Clearance Certificate for 2023 Tax Year.' }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleSimulatedUpload = async () => {
    if (!inputText) return;
    setIsAnalyzing(true);
    
    try {
      const analysis = await analyzeDocument(inputText);
      
      const newDoc: DocumentRecord = {
        id: Date.now().toString(),
        name: `Scan-${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`,
        type: analysis.type || 'Unknown',
        uploadDate: new Date().toISOString(),
        summary: analysis.summary || 'No summary available',
        category: analysis.amount ? 'Financial' : 'General',
        content: inputText
      };

      setDocuments(prev => [newDoc, ...prev]);
      setInputText('');
      setShowUploadModal(false);
    } catch (error) {
      alert("Failed to analyze document. Please try again.");
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
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fade-in">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              AI Document Scanner
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Paste the text content of your invoice, receipt, or tax certificate below. Our AI will analyze it to extract key details.
            </p>
            <textarea
              className="w-full h-40 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
              placeholder="Paste document text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSimulatedUpload}
                disabled={isAnalyzing || !inputText}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-medium flex items-center gap-2"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isAnalyzing ? 'Analyzing...' : 'Analyze & Save'}
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
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition group">
                  <td className="p-4 flex items-center gap-3 font-medium text-slate-900">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
                      <FileText className="w-5 h-5" />
                    </div>
                    {doc.name}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium border border-slate-200">
                      {doc.type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                  <td className="p-4 text-slate-600 max-w-md truncate" title={doc.summary}>
                    {doc.summary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentVault;
