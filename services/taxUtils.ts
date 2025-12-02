import { BusinessProfile, TaxDeadline, Employee, PayeResult } from '../types';
import { addMonths, setDate, isWeekend, nextMonday, format, isBefore, parseISO } from 'date-fns';

// Constants based on Nigerian Tax Laws
export const VAT_THRESHOLD = 25000000;
export const CIT_MEDIUM_THRESHOLD = 100000000;

export const calculatePaye = (employee: Employee): PayeResult => {
  const gross = employee.annualGrossSalary;
  
  // Consolidated Relief Allowance (CRA)
  // Higher of 200,000 or 1% of Gross, PLUS 20% of Gross
  const baseRelief = Math.max(200000, gross * 0.01);
  const percentRelief = gross * 0.20;
  const cra = baseRelief + percentRelief;
  
  // Pension (Simulated as 8% of gross for simplicity, though technically on Basic+Housing+Transport)
  // We will assume the user enters "Taxable Gross" or handle pension separately. 
  // For this simplified calculator, we deduct CRA.
  
  let taxable = gross - cra;
  if (taxable < 0) taxable = 0;

  // Tax Bands (Finance Act 2020)
  // 1st 300k @ 7%
  // Next 300k @ 11%
  // Next 500k @ 15%
  // Next 500k @ 19%
  // Next 1.6M @ 21%
  // Above 3.2M @ 24%

  let tax = 0;
  let remaining = taxable;

  // Band 1
  const b1 = Math.min(remaining, 300000);
  tax += b1 * 0.07;
  remaining -= b1;

  // Band 2
  if (remaining > 0) {
    const b2 = Math.min(remaining, 300000);
    tax += b2 * 0.11;
    remaining -= b2;
  }

  // Band 3
  if (remaining > 0) {
    const b3 = Math.min(remaining, 500000);
    tax += b3 * 0.15;
    remaining -= b3;
  }

  // Band 4
  if (remaining > 0) {
    const b4 = Math.min(remaining, 500000);
    tax += b4 * 0.19;
    remaining -= b4;
  }

  // Band 5
  if (remaining > 0) {
    const b5 = Math.min(remaining, 1600000);
    tax += b5 * 0.21;
    remaining -= b5;
  }

  // Band 6
  if (remaining > 0) {
    tax += remaining * 0.24;
  }

  // Minimum Tax Rule: 1% of Gross if calculated tax is lower (Usually for very low income, but standard PAYE usually applies)
  // We'll stick to the bands for standard employment income.

  return {
    employeeId: employee.id,
    annualGross: gross,
    cra,
    taxableIncome: taxable,
    annualTax: tax,
    monthlyTax: tax / 12,
    effectiveRate: (tax / gross) * 100
  };
};

export const generateDeadlines = (profile: BusinessProfile): TaxDeadline[] => {
  const deadlines: TaxDeadline[] = [];
  const today = new Date();
  
  // 1. VAT (Monthly by 21st) - Only if turnover >= 25M
  if (profile.annualTurnover >= VAT_THRESHOLD) {
    for (let i = 0; i < 3; i++) {
      let date = setDate(addMonths(today, i), 21);
      if (isWeekend(date)) date = nextMonday(date);
      
      deadlines.push({
        id: `vat-${i}`,
        title: `VAT Return (${format(addMonths(today, i - 1), 'MMMM')})`,
        dueDate: date.toISOString(),
        type: 'VAT',
        status: 'pending',
        description: 'File Form 002 via FIRS TaxPro Max.'
      });
    }
  }

  // 2. PAYE (Monthly by 10th)
  for (let i = 0; i < 3; i++) {
    let date = setDate(addMonths(today, i), 10);
    if (isWeekend(date)) date = nextMonday(date);

    deadlines.push({
      id: `paye-${i}`,
      title: `PAYE Remittance (${format(addMonths(today, i - 1), 'MMMM')})`,
      dueDate: date.toISOString(),
      type: 'PAYE',
      status: 'pending',
      description: 'Remit employee tax deductions to State IRS.'
    });
  }

  // 3. CIT (Annual) - Approx 6 months after FYE. Assuming Dec 31 FYE -> June 30.
  // Check if June 30 is coming up this year or next
  const currentYear = today.getFullYear();
  let citDate = new Date(currentYear, 5, 30); // June 30 (Month is 0-indexed)
  
  if (isBefore(citDate, today)) {
     citDate = new Date(currentYear + 1, 5, 30);
  }
  
  deadlines.push({
    id: `cit-${currentYear}`,
    title: 'Companies Income Tax (CIT) Filing',
    dueDate: citDate.toISOString(),
    type: 'CIT',
    status: 'pending',
    description: profile.annualTurnover < 25000000 
      ? 'File NIL returns (0% rate for small companies).' 
      : 'File CIT returns (20% for medium companies).'
  });

  return deadlines.sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime());
};

export const getTaxStatus = (turnover: number) => {
  if (turnover < VAT_THRESHOLD) return { label: 'Small Business', color: 'text-green-600', bg: 'bg-green-100', taxRate: '0% CIT' };
  if (turnover < CIT_MEDIUM_THRESHOLD) return { label: 'Medium Business', color: 'text-yellow-600', bg: 'bg-yellow-100', taxRate: '20% CIT' };
  return { label: 'Large Business', color: 'text-red-600', bg: 'bg-red-100', taxRate: '30% CIT' };
};
