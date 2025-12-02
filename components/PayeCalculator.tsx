import React, { useState } from 'react';
import { calculatePaye } from '../services/taxUtils';
import { PayeResult } from '../types';
import { Calculator, Plus, Trash2, DollarSign } from 'lucide-react';

const PayeCalculator: React.FC = () => {
  const [salaryInput, setSalaryInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [results, setResults] = useState<PayeResult[]>([]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaryInput) return;

    const gross = parseFloat(salaryInput);
    const newEmployee = {
      id: Date.now().toString(),
      name: nameInput || `Employee ${results.length + 1}`,
      annualGrossSalary: gross
    };

    const result = calculatePaye(newEmployee);
    setResults([...results, result]);
    setSalaryInput('');
    setNameInput('');
  };

  const removeResult = (id: string) => {
    setResults(results.filter(r => r.employeeId !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Calculator className="w-6 h-6 text-teal-700" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Add Employee</h2>
          </div>
          
          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Employee Name (Optional)</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Annual Gross Salary (₦)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">₦</span>
                <input
                  type="number"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  className="w-full pl-8 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  placeholder="2,400,000"
                  required
                  min="0"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Includes Basic, Housing, Transport, etc.</p>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              Calculate & Add
            </button>
          </form>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
          <p className="font-semibold mb-1">Did you know?</p>
          Minimum Wage in Nigeria is exempt from PAYE if the annual gross income is below the threshold. The CRA logic ensures lower earners pay significantly less tax.
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Payroll Summary</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Employee</th>
                  <th className="p-4 font-semibold">Gross (Annual)</th>
                  <th className="p-4 font-semibold">Taxable Income</th>
                  <th className="p-4 font-semibold">Annual Tax</th>
                  <th className="p-4 font-semibold">Monthly PAYE</th>
                  <th className="p-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No employees added yet. Use the form to calculate PAYE.
                    </td>
                  </tr>
                ) : (
                  results.map((r) => (
                    <tr key={r.employeeId} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-medium text-slate-900">{r.name}</td>
                      <td className="p-4">₦{r.annualGross.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="p-4 text-slate-500">₦{r.taxableIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="p-4 font-medium text-orange-600">₦{r.annualTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="p-4 font-bold text-teal-700 bg-teal-50">₦{r.monthlyTax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => removeResult(r.employeeId)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {results.length > 0 && (
             <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-6">
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase">Total Monthly Remittance</p>
                  <p className="text-xl font-bold text-slate-900">
                    ₦{results.reduce((acc, curr) => acc + curr.monthlyTax, 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayeCalculator;
