import type { ProcurementRecord } from './types';

// ── Constants ───────────────────────────────────────────────────────────────

export const FINANCIAL_YEARS = ['2023-24', '2024-25', '2025-26', '2026-27'];
export const CURRENT_FY = '2025-26';

export const WARD_OPTIONS = [
  'Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5',
  'Ward 6', 'Ward 7', 'Ward 8', 'Ward 9', 'Ward 10',
  'Ward 11', 'Ward 12', 'Ward 13', 'Ward 14', 'Ward 15',
];

export const GST_RATES = ['0', '5', '12', '18', '28'];

export const FILE_NO_OPTIONS = [
  { value: 'FN-2025-001', workName: 'Road Construction – MG Road, Ward 5' },
  { value: 'FN-2025-002', workName: 'Drainage System Upgrade – Ward 3' },
  { value: 'FN-2025-003', workName: 'Park Development – Nehru Nagar, Ward 8' },
  { value: 'FN-2025-004', workName: 'Street Lighting – Ward 12' },
  { value: 'FN-2025-005', workName: 'Water Pipeline Laying – Ward 7' },
];

export const SOURCE_OPTIONS = [
  '14th Finance Commission',
  'AMRUT 2.0',
  'State Government Grant',
  'Municipal Fund',
  'SMART City',
  'Central Road Fund',
];

export const SUB_SOURCE_MAP: Record<string, string[]> = {
  '14th Finance Commission': ['General FC', 'Tied FC – Water', 'Tied FC – Sanitation'],
  'AMRUT 2.0': ['Water Supply', 'Sewerage', 'Drainage', 'Green Spaces'],
  'State Government Grant': ['General', 'Infrastructure', 'Special'],
  'Municipal Fund': ['Own Revenue', 'Assigned Revenue'],
  'SMART City': ['Area Based Development', 'Pan City'],
  'Central Road Fund': ['Urban Roads', 'Rural Roads'],
};

export const VENDOR_OPTIONS = [
  { code: 'VEN-A-0001', name: 'M/s Infra Build Pvt Ltd', mobile: '9876543210' },
  { code: 'VEN-A-0002', name: 'M/s Road Works Co', mobile: '9123456789' },
  { code: 'VEN-A-0003', name: 'Suresh Constructions', mobile: '9988776655' },
  { code: 'VEN-A-0004', name: 'Karnataka Civil Works', mobile: '9845123456' },
  { code: 'VEN-A-0005', name: 'Kaveri Suppliers Ltd', mobile: '9900112233' },
];

export const WORK_RESERVATION_CATEGORIES = [
  'Open', 'SC/ST', 'OBC', 'Women', 'Minority', 'Ex-Servicemen',
];

export const SUPPLIER_TYPES = [
  'Manufacturer', 'Trader', 'Distributor', 'Dealer', 'Importer',
];

export const EXPENSE_TYPE_MAP: Record<string, string[]> = {
  Revenue: ['Repairs & Maintenance', 'Administrative Expenses', 'Salaries & Wages', 'Operational'],
  Capital: ['Infrastructure', 'Equipment', 'Buildings', 'Vehicles', 'Technology'],
};

export const CATEGORY_MAP: Record<string, string[]> = {
  'Repairs & Maintenance': ['Roads', 'Buildings', 'Drains', 'Water Supply Infra'],
  'Administrative Expenses': ['Office Supplies', 'Communication', 'Transport'],
  'Infrastructure': ['Roads & Bridges', 'Water Infrastructure', 'Sanitation', 'Parks & Gardens'],
  'Equipment': ['Heavy Machinery', 'Office Equipment', 'Lab Equipment', 'Street Furniture'],
  'Buildings': ['Municipal Office', 'Community Hall', 'Market Complex'],
  'Vehicles': ['Heavy Vehicle', 'Light Vehicle', 'Two Wheeler'],
};

