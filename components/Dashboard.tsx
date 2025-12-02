import React from 'react';
import { BusinessProfile, TaxThreshold } from '../types';
import { getTaxStatus, VAT_THRESHOLD } from '../services/taxUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { AlertTriangle, TrendingUp, CheckCircle, ShieldCheck } from 'lucide-react';

interface DashboardProps {
  profile: BusinessProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  const status = getTaxStatus(profile.annualTurnover);
  const turnoverProgress = Math.min((profile.annualTurnover / TaxThreshold.MediumBusinessLimit) * 100, 100);
  
  const vatApproaching = profile.annualTurnover >= VAT_THRESHOLD * 0.9 && profile.annualTurnover < VAT_THRESHOLD;
  const citApproaching = profile.annualTurnover >= 20000000 && profile.annualTurnover < 25000000;

  const data = [
    { name: 'Turnover', value: profile.annualTurnover },
    { name: 'Remaining to Next Tier', value: Math.max(0, TaxThreshold.MediumBusinessLimit - profile.annualTurnover) },
  ];
  const COLORS = ['#0f766e', '#e2e8f0'];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Tax Status</p>
              <h3 className={`text-2xl font-bold mt-2 ${status.color}`}>{status.label}</h3>
              <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.color}`}>
                {status.taxRate}
              </span>
            </div>
            <ShieldCheck className={`w-8 h-8 ${status.color}`} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Projected Turnover</p>
              <h3 className="text-2xl font-bold mt-2 text-slate-900">₦{profile.annualTurnover.toLocaleString()}</h3>
              <p className="text-xs text-slate-400 mt-1">For current financial year</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Compliance Score</p>
              <h3 className="text-2xl font-bold mt-2 text-slate-900">Good</h3>
               <p className="text-xs text-slate-400 mt-1">Based on upcoming deadlines</p>
            </div>
            <CheckCircle className="w-8 h-8 text-teal-500" />
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {(vatApproaching || citApproaching) && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg shadow-sm">
          <div className="flex">
            <AlertTriangle className="h-6 w-6 text-orange-600 mr-3" />
            <div>
              <h4 className="text-orange-800 font-bold">Compliance Threshold Alert</h4>
              <p className="text-sm text-orange-700 mt-1">
                {vatApproaching && "You are approaching the ₦25M VAT registration threshold. Prepare to start filing VAT monthly."}
                {citApproaching && "You are nearing the ₦25M turnover mark. Your CIT status will change from 0% to 20% soon."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Turnover Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Turnover & Tax Tier</h3>
          <div className="h-64 flex items-center justify-center relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm text-slate-500">Progress to</span>
                <span className="font-bold text-slate-700">Medium Tier</span>
             </div>
          </div>
          <div className="mt-4">
             <div className="flex justify-between text-sm text-slate-600 mb-1">
               <span>₦0</span>
               <span>₦25M (VAT)</span>
               <span>₦100M (CIT Max)</span>
             </div>
             <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div 
                  className="bg-teal-600 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${turnoverProgress}%` }}
                ></div>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
           <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-700 font-medium transition flex flex-col items-center justify-center gap-2">
                 <span className="text-2xl">📅</span>
                 View Calendar
              </button>
              <button className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-700 font-medium transition flex flex-col items-center justify-center gap-2">
                 <span className="text-2xl">🖩</span>
                 PAYE Calc
              </button>
              <button className="p-4 bg-amber-50 hover:bg-amber-100 rounded-lg text-amber-700 font-medium transition flex flex-col items-center justify-center gap-2">
                 <span className="text-2xl">📂</span>
                 Doc Vault
              </button>
              <button className="p-4 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-700 font-medium transition flex flex-col items-center justify-center gap-2">
                 <span className="text-2xl">🤖</span>
                 Ask AI
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
