import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ComplianceCalendar from './components/ComplianceCalendar';
import PayeCalculator from './components/PayeCalculator';
import DocumentVault from './components/DocumentVault';
import Onboarding from './components/Onboarding';
import AiAssistant from './components/AiAssistant';
import { BusinessProfile } from './types';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initial Load simulation
  useEffect(() => {
    const saved = localStorage.getItem('biztax_profile');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const handleOnboardingComplete = (newProfile: BusinessProfile) => {
    setProfile(newProfile);
    localStorage.setItem('biztax_profile', JSON.stringify(newProfile));
  };

  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard profile={profile} />;
      case 'calendar': return <ComplianceCalendar profile={profile} />;
      case 'paye': return <PayeCalculator />;
      case 'vault': return <DocumentVault />;
      default: return <Dashboard profile={profile} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); }} 
        companyName={profile.companyName} 
      />

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-slate-900 z-50 transform transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <div className="p-4 flex justify-between items-center border-b border-slate-800 text-white">
            <h2 className="font-bold text-lg">Menu</h2>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400">Close</button>
         </div>
         <nav className="p-4 space-y-2">
            <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className={`w-full text-left p-3 rounded ${activeTab === 'dashboard' ? 'bg-teal-600 text-white' : 'text-slate-400'}`}>Dashboard</button>
            <button onClick={() => { setActiveTab('calendar'); setIsMobileMenuOpen(false); }} className={`w-full text-left p-3 rounded ${activeTab === 'calendar' ? 'bg-teal-600 text-white' : 'text-slate-400'}`}>Calendar</button>
            <button onClick={() => { setActiveTab('paye'); setIsMobileMenuOpen(false); }} className={`w-full text-left p-3 rounded ${activeTab === 'paye' ? 'bg-teal-600 text-white' : 'text-slate-400'}`}>PAYE Calculator</button>
            <button onClick={() => { setActiveTab('vault'); setIsMobileMenuOpen(false); }} className={`w-full text-left p-3 rounded ${activeTab === 'vault' ? 'bg-teal-600 text-white' : 'text-slate-400'}`}>Document Vault</button>
         </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-6">
           <div className="font-bold text-xl text-slate-800">BizTax-Go</div>
           <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-white rounded shadow-sm border border-slate-200">
             <Menu className="w-6 h-6 text-slate-600" />
           </button>
        </div>

        <div className="max-w-6xl mx-auto animate-fade-in">
          {renderContent()}
        </div>
      </main>

      <AiAssistant />
    </div>
  );
};

export default App;
