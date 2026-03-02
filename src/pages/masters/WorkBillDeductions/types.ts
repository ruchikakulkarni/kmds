export interface Deduction {
  id: string;
  payeeType: string;
  entityType: string;
  deductionType: string;
  deductionPct: number;
  remarks: string;
  status: 'Active' | 'Inactive';
}

export type DeductionFormData = Omit<Deduction, 'id'>;

export const PAYEE_TYPES = ['Contractor', 'Supplier', 'Vendor', 'Consultant'] as const;

export const ENTITY_TYPES = ['Individual', 'Firm', 'Company', 'Government Body', 'Trust'] as const;

export const DEDUCTION_TYPES = [
  'TDS (Income Tax)',
  'GST (Goods & Services Tax)',
  'Labour Cess',
  'Security Deposit',
  'Earnest Money Deposit',
  'Penalty',
  'Other',
] as const;
