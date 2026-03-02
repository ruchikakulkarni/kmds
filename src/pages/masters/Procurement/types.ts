export type PayeeType = 'Beneficiary' | 'Employee' | 'Statutory' | 'Vendor';

export type VendorSubType =
  | 'Contractor'
  | 'Supplier – Product/Material'
  | 'Supplier – Service Provider'
  | 'Individual Payee';

export type TenderType = 'Quotation' | 'E-Procurement' | 'GeM' | 'Direct Purchase';

export type ProcurementStatus =
  | 'Work Order Initiated'
  | 'Approved & Shared'
  | 'SWO Initiated'
  | 'Send Back for Corrections';

export interface SourceRow {
  id: string;
  source: string;
  subSource: string;
  amount: string;
}

export interface SanctionInfo {
  date: string;
  number: string;
  by: string;
}

export interface SecurityDepositInfo {
  amount: string;
  referenceNo: string;
  dateDeposited: string;
}

export interface ManpowerEntry {
  id: string;
  name: string;
  pan: string;
  accountNo: string;
  ifscCode: string;
  bankName: string;
}

export interface DocumentFile {
  id: string;
  docType: string;
  fileName: string;
}

export interface ExtensionInfo {
  actualStartDate: string;
  actualEndDate: string;
  extensionDays: string;
  extendedDate: string;
  swoNumber: string;
  swoGenerated: boolean;
}

export interface AssetDetailsInfo {
  revenueCapital: 'Revenue' | 'Capital' | '';
  expenseType: string;
  category: string;
  classification: string;
  assetName: string;
}

export interface ProcurementRecord {
  id: string;
  financialYear: string;
  date: string;
  payeeType: PayeeType;
  vendorSubType: VendorSubType | '';
  tenderType: TenderType | '';
  notificationNo: string;
  notificationDate: string;
  fileNo: string;
  workName: string;
  ward: string[];
  netValue: string;
  gstPercent: string;
  actionPlan: boolean;
  actionPlanDate: string;
  actionPlanResolutionNumber: string;
  adminSanction: SanctionInfo;
  technicalSanction: SanctionInfo;
  loiNumber: string;
  loiDate: string;
  workReservationCategory: string;
  vendorCode: string;
  vendorName: string;
  vendorMobile: string;
  startDate: string;
  workDays: string;
  orderNo: string;
  orderDate: string;
  securityDepositRequired: boolean;
  securityDeposit: SecurityDepositInfo;
  documents: DocumentFile[];
  extensionEnabled: boolean;
  extension: ExtensionInfo;
  assetDetails: AssetDetailsInfo;
  fileNoteNumber: string;
  fileNoteText: string;
  manpowerEntries: ManpowerEntry[];
  scheduleB: string;
  supplierType: string;
  sourcesOfFinancing: SourceRow[];
  status: ProcurementStatus;
}
