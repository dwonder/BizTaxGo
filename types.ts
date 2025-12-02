export interface BusinessProfile {
  companyName: string;
  registrationDate: string; // ISO Date string
  annualTurnover: number;
  sector: string;
  employeeCount: number;
}

export interface TaxDeadline {
  id: string;
  title: string;
  dueDate: string; // ISO Date string
  type: 'VAT' | 'CIT' | 'PAYE' | 'WHT' | 'Other';
  status: 'pending' | 'completed' | 'overdue';
  amount?: number;
  description: string;
}

export interface Employee {
  id: string;
  name: string;
  annualGrossSalary: number;
}

export interface PayeResult {
  employeeId: string;
  annualGross: number;
  cra: number; // Consolidated Relief Allowance
  taxableIncome: number;
  annualTax: number;
  monthlyTax: number;
  effectiveRate: number;
}

export interface DocumentRecord {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  summary?: string;
  category?: string;
  content?: string; // Simulated content for AI analysis
}

export enum TaxThreshold {
  SmallBusinessLimit = 25000000,
  MediumBusinessLimit = 100000000,
}
