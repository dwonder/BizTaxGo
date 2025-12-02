import React, { useState, useEffect } from 'react';
import { BusinessProfile, TaxDeadline } from '../types';
import { generateDeadlines } from '../services/taxUtils';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';

interface Props {
  profile: BusinessProfile;
}

const ComplianceCalendar: React.FC<Props> = ({ profile }) => {
  const [deadlines, setDeadlines] = useState<TaxDeadline[]>([]);

  useEffect(() => {
    const generated = generateDeadlines(profile);
    setDeadlines(generated);
  }, [profile]);

  const getStatusColor = (deadline: TaxDeadline) => {
    const date = parseISO(deadline.dueDate);
    if (deadline.status === 'completed') return 'bg-green-100 text-green-700 border-green-200';
    if (isPast(date) && !isToday(date)) return 'bg-red-50 text-red-700 border-red-200';
    if (isToday(date)) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-white text-slate-700 border-slate-200 hover:border-blue-300';
  };

  const markComplete = (id: string) => {
    setDeadlines(prev => prev.map(d => d.id === id ? { ...d, status: 'completed' } : d));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
             <CalendarIcon className="w-6 h-6 text-indigo-600" />
             Compliance Calendar
           </h2>
           <p className="text-sm text-slate-500 mt-1">Upcoming tax deadlines for {profile.companyName}</p>
        </div>
        <div className="text-sm text-slate-400">
           {new Date().getFullYear()} Tax Year
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {deadlines.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No upcoming deadlines found based on your profile.
          </div>
        ) : (
          deadlines.map((item) => (
            <div key={item.id} className={`p-4 sm:p-6 border-l-4 transition-colors ${getStatusColor(item).replace('bg-', 'border-l-')}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide
                      ${item.type === 'VAT' ? 'bg-purple-100 text-purple-700' : 
                        item.type === 'CIT' ? 'bg-blue-100 text-blue-700' : 
                        'bg-orange-100 text-orange-700'}`}>
                      {item.type}
                    </span>
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{item.description}</p>
                  
                  <div className="flex items-center gap-2 mt-3 text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    <span>Due: {format(parseISO(item.dueDate), 'MMMM do, yyyy')}</span>
                    {isPast(parseISO(item.dueDate)) && item.status !== 'completed' && (
                       <span className="text-red-600 ml-2 font-bold text-xs bg-red-100 px-2 py-0.5 rounded-full">OVERDUE</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  {item.status === 'completed' ? (
                    <div className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-full">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Filed</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => markComplete(item.id)}
                      className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-900 transition shadow-sm"
                    >
                      Mark as Filed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ComplianceCalendar;
