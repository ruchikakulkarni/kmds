// ── Literal union types ──────────────────────────────────────────────────────

export type PayeeType = 'Beneficiary' | 'Employee' | 'Statutory' | 'Vendor';
export type VendorStatus = 'Active' | 'Inactive';
export type EmployeeType = 'Permanent' | 'Temporary' | 'Contract';
export type StatutoryPaymentType =
  | 'TDS'
  | 'GST'
  | 'Professional Tax'
  | 'PF'
  | 'ESI'
  | 'Labour Cess';
export type FinancialYear = '2024-25' | '2025-26' | '2026-27';
export type BeneficiaryAddMode = 'single' | 'csv';

// ── Reusable sub-record shapes ───────────────────────────────────────────────

export interface AddressContact {
  addressLine1: string;
  addressLine2: string;
  district: string;
  talukCity: string;
  state: string;
  pinCode: string;
  contactPersonName: string;
  mobile: string;
  email: string;
}

export interface BankInfo {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  micr: string;
}

export interface GSTInfo {
  gstRegistered: 'Yes' | 'No';
  gstin: string;
  legalName: string;
  tradeName: string;
  gstStatus: string;
}

export interface BeneficiaryEntry {
  id: string;
  name: string;
  aadhaar: string;
  mobile: string;
  bankAccount: string;
  ifsc: string;
}

// ── Payee-type-specific payloads ─────────────────────────────────────────────

export interface BeneficiaryData {
  schemeId: string;
  schemeName: string;
  schemeFrequency: string;
  financialYear: FinancialYear | '';
  beneficiaries: BeneficiaryEntry[];
}

export interface EmployeeData {
  employeeType: EmployeeType | '';
  name: string;
  designation: string;
  department: string;
  kgid: string;
  hrmsId: string;
  k2Id: string;
  mobile: string;
  email: string;
  endDate: string;
}

export interface StatutoryData {
  statutoryPaymentType: StatutoryPaymentType | '';
  pan: string;
  panName: string;
  panStatus: string;
  address: AddressContact;
  bank: BankInfo;
  gst: GSTInfo;
}

export interface VendorData {
  pan: string;
  panName: string;
  panStatus: string;
  msmeRegistered: 'Yes' | 'No';
  udyamRegistrationNo: string;
  k2RecipientId: string;
  pfmsVendorId: string;
  address: AddressContact;
  bank: BankInfo;
  gst: GSTInfo;
}

// ── Master record ─────────────────────────────────────────────────────────────

export interface VendorRecord {
  id: string;
  payeeCode: string;
  payeeType: PayeeType;
  date: string;
  status: VendorStatus;
  beneficiaryData?: BeneficiaryData;
  employeeData?: EmployeeData;
  statutoryData?: StatutoryData;
  vendorData?: VendorData;
}

// ── Mock-fetch response shapes ────────────────────────────────────────────────

export interface PANFetchResult {
  name: string;
  status: 'Active' | 'Inactive' | 'Invalid';
}

export interface IFSCFetchResult {
  bankName: string;
  branchName: string;
  micr: string;
}

export interface GSTINFetchResult {
  legalName: string;
  tradeName: string;
  gstStatus: 'Active' | 'Cancelled' | 'Suspended';
}

// ── Filter / toolbar state ────────────────────────────────────────────────────

export type PayeeTypeFilter = 'All' | PayeeType;
export type StatusFilter = 'All' | VendorStatus;
