import type {
  VendorRecord,
  PayeeType,
  EmployeeType,
  PANFetchResult,
  IFSCFetchResult,
  GSTINFetchResult,
} from './types';

// ── Seed data ─────────────────────────────────────────────────────────────────

export const VENDOR_SEED: VendorRecord[] = [
  // 3 Vendor payees
  {
    id: 'v1',
    payeeCode: 'VEN-A-0001',
    payeeType: 'Vendor',
    date: '2025-04-01',
    status: 'Active',
    vendorData: {
      pan: 'AAACV1234C',
      panName: 'M/s Infra Build Pvt Ltd',
      panStatus: 'Active',
      msmeRegistered: 'Yes',
      udyamRegistrationNo: 'UDYAM-KA-07-0001234',
      k2RecipientId: 'K2-REC-001',
      pfmsVendorId: 'PFMS-VEN-9001',
      address: {
        addressLine1: '14, Industrial Estate, Dharwad Road',
        addressLine2: 'Near KIADB Gate',
        district: 'Belagavi',
        talukCity: 'Belagavi',
        state: 'Karnataka',
        pinCode: '590010',
        contactPersonName: 'Ramesh Kumar',
        mobile: '9845012345',
        email: 'ramesh@infrabuild.co.in',
      },
      bank: {
        accountNumber: '50200012345678',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
        branchName: 'Belagavi Branch',
        micr: '590240003',
      },
      gst: {
        gstRegistered: 'Yes',
        gstin: '29AAACV1234C1Z5',
        legalName: 'Infra Build Private Limited',
        tradeName: 'Infra Build',
        gstStatus: 'Active',
      },
    },
  },
  {
    id: 'v2',
    payeeCode: 'VEN-A-0002',
    payeeType: 'Vendor',
    date: '2025-06-15',
    status: 'Active',
    vendorData: {
      pan: 'BBBCV5678D',
      panName: 'Karnataka Road Works',
      panStatus: 'Active',
      msmeRegistered: 'No',
      udyamRegistrationNo: '',
      k2RecipientId: 'K2-REC-002',
      pfmsVendorId: 'PFMS-VEN-9002',
      address: {
        addressLine1: '22, MG Road, Hubli',
        addressLine2: '',
        district: 'Dharwad',
        talukCity: 'Hubli',
        state: 'Karnataka',
        pinCode: '580020',
        contactPersonName: 'Shiva Naik',
        mobile: '9900112233',
        email: 'shivaworks@karnroad.com',
      },
      bank: {
        accountNumber: '33201234567890',
        ifscCode: 'SBIN0004567',
        bankName: 'State Bank of India',
        branchName: 'Hubli Main',
        micr: '580002001',
      },
      gst: {
        gstRegistered: 'Yes',
        gstin: '29BBBCV5678D1Z3',
        legalName: 'Karnataka Road Works',
        tradeName: 'KRW',
        gstStatus: 'Active',
      },
    },
  },
  {
    id: 'v3',
    payeeCode: 'VEN-A-0003',
    payeeType: 'Vendor',
    date: '2024-11-01',
    status: 'Inactive',
    vendorData: {
      pan: 'CCCPV9999E',
      panName: 'Apex Constructions',
      panStatus: 'Inactive',
      msmeRegistered: 'No',
      udyamRegistrationNo: '',
      k2RecipientId: '',
      pfmsVendorId: '',
      address: {
        addressLine1: '5, Old Station Road',
        addressLine2: 'Opp. Bus Stand',
        district: 'Mysuru',
        talukCity: 'Mysuru',
        state: 'Karnataka',
        pinCode: '570001',
        contactPersonName: 'Priya Sharma',
        mobile: '9123456789',
        email: 'priya@apexcon.in',
      },
      bank: {
        accountNumber: '0259000123456',
        ifscCode: 'CNRB0005678',
        bankName: 'Canara Bank',
        branchName: 'Mysuru Branch',
        micr: '570015002',
      },
      gst: {
        gstRegistered: 'No',
        gstin: '',
        legalName: '',
        tradeName: '',
        gstStatus: '',
      },
    },
  },
  // 2 Statutory payees
  {
    id: 's1',
    payeeCode: 'STY-0001',
    payeeType: 'Statutory',
    date: '2025-01-01',
    status: 'Active',
    statutoryData: {
      statutoryPaymentType: 'TDS',
      pan: 'AADCG1234F',
      panName: 'Income Tax Department',
      panStatus: 'Active',
      address: {
        addressLine1: 'Aayakar Bhavan, Palace Road',
        addressLine2: '',
        district: 'Bengaluru Urban',
        talukCity: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560001',
        contactPersonName: 'AO Office',
        mobile: '8022345678',
        email: 'tds.bangalore@incometax.gov.in',
      },
      bank: {
        accountNumber: '10001234567',
        ifscCode: 'RBIS0GOVIND',
        bankName: 'Reserve Bank of India',
        branchName: 'Government Branch',
        micr: '560006001',
      },
      gst: {
        gstRegistered: 'No',
        gstin: '',
        legalName: '',
        tradeName: '',
        gstStatus: '',
      },
    },
  },
  {
    id: 's2',
    payeeCode: 'STY-0002',
    payeeType: 'Statutory',
    date: '2025-01-01',
    status: 'Active',
    statutoryData: {
      statutoryPaymentType: 'PF',
      pan: 'AAECP5678G',
      panName: 'Employees Provident Fund Organisation',
      panStatus: 'Active',
      address: {
        addressLine1: 'EPF Office, Rajajinagar, 2nd Block',
        addressLine2: '',
        district: 'Bengaluru Urban',
        talukCity: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560010',
        contactPersonName: 'RPF Commissioner',
        mobile: '8023456789',
        email: 'epfo.blr@epfindia.gov.in',
      },
      bank: {
        accountNumber: '20012345678',
        ifscCode: 'SBIN0009999',
        bankName: 'State Bank of India',
        branchName: 'EPF Branch',
        micr: '560002099',
      },
      gst: {
        gstRegistered: 'No',
        gstin: '',
        legalName: '',
        tradeName: '',
        gstStatus: '',
      },
    },
  },
  // 2 Employee payees
  {
    id: 'e1',
    payeeCode: 'EMP-KAR-PER-0101-0001',
    payeeType: 'Employee',
    date: '2023-06-01',
    status: 'Active',
    employeeData: {
      employeeType: 'Permanent',
      name: 'Anand Patil',
      designation: 'Junior Engineer',
      department: 'Civil Works',
      kgid: 'KG-2023-4501',
      hrmsId: 'HRMS-BLG-1023',
      k2Id: 'K2-EMP-0023',
      mobile: '9876501111',
      email: 'anand.patil@belgaviulb.gov.in',
      endDate: '',
    },
  },
  {
    id: 'e2',
    payeeCode: 'EMP-KAR-CON-0106-0002',
    payeeType: 'Employee',
    date: '2025-06-01',
    status: 'Active',
    employeeData: {
      employeeType: 'Contract',
      name: 'Meena Desai',
      designation: 'Data Entry Operator',
      department: 'Accounts',
      kgid: '',
      hrmsId: '',
      k2Id: '',
      mobile: '9900223344',
      email: 'meena.desai@belgaviulb.gov.in',
      endDate: '2026-05-31',
    },
  },
  // 1 Beneficiary payee
  {
    id: 'b1',
    payeeCode: 'BEN-KAR-2526-0001',
    payeeType: 'Beneficiary',
    date: '2025-08-10',
    status: 'Active',
    beneficiaryData: {
      schemeId: '1',
      schemeName: 'Indira Gandhi National Old Age Pension',
      schemeFrequency: 'Annually',
      financialYear: '2025-26',
      beneficiaries: [
        {
          id: 'ben-001',
          name: 'Kamlabai Hosamani',
          aadhaar: '987654321012',
          mobile: '9845678901',
          bankAccount: '11223344556',
          ifsc: 'SBIN0001111',
        },
        {
          id: 'ben-002',
          name: 'Siddappa Meti',
          aadhaar: '123456789012',
          mobile: '8765432190',
          bankAccount: '99887766554',
          ifsc: 'CNRB0002222',
        },
      ],
    },
  },
];

