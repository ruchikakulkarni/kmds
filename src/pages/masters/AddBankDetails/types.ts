export type AccountType =
  | 'Savings'
  | 'Current'
  | 'Fixed Deposit'
  | 'Cash Credit'
  | 'Overdraft';

export type AccountStatus = 'Active' | 'Inactive';

export interface ChequeRange {
  id: string;
  issuedDate: string; // DD-MM-YYYY
  from: number;
  to: number;
  exhausted: boolean;
}

export interface BankAccount {
  id: string;
  bankId: string;
  bankName: string;
  branchId: string;
  branchName: string;
  ifsc: string;
  micr: string;
  shortName: string;
  addressLine1: string;
  addressLine2: string;
  districtId: string;
  districtName: string;
  talukId: string;
  talukName: string;
  pinCode: string;
  contactNumber: string;
  accountNumber: string;
  accountType: AccountType;
  purposeId: string;
  purposeName: string;
  fundId: string;
  fundName: string;
  integrations: string[];
  description: string;
  status: AccountStatus;
  chequeLeaves: ChequeRange[];
}

export interface FormErrors {
  bankId?: string;
  branchId?: string;
  shortName?: string;
  addressLine1?: string;
  addressLine2?: string;
  districtId?: string;
  talukId?: string;
  pinCode?: string;
  contactNumber?: string;
  accountNumber?: string;
  confirmAccountNumber?: string;
  accountType?: string;
  purposeId?: string;
  fundId?: string;
  description?: string;
}

export interface ChequeFormErrors {
  issuedDate?: string;
  from?: string;
  to?: string;
}
