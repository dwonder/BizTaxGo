import React, { useState } from 'react';
import { BusinessProfile } from '../types';
import { Briefcase, ArrowRight } from 'lucide-react';

interface Props {
  onComplete: (profile: BusinessProfile) => void;
}

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<BusinessProfile>>({
    companyName: '',
    annualTurnover: 0,
    employeeCount: 0,
    sector: 'General Trade'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
    } else {
      onComplete({
        ...formData,
        registrationDate: new Date().toISOString(), // Simplified for demo
      } as BusinessProfile);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-6 text-white text-center">
          <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/30">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to BizTax-Go</h1>
          <p className="text-slate-400 text-sm mt-1">Simplifying Tax Compliance for Nigerian SMEs</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Tell us about your business</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <input
                  required
                  type="text"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="e.g. Lagos Ventures Ltd"
                  value={formData.companyName}
                  onChange={e => setFormData({...formData, companyName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sector / Industry</label>
                <select
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  value={formData.sector}
                  onChange={e => setFormData({...formData, sector: e.target.value})}
                >
                  <option>General Trade</option>
                  <option>Technology / Startup</option>
                  <option>Manufacturing</option>
                  <option>Professional Services</option>
                  <option>Agriculture</option>
                </select>
              </div>

              <div className="pt-4">
                 <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition flex items-center justify-center gap-2">
                   Next Step <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
               <h2 className="text-lg font-semibold text-slate-800 mb-2">Financial Details</h2>
               <p className="text-xs text-slate-500 mb-4">This helps us determine your tax obligations (CIT rates, VAT status).</p>

               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Annual Turnover (₦)</label>
                <input
                  required
                  type="number"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="20,000,000"
                  value={formData.annualTurnover || ''}
                  onChange={e => setFormData({...formData, annualTurnover: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Number of Employees</label>
                <input
                  required
                  type="number"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="5"
                  value={formData.employeeCount || ''}
                  onChange={e => setFormData({...formData, employeeCount: Number(e.target.value)})}
                />
              </div>

              <div className="pt-4">
                 <button type="submit" className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition shadow-lg shadow-teal-600/20">
                   Get Started
                 </button>
                 <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="w-full mt-3 text-slate-500 py-2 text-sm hover:text-slate-800 transition"
                 >
                   Back
                 </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