// ── Code series counters (seeded from SEED array) ────────────────────────────

let vendorSeries = 3;
let statSeries = 2;
let empSeries = 2;
let benSeries = 1;

// ── Code generator ────────────────────────────────────────────────────────────

export function generatePayeeCode(
  type: PayeeType,
  employeeType?: EmployeeType | '',
): string {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yr = today.getFullYear();
  const fyStart = today.getMonth() >= 3 ? yr : yr - 1;
  const fy = `${fyStart % 100}${(fyStart + 1) % 100}`;

  switch (type) {
    case 'Beneficiary': {
      benSeries += 1;
      return `BEN-KAR-${fy}-${String(benSeries).padStart(4, '0')}`;
    }
    case 'Employee': {
      empSeries += 1;
      const typeCode =
        employeeType === 'Permanent' ? 'PER' : employeeType === 'Temporary' ? 'TMP' : 'CON';
      return `EMP-KAR-${typeCode}-${dd}${mm}-${String(empSeries).padStart(4, '0')}`;
    }
    case 'Statutory': {
      statSeries += 1;
      return `STY-${String(statSeries).padStart(4, '0')}`;
    }
    case 'Vendor': {
      vendorSeries += 1;
      const alphaIdx = Math.floor((vendorSeries - 1) / 9999);
      const alpha = String.fromCharCode(65 + (alphaIdx % 26));
      const num = ((vendorSeries - 1) % 9999) + 1;
      return `VEN-${alpha}-${String(num).padStart(4, '0')}`;
    }
    default:
      return '';
  }
}

