import type {
  SubService,
  ServiceOption,
  AccountTypeOption,
  CompositeOption,
  FundOption,
  BankAccountOption,
} from './types';

/* ── Reference data ──────────────────────────────────────────────────────── */

export const SERVICE_OPTIONS: ServiceOption[] = [
  { id: 1, code: 'SVC-001', name: 'Property Tax' },
  { id: 2, code: 'SVC-002', name: 'Water Supply' },
  { id: 3, code: 'SVC-003', name: 'Solid Waste Management' },
  { id: 4, code: 'SVC-004', name: 'Building Permission' },
  { id: 5, code: 'SVC-005', name: 'Trade License' },
  { id: 6, code: 'SVC-006', name: 'Birth Certificate' },
  { id: 7, code: 'SVC-007', name: 'Death Certificate' },
];

export const ACCOUNT_TYPE_OPTIONS: AccountTypeOption[] = [
  { id: 1, code: '1', name: 'Income' },
  { id: 2, code: '2', name: 'Expenditure' },
  { id: 3, code: '3', name: 'Assets' },
  { id: 4, code: '4', name: 'Liabilities' },
];

/** Flat detail-code composites derived from AccountCode seed data */
export const COMPOSITE_OPTIONS: CompositeOption[] = [
  // Income (AT=1)
  { code: '101001000100001', description: 'General Residential',  accountTypeId: 1 },
  { code: '101001000100002', description: 'Slum / Low-Income',    accountTypeId: 1 },
  { code: '101001000200001', description: 'Retail Commercial',    accountTypeId: 1 },
  { code: '101001000200002', description: 'Office / Corporate',   accountTypeId: 1 },
  { code: '101001000300001', description: 'Light Industry',       accountTypeId: 1 },
  { code: '101002000100001', description: 'Private Hoardings',    accountTypeId: 1 },
  { code: '101002000100002', description: 'Government Hoardings', accountTypeId: 1 },
  { code: '102001000100001', description: 'Domestic Metered',     accountTypeId: 1 },
  { code: '102001000100002', description: 'Commercial Metered',   accountTypeId: 1 },
  // Expenditure (AT=2)
  { code: '201001000100001', description: 'Grade I Officers',     accountTypeId: 2 },
  { code: '201001000100002', description: 'Grade II Officers',    accountTypeId: 2 },
  // Assets (AT=3)
  { code: '301001000100001', description: 'Dry Land',             accountTypeId: 3 },
  // Liabilities (AT=4)
  { code: '401001000100001', description: 'Long-term HUDCO',      accountTypeId: 4 },
];

export const FUND_OPTIONS: FundOption[] = [
  { id: 'gen', name: 'General Fund' },
  { id: 'ws',  name: 'Water Supply Fund' },
  { id: 'sw',  name: 'Solid Waste Management Fund' },
  { id: 'uif', name: 'Urban Infrastructure Fund' },
  { id: 'edu', name: 'Education Fund' },
];

/** Bank accounts available for ULB mapping */
export const BANK_ACCOUNT_OPTIONS: BankAccountOption[] = [
  { id: '1', label: 'SBI BLG MAIN – XXXXXXX8901 (General Fund)',        shortName: 'SBI BLG MAIN' },
  { id: '2', label: 'CNB BLG – XXXXXX3210 (Water Supply Fund)',         shortName: 'CNB BLG' },
  { id: '3', label: 'BOB SW FUND – XXXXXXXXXX6677 (Solid Waste Fund)',  shortName: 'BOB SW FUND' },
];