export const CLASSIFICATION_MAP: Record<string, string[]> = {
  'Roads': ['Asphalt Road', 'Concrete Road', 'Interlock Paving'],
  'Roads & Bridges': ['Urban Road', 'Bridge', 'Flyover', 'Footpath', 'Culvert'],
  'Water Infrastructure': ['Pipeline', 'Reservoir', 'Pump Station', 'OHT'],
  'Heavy Machinery': ['Excavator', 'JCB', 'Road Roller', 'Tipper Truck'],
  'Parks & Gardens': ['Children Play Area', 'Walking Track', 'Open Gym'],
  'Sanitation': ['Sewerage Line', 'STP', 'Public Toilet'],
};

export const DOCUMENT_TYPES: Record<string, string[]> = {
  'Contractor': [
    'Tender Document',
    'Bid Document',
    'Work Order',
    'Schedule B',
    'Security Deposit Receipt',
    'Performance Bond',
    'Insurance Certificate',
  ],
  'Supplier – Product/Material': [
    'Quotation',
    'Purchase Order',
    'Delivery Challan',
    'Invoice',
    'Inspection Report',
    'Warranty Certificate',
  ],
  'Supplier – Service Provider': [
    'Service Agreement',
    'Work Order',
    'Manpower Details',
    'Compliance Certificate',
    'Payment Certificate',
  ],
  'Individual Payee': [
    'Petty Cash Voucher',
    'Invoice / Bill',
    'Completion Certificate',
  ],
};

// Statutory procurement config — set to true to render the Contractor form for statutory payees
export const STATUTORY_REQUIRES_PROCUREMENT = false;

// ── Helpers ─────────────────────────────────────────────────────────────────