// ── Mock async fetch functions ────────────────────────────────────────────────

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const PAN_MOCK: Record<string, PANFetchResult> = {
  'AAACV1234C': { name: 'M/s Infra Build Pvt Ltd', status: 'Active' },
  'BBBCV5678D': { name: 'Karnataka Road Works', status: 'Active' },
  'CCCPV9999E': { name: 'Apex Constructions', status: 'Inactive' },
  'AADCG1234F': { name: 'Income Tax Department', status: 'Active' },
  'AAECP5678G': { name: 'Employees Provident Fund Organisation', status: 'Active' },
};

const IFSC_MOCK: Record<string, IFSCFetchResult> = {
  'HDFC0001234': { bankName: 'HDFC Bank', branchName: 'Belagavi Branch', micr: '590240003' },
  'SBIN0004567': { bankName: 'State Bank of India', branchName: 'Hubli Main', micr: '580002001' },
  'CNRB0005678': { bankName: 'Canara Bank', branchName: 'Mysuru Branch', micr: '570015002' },
  'RBIS0GOVIND': { bankName: 'Reserve Bank of India', branchName: 'Government Branch', micr: '560006001' },
  'SBIN0009999': { bankName: 'State Bank of India', branchName: 'EPF Branch', micr: '560002099' },
};

const GSTIN_MOCK: Record<string, GSTINFetchResult> = {
  '29AAACV1234C1Z5': {
    legalName: 'Infra Build Private Limited',
    tradeName: 'Infra Build',
    gstStatus: 'Active',
  },
  '29BBBCV5678D1Z3': {
    legalName: 'Karnataka Road Works',
    tradeName: 'KRW',
    gstStatus: 'Active',
  },
};

export async function fetchPANDetails(pan: string): Promise<PANFetchResult> {
  await delay(800);
  return PAN_MOCK[pan.toUpperCase()] ?? { name: 'Unknown Entity', status: 'Invalid' };
}

export async function fetchBankByIFSC(ifsc: string): Promise<IFSCFetchResult> {
  await delay(800);
  return (
    IFSC_MOCK[ifsc.toUpperCase()] ?? {
      bankName: 'Unknown Bank',
      branchName: 'Unknown Branch',
      micr: '000000000',
    }
  );
}

export async function fetchGSTByGSTIN(gstin: string): Promise<GSTINFetchResult> {
  await delay(800);
  return (
    GSTIN_MOCK[gstin.toUpperCase()] ?? {
      legalName: 'Unknown',
      tradeName: 'Unknown',
      gstStatus: 'Cancelled',
    }
  );
}

// ── Scheme reference data (mirrors BeneficiarySchemes module) ─────────────────

export const SCHEME_OPTIONS = [
  { id: '1', name: 'Indira Gandhi National Old Age Pension', frequency: 'Annually' },
  { id: '2', name: 'National Family Benefit Scheme', frequency: 'Once in lifetime' },
  { id: '3', name: 'Widow Pension Scheme', frequency: 'Annually' },
  { id: '4', name: 'Disability Pension Scheme', frequency: 'Annually' },
  { id: '5', name: 'Chief Minister Relief Fund', frequency: 'Once in lifetime' },
];

// ── State list ────────────────────────────────────────────────────────────────

export const STATE_OPTIONS = [
  'Andhra Pradesh',
  'Karnataka',
  'Kerala',
  'Maharashtra',
  'Tamil Nadu',
  'Telangana',
  'Goa',
];