/* ── Seed sub-services ───────────────────────────────────────────────────── */
export const INITIAL_SUB_SERVICES: SubService[] = [
  {
    id: 1,
    subServiceCode: 'SSV-001',
    nameEnglish: 'Residential Property Tax',
    nameKannada: 'ವಸತಿ ಆಸ್ತಿ ತೆರಿಗೆ',
    serviceId: 1, serviceName: 'Property Tax',   serviceCode: 'SVC-001',
    accountTypeId: 1, accountTypeName: 'Income',
    compositeCode: '101001000100001', compositeDescription: 'General Residential',
    fundId: 'gen', fundName: 'General Fund',
    status: 'Active',
    mappedBankAccountId: '1', mappedBankAccountLabel: 'SBI BLG MAIN',
  },
  {
    id: 2,
    subServiceCode: 'SSV-002',
    nameEnglish: 'Commercial Property Tax',
    nameKannada: 'ವಾಣಿಜ್ಯ ಆಸ್ತಿ ತೆರಿಗೆ',
    serviceId: 1, serviceName: 'Property Tax',   serviceCode: 'SVC-001',
    accountTypeId: 1, accountTypeName: 'Income',
    compositeCode: '101001000200001', compositeDescription: 'Retail Commercial',
    fundId: 'gen', fundName: 'General Fund',
    status: 'Active',
    mappedBankAccountId: '', mappedBankAccountLabel: '',
  },
  {
    id: 3,
    subServiceCode: 'SSV-003',
    nameEnglish: 'Domestic Water Connection',
    nameKannada: 'ಮನೆ ನೀರು ಸಂಪರ್ಕ',
    serviceId: 2, serviceName: 'Water Supply',   serviceCode: 'SVC-002',
    accountTypeId: 1, accountTypeName: 'Income',
    compositeCode: '102001000100001', compositeDescription: 'Domestic Metered',
    fundId: 'ws', fundName: 'Water Supply Fund',
    status: 'Active',
    mappedBankAccountId: '2', mappedBankAccountLabel: 'CNB BLG',
  },
  {
    id: 4,
    subServiceCode: 'SSV-004',
    nameEnglish: 'Commercial Water Connection',
    nameKannada: 'ವಾಣಿಜ್ಯ ನೀರು ಸಂಪರ್ಕ',
    serviceId: 2, serviceName: 'Water Supply',   serviceCode: 'SVC-002',
    accountTypeId: 1, accountTypeName: 'Income',
    compositeCode: '102001000100002', compositeDescription: 'Commercial Metered',
    fundId: 'ws', fundName: 'Water Supply Fund',
    status: 'Active',
    mappedBankAccountId: '', mappedBankAccountLabel: '',
  },
  {
    id: 5,
    subServiceCode: 'SSV-005',
    nameEnglish: 'Household Waste Collection',
    nameKannada: 'ಮನೆ ತ್ಯಾಜ್ಯ ಸಂಗ್ರಹ',
    serviceId: 3, serviceName: 'Solid Waste Management', serviceCode: 'SVC-003',
    accountTypeId: 1, accountTypeName: 'Income',
    compositeCode: '101001000100001', compositeDescription: 'General Residential',
    fundId: 'sw', fundName: 'Solid Waste Management Fund',
    status: 'Active',
    mappedBankAccountId: '3', mappedBankAccountLabel: 'BOB SW FUND',
  },
  {
    id: 6,
    subServiceCode: 'SSV-006',
    nameEnglish: 'New Construction Permission',
    nameKannada: 'ಹೊಸ ನಿರ್ಮಾಣ ಅನುಮತಿ',
    serviceId: 4, serviceName: 'Building Permission', serviceCode: 'SVC-004',
    accountTypeId: 1, accountTypeName: 'Income',
    compositeCode: '101001000200001', compositeDescription: 'Retail Commercial',
    fundId: 'gen', fundName: 'General Fund',
    status: 'Active',
    mappedBankAccountId: '', mappedBankAccountLabel: '',
  },
  {
    id: 7,
    subServiceCode: 'SSV-007',
    nameEnglish: 'New Trade License',
    nameKannada: 'ಹೊಸ ವ್ಯಾಪಾರ ಪರವಾನಗಿ',
    serviceId: 5, serviceName: 'Trade License', serviceCode: 'SVC-005',
    accountTypeId: 1, accountTypeName: 'Income',
    compositeCode: '101001000200002', compositeDescription: 'Office / Corporate',
    fundId: 'gen', fundName: 'General Fund',
    status: 'Active',
    mappedBankAccountId: '1', mappedBankAccountLabel: 'SBI BLG MAIN',
  },
  {
    id: 8,
    subServiceCode: 'SSV-008',
    nameEnglish: 'Trade License Renewal',
    nameKannada: 'ವ್ಯಾಪಾರ ಪರವಾನಗಿ ನವೀಕರಣ',
    serviceId: 5, serviceName: 'Trade License', serviceCode: 'SVC-005',
    accountTypeId: 1, accountTypeName: 'Income',
    compositeCode: '101001000300001', compositeDescription: 'Light Industry',
    fundId: 'gen', fundName: 'General Fund',
    status: 'Inactive',
    mappedBankAccountId: '', mappedBankAccountLabel: '',
  },
  {
    id: 9,
    subServiceCode: 'SSV-009',
    nameEnglish: 'Birth Certificate - New',
    nameKannada: 'ಜನನ ಪ್ರಮಾಣ ಪತ್ರ - ಹೊಸ',
    serviceId: 6, serviceName: 'Birth Certificate', serviceCode: 'SVC-006',
    accountTypeId: 1, accountTypeName: 'Income',
    compositeCode: '102001000100002', compositeDescription: 'Commercial Metered',
    fundId: 'gen', fundName: 'General Fund',
    status: 'Active',
    mappedBankAccountId: '', mappedBankAccountLabel: '',
  },
];