export function computeCompletionDate(startDate: string, workDays: string): string {
  if (!startDate || !workDays) return '';
  const days = parseInt(workDays, 10);
  if (isNaN(days) || days <= 0) return '';
  const d = new Date(startDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function computeExtendedDate(completionDate: string, extensionDays: string): string {
  if (!completionDate || !extensionDays) return '';
  const days = parseInt(extensionDays, 10);
  if (isNaN(days) || days <= 0) return '';
  const d = new Date(completionDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return '—';
  const [y, m, d] = isoDate.split('-');
  return `${d}-${m}-${y}`;
}

export function formatAmount(val: string): string {
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

let procCounter = 5;
export function generateProcurementId(): string {
  return `proc-${++procCounter}`;
}

let fileNoteCounter = 4;
export function nextFileNoteNumber(): string {
  const year = new Date().getFullYear();
  return `FN${year}${String(++fileNoteCounter).padStart(4, '0')}`;
}

export function getEmptyRecord(): ProcurementRecord {
  return {
    id: '',
    financialYear: CURRENT_FY,
    date: new Date().toISOString().split('T')[0],
    payeeType: 'Vendor',
    vendorSubType: '',
    tenderType: '',
    notificationNo: '',
    notificationDate: '',
    fileNo: '',
    workName: '',
    ward: [],
    netValue: '',
    gstPercent: '18',
    actionPlan: false,
    actionPlanDate: '',
    actionPlanResolutionNumber: '',
    adminSanction: { date: '', number: '', by: '' },
    technicalSanction: { date: '', number: '', by: '' },
    loiNumber: '',
    loiDate: '',
    workReservationCategory: '',
    vendorCode: '',
    vendorName: '',
    vendorMobile: '',
    startDate: '',
    workDays: '',
    orderNo: '',
    orderDate: '',
    securityDepositRequired: false,
    securityDeposit: { amount: '', referenceNo: '', dateDeposited: '' },
    documents: [],
    extensionEnabled: false,
    extension: {
      actualStartDate: '',
      actualEndDate: '',
      extensionDays: '',
      extendedDate: '',
      swoNumber: '',
      swoGenerated: false,
    },
    assetDetails: { revenueCapital: '', expenseType: '', category: '', classification: '', assetName: '' },
    fileNoteNumber: '',
    fileNoteText: '',
    manpowerEntries: [],
    scheduleB: '',
    supplierType: '',
    sourcesOfFinancing: [{ id: 'src-1', source: '', subSource: '', amount: '' }],
    status: 'Work Order Initiated',
  };
}

// ── Mock async helpers ───────────────────────────────────────────────────────

export async function fetchVendorByCode(code: string) {
  await new Promise(r => setTimeout(r, 600));
  return VENDOR_OPTIONS.find(v => v.code === code) ?? null;
}

export async function fetchWorkByFileNo(fileNo: string) {
  await new Promise(r => setTimeout(r, 400));
  return FILE_NO_OPTIONS.find(f => f.value === fileNo)?.workName ?? '';
}

// ── Seed data ────────────────────────────────────────────────────────────────

export const PROC_SEED: ProcurementRecord[] = [
  {
    id: 'proc-1',
    financialYear: '2025-26',
    date: '2026-01-15',
    payeeType: 'Vendor',
    vendorSubType: 'Contractor',
    tenderType: 'E-Procurement',
    notificationNo: 'NOT-2026-001',
    notificationDate: '2025-12-01',
    fileNo: 'FN-2025-001',
    workName: 'Road Construction – MG Road, Ward 5',
    ward: ['Ward 5'],
    netValue: '2500000',
    gstPercent: '18',
    actionPlan: true,
    adminSanction: { date: '2025-11-10', number: 'AS-2025-001', by: 'Municipal Commissioner' },
    technicalSanction: { date: '2025-11-15', number: 'TS-2025-001', by: 'Chief Engineer' },
    loiNumber: 'LOI-2025-001',
    loiDate: '2025-12-10',
    workReservationCategory: 'Open',
    vendorCode: 'VEN-A-0001',
    vendorName: 'M/s Infra Build Pvt Ltd',
    vendorMobile: '9876543210',
    startDate: '2026-01-20',
    workDays: '120',
    orderNo: 'WO-2026-001',
    orderDate: '2026-01-15',
    securityDepositRequired: true,
    securityDeposit: { amount: '125000', referenceNo: 'SD-2026-001', dateDeposited: '2026-01-18' },
    documents: [
      { id: 'd1', docType: 'Tender Document', fileName: 'tender_doc_001.pdf' },
      { id: 'd2', docType: 'Work Order', fileName: 'work_order_001.pdf' },
    ],
    extensionEnabled: false,
    extension: { actualStartDate: '', actualEndDate: '', extensionDays: '', extendedDate: '', swoNumber: '', swoGenerated: false },
    assetDetails: { revenueCapital: 'Capital', expenseType: 'Infrastructure', category: 'Roads & Bridges', classification: 'Urban Road', assetName: 'MG Road Reconstruction' },
    fileNoteNumber: 'FN20260001',
    fileNoteText: 'Road construction work approved as per municipal council resolution dated 10-Nov-2025.',
    manpowerEntries: [],
    scheduleB: 'schedule_b_001.pdf',
    supplierType: '',
    sourcesOfFinancing: [{ id: 's1', source: 'AMRUT 2.0', subSource: 'Urban Roads', amount: '2500000' }],
    status: 'Approved & Shared',
    actionPlanDate: '2026-01-10',
    actionPlanResolutionNumber: 'APR-2026-002',
  },
  {
    id: 'proc-2',
    financialYear: '2025-26',
    date: '2026-02-01',
    payeeType: 'Vendor',
    vendorSubType: 'Supplier – Product/Material',
    tenderType: 'Quotation',
    notificationNo: 'NOT-2026-002',
    notificationDate: '2026-01-10',
    fileNo: 'FN-2025-004',
    workName: 'Street Lighting – Ward 12',
    ward: ['Ward 12'],
    netValue: '850000',
    gstPercent: '18',
    actionPlan: false,
    adminSanction: { date: '2025-12-20', number: 'AS-2025-012', by: 'Deputy Commissioner' },
    technicalSanction: { date: '2025-12-22', number: 'TS-2025-012', by: 'EE Electrical' },
    loiNumber: 'LOI-2026-002',
    loiDate: '2026-01-12',
    workReservationCategory: 'SC/ST',
    vendorCode: 'VEN-A-0005',
    vendorName: 'Kaveri Suppliers Ltd',
    vendorMobile: '9900112233',
    startDate: '2026-02-05',
    workDays: '30',
    orderNo: '',
    orderDate: '',
    securityDepositRequired: false,
    securityDeposit: { amount: '', referenceNo: '', dateDeposited: '' },
    documents: [{ id: 'd3', docType: 'Quotation', fileName: 'quotation_002.pdf' }],
    extensionEnabled: false,
    extension: { actualStartDate: '', actualEndDate: '', extensionDays: '', extendedDate: '', swoNumber: '', swoGenerated: false },
    assetDetails: { revenueCapital: 'Capital', expenseType: 'Equipment', category: 'Street Furniture', classification: 'Street Furniture', assetName: 'LED Street Lights – Ward 12' },
    fileNoteNumber: 'FN20260002',
    fileNoteText: 'Supply of LED street lights for Ward 12 under SMART City scheme.',
    manpowerEntries: [],
    scheduleB: '',
    supplierType: 'Manufacturer',
    sourcesOfFinancing: [{ id: 's2', source: 'Municipal Fund', subSource: 'Own Revenue', amount: '850000' }],
    status: 'Work Order Initiated',
    actionPlanDate: '2026-01-10',
    actionPlanResolutionNumber: 'APR-2026-002',
  },
  {
    id: 'proc-3',
    financialYear: '2025-26',
    date: '2025-11-15',
    payeeType: 'Vendor',
    vendorSubType: 'Supplier – Service Provider',
    tenderType: 'GeM',
    notificationNo: 'NOT-2025-003',
    notificationDate: '2025-10-20',
    fileNo: 'FN-2025-002',
    workName: 'Drainage System Upgrade – Ward 3',
    ward: ['Ward 3', 'Ward 4'],
    netValue: '1200000',
    gstPercent: '12',
    actionPlan: true,
    adminSanction: { date: '2025-10-05', number: 'AS-2025-003', by: 'Municipal Commissioner' },
    technicalSanction: { date: '2025-10-08', number: 'TS-2025-003', by: 'Chief Engineer' },
    loiNumber: 'LOI-2025-003',
    loiDate: '2025-10-25',
    workReservationCategory: 'Open',
    vendorCode: 'VEN-A-0002',
    vendorName: 'M/s Road Works Co',
    vendorMobile: '9123456789',
    startDate: '2025-11-20',
    workDays: '90',
    orderNo: 'WO-2025-003',
    orderDate: '2025-11-15',
    securityDepositRequired: false,
    securityDeposit: { amount: '', referenceNo: '', dateDeposited: '' },
    documents: [
      { id: 'd4', docType: 'Service Agreement', fileName: 'service_agmt_003.pdf' },
      { id: 'd5', docType: 'Work Order', fileName: 'wo_003.pdf' },
      { id: 'd6', docType: 'Manpower Details', fileName: 'manpower_003.pdf' },
    ],
    extensionEnabled: true,
    extension: { actualStartDate: '2025-11-20', actualEndDate: '2026-02-28', extensionDays: '30', extendedDate: '2026-03-29', swoNumber: 'SWO-2025-003', swoGenerated: true },
    assetDetails: { revenueCapital: 'Revenue', expenseType: 'Repairs & Maintenance', category: 'Drains', classification: 'Drains', assetName: '' },
    fileNoteNumber: 'FN20250003',
    fileNoteText: 'Drainage upgrade service for Ward 3 and Ward 4.',
    manpowerEntries: [
      { id: 'm1', name: 'Rajesh Kumar', pan: 'ABCDE1234F', accountNo: '1234567890', ifscCode: 'SBIN0001234', bankName: 'State Bank of India' },
      { id: 'm2', name: 'Suresh Patil', pan: 'PQRST5678G', accountNo: '9876543210', ifscCode: 'HDFC0001234', bankName: 'HDFC Bank' },
    ],
    scheduleB: '',
    supplierType: '',
    sourcesOfFinancing: [{ id: 's3', source: 'State Government Grant', subSource: 'Infrastructure', amount: '1200000' }],
    status: 'SWO Initiated',
    actionPlanDate: '2026-01-10',
    actionPlanResolutionNumber: 'APR-2026-002',
  },
  {
    id: 'proc-4',
    financialYear: '2025-26',
    date: '2026-01-08',
    payeeType: 'Vendor',
    vendorSubType: 'Individual Payee',
    tenderType: 'Direct Purchase',
    notificationNo: '',
    notificationDate: '',
    fileNo: 'FN-2025-003',
    workName: 'Park Development – Nehru Nagar, Ward 8',
    ward: ['Ward 8'],
    netValue: '45000',
    gstPercent: '5',
    actionPlan: false,
    adminSanction: { date: '', number: '', by: '' },
    technicalSanction: { date: '', number: '', by: '' },
    loiNumber: '',
    loiDate: '',
    workReservationCategory: '',
    vendorCode: 'VEN-A-0004',
    vendorName: 'Karnataka Civil Works',
    vendorMobile: '9845123456',
    startDate: '2026-01-10',
    workDays: '15',
    orderNo: '',
    orderDate: '',
    securityDepositRequired: false,
    securityDeposit: { amount: '', referenceNo: '', dateDeposited: '' },
    documents: [
      { id: 'd7', docType: 'Petty Cash Voucher', fileName: 'pcv_004.pdf' },
      { id: 'd8', docType: 'Invoice / Bill', fileName: 'invoice_004.pdf' },
      { id: 'd9', docType: 'Completion Certificate', fileName: 'cc_004.pdf' },
    ],
    extensionEnabled: false,
    extension: { actualStartDate: '', actualEndDate: '', extensionDays: '', extendedDate: '', swoNumber: '', swoGenerated: false },
    assetDetails: { revenueCapital: '', expenseType: '', category: '', classification: '', assetName: '' },
    fileNoteNumber: 'FN20260004',
    fileNoteText: 'Minor repairs and maintenance in park.',
    manpowerEntries: [],
    scheduleB: '',
    supplierType: '',
    sourcesOfFinancing: [{ id: 's4', source: 'Municipal Fund', subSource: 'Own Revenue', amount: '45000' }],
    status: 'Send Back for Corrections',
    actionPlanDate: '2026-01-10',
    actionPlanResolutionNumber: 'APR-2026-002',
  },
  {
    id: 'proc-5',
    financialYear: '2024-25',
    date: '2025-08-20',
    payeeType: 'Vendor',
    vendorSubType: 'Contractor',
    tenderType: 'E-Procurement',
    notificationNo: 'NOT-2025-005',
    notificationDate: '2025-07-15',
    fileNo: 'FN-2025-005',
    workName: 'Water Pipeline Laying – Ward 7',
    ward: ['Ward 7'],
    netValue: '5000000',
    gstPercent: '18',
    actionPlan: true,
    adminSanction: { date: '2025-07-01', number: 'AS-2025-005', by: 'Municipal Commissioner' },
    technicalSanction: { date: '2025-07-05', number: 'TS-2025-005', by: 'Chief Engineer' },
    loiNumber: 'LOI-2025-005',
    loiDate: '2025-07-20',
    workReservationCategory: 'Open',
    vendorCode: 'VEN-A-0003',
    vendorName: 'Suresh Constructions',
    vendorMobile: '9988776655',
    startDate: '2025-08-25',
    workDays: '180',
    orderNo: 'WO-2025-005',
    orderDate: '2025-08-20',
    securityDepositRequired: true,
    securityDeposit: { amount: '250000', referenceNo: 'SD-2025-005', dateDeposited: '2025-08-22' },
    documents: [
      { id: 'd10', docType: 'Tender Document', fileName: 'tender_005.pdf' },
      { id: 'd11', docType: 'Work Order', fileName: 'wo_005.pdf' },
    ],
    extensionEnabled: false,
    extension: { actualStartDate: '', actualEndDate: '', extensionDays: '', extendedDate: '', swoNumber: '', swoGenerated: false },
    assetDetails: { revenueCapital: 'Capital', expenseType: 'Infrastructure', category: 'Water Infrastructure', classification: 'Pipeline', assetName: 'Ward 7 Water Pipeline' },
    fileNoteNumber: 'FN20250005',
    fileNoteText: 'Water pipeline work for Ward 7 under AMRUT 2.0.',
    manpowerEntries: [],
    scheduleB: 'schedule_b_005.pdf',
    supplierType: '',
    sourcesOfFinancing: [{ id: 's5', source: 'AMRUT 2.0', subSource: 'Water Supply', amount: '5000000' }],
    status: 'Work Order Initiated',
    actionPlanDate: '2026-01-10',
    actionPlanResolutionNumber: 'APR-2026-002',
  },
];
