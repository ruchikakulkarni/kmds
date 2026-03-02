import type { AccountType, MajorHead, MinorHead, SubHead, DetailCode } from './types';

/* ── Level 1: Account Types ─────────────────────────────────────────────── */
export const INITIAL_ACCOUNT_TYPES: AccountType[] = [
  { id: 1, code: '1', category: 'Income',    nameEnglish: 'Income',      nameKannada: 'ಆದಾಯ',            status: 'Active' },
  { id: 2, code: '2', category: 'Expense',   nameEnglish: 'Expenditure', nameKannada: 'ವೆಚ್ಚ',            status: 'Active' },
  { id: 3, code: '3', category: 'Asset',     nameEnglish: 'Assets',      nameKannada: 'ಆಸ್ತಿಗಳು',        status: 'Active' },
  { id: 4, code: '4', category: 'Liability', nameEnglish: 'Liabilities', nameKannada: 'ಹೊಣೆಗಾರಿಕೆಗಳು',  status: 'Active' },
];

/* ── Level 2: Major Heads ────────────────────────────────────────────────── */
// Composite = accountType.code + majorHead.code  (2 digits total)
export const INITIAL_MAJOR_HEADS: MajorHead[] = [
  // Under Income (1)
  { id:  1, accountTypeId: 1, code: '1', nameEnglish: 'Tax Revenue',              nameKannada: 'ತೆರಿಗೆ ರಾಜಸ್ವ',                status: 'Active' },
  { id:  2, accountTypeId: 1, code: '2', nameEnglish: 'Non-Tax Revenue',          nameKannada: 'ತೆರಿಗೆರಹಿತ ರಾಜಸ್ವ',           status: 'Active' },
  { id:  3, accountTypeId: 1, code: '3', nameEnglish: 'Grants & Contributions',   nameKannada: 'ಅನುದಾನ ಮತ್ತು ಕೊಡುಗೆ',        status: 'Active' },
  // Under Expenditure (2)
  { id:  4, accountTypeId: 2, code: '1', nameEnglish: 'Establishment Expenses',   nameKannada: 'ಸ್ಥಾಪನೆ ವೆಚ್ಚ',               status: 'Active' },
  { id:  5, accountTypeId: 2, code: '2', nameEnglish: 'Operations & Maintenance', nameKannada: 'ಕಾರ್ಯಾಚರಣೆ ಮತ್ತು ನಿರ್ವಹಣೆ',   status: 'Active' },
  { id:  6, accountTypeId: 2, code: '3', nameEnglish: 'Debt Servicing',           nameKannada: 'ಸಾಲ ಸೇವೆ',                   status: 'Active' },
  // Under Assets (3)
  { id:  7, accountTypeId: 3, code: '1', nameEnglish: 'Fixed Assets',             nameKannada: 'ಸ್ಥಿರ ಆಸ್ತಿ',                  status: 'Active' },
  { id:  8, accountTypeId: 3, code: '2', nameEnglish: 'Current Assets',           nameKannada: 'ಚಾಲ್ತಿ ಆಸ್ತಿ',                 status: 'Active' },
  // Under Liabilities (4)
  { id:  9, accountTypeId: 4, code: '1', nameEnglish: 'Long-term Liabilities',    nameKannada: 'ದೀರ್ಘಕಾಲೀನ ಹೊಣೆಗಾರಿಕೆ',      status: 'Active' },
  { id: 10, accountTypeId: 4, code: '2', nameEnglish: 'Current Liabilities',      nameKannada: 'ಚಾಲ್ತಿ ಹೊಣೆಗಾರಿಕೆ',           status: 'Active' },
];

/* ── Level 3: Minor Heads ────────────────────────────────────────────────── */
// Composite = accountType.code + majorHead.code + minorHead.code  (3 digits total)
export const INITIAL_MINOR_HEADS: MinorHead[] = [
  // Under Tax Revenue (majorHeadId=1, compositePrefix=11)
  { id:  1, majorHeadId: 1, code: '1', nameEnglish: 'Property Tax',               nameKannada: 'ಆಸ್ತಿ ತೆರಿಗೆ',               status: 'Active' },
  { id:  2, majorHeadId: 1, code: '2', nameEnglish: 'Advertisement Tax',          nameKannada: 'ಜಾಹೀರಾತು ತೆರಿಗೆ',            status: 'Active' },
  { id:  3, majorHeadId: 1, code: '3', nameEnglish: 'Entertainment Tax',          nameKannada: 'ಮನೋರಂಜನೆ ತೆರಿಗೆ',            status: 'Inactive' },
  // Under Non-Tax Revenue (majorHeadId=2, prefix=12)
  { id:  4, majorHeadId: 2, code: '1', nameEnglish: 'Water & Sewerage Charges',   nameKannada: 'ನೀರು ಮತ್ತು ಒಳಚರಂಡಿ ಶುಲ್ಕ',   status: 'Active' },
  { id:  5, majorHeadId: 2, code: '2', nameEnglish: 'Rental Income',              nameKannada: 'ಬಾಡಿಗೆ ಆದಾಯ',               status: 'Active' },
  // Under Grants (majorHeadId=3, prefix=13)
  { id:  6, majorHeadId: 3, code: '1', nameEnglish: 'SFC Grants',                 nameKannada: 'ರಾಜ್ಯ ಹಣಕಾಸು ಆಯೋಗ ಅನುದಾನ',  status: 'Active' },
  { id:  7, majorHeadId: 3, code: '2', nameEnglish: 'CFC Grants',                 nameKannada: 'ಕೇಂದ್ರ ಹಣಕಾಸು ಆಯೋಗ ಅನುದಾನ', status: 'Active' },
  // Under Establishment (majorHeadId=4, prefix=21)
  { id:  8, majorHeadId: 4, code: '1', nameEnglish: 'Salaries & Wages',           nameKannada: 'ಸಂಬಳ ಮತ್ತು ವೇತನ',             status: 'Active' },
  { id:  9, majorHeadId: 4, code: '2', nameEnglish: 'Pensions & Gratuities',      nameKannada: 'ಪಿಂಚಣಿ ಮತ್ತು ಉಪದಾನ',          status: 'Active' },
  // Under O&M (majorHeadId=5, prefix=22)
  { id: 10, majorHeadId: 5, code: '1', nameEnglish: 'Repairs & Maintenance',      nameKannada: 'ದುರಸ್ತಿ ಮತ್ತು ನಿರ್ವಹಣೆ',       status: 'Active' },
  // Under Fixed Assets (majorHeadId=7, prefix=31)
  { id: 11, majorHeadId: 7, code: '1', nameEnglish: 'Land',                       nameKannada: 'ಭೂಮಿ',                        status: 'Active' },
  { id: 12, majorHeadId: 7, code: '2', nameEnglish: 'Buildings',                  nameKannada: 'ಕಟ್ಟಡ',                       status: 'Active' },
  // Under Long-term Liabilities (majorHeadId=9, prefix=41)
  { id: 13, majorHeadId: 9, code: '1', nameEnglish: 'State Government Loans',     nameKannada: 'ರಾಜ್ಯ ಸರ್ಕಾರ ಸಾಲ',            status: 'Active' },
];

/* ── Level 4: Sub Heads ──────────────────────────────────────────────────── */
// Composite = accountType.code + majorHead.code + minorHead.code + subHead.code  (4 digits total)
export const INITIAL_SUB_HEADS: SubHead[] = [
  // Under Property Tax (minorHeadId=1, prefix=111)
  { id: 1, minorHeadId:  1, code: '1', nameEnglish: 'Residential Property',    nameKannada: 'ವಸತಿ ಆಸ್ತಿ',              status: 'Active' },
  { id: 2, minorHeadId:  1, code: '2', nameEnglish: 'Commercial Property',     nameKannada: 'ವಾಣಿಜ್ಯ ಆಸ್ತಿ',           status: 'Active' },
  { id: 3, minorHeadId:  1, code: '3', nameEnglish: 'Industrial Property',     nameKannada: 'ಕೈಗಾರಿಕಾ ಆಸ್ತಿ',          status: 'Active' },
  // Under Advertisement Tax (minorHeadId=2, prefix=112)
  { id: 4, minorHeadId:  2, code: '1', nameEnglish: 'Hoardings & Billboards',  nameKannada: 'ಹೋರ್ಡಿಂಗ್ ಮತ್ತು ಬಿಲ್ ಬೋರ್ಡ್', status: 'Active' },
  // Under Water & Sewerage (minorHeadId=4, prefix=121)
  { id: 5, minorHeadId:  4, code: '1', nameEnglish: 'Metered Water Supply',    nameKannada: 'ಮೀಟರ್ ನೀರು ಸರಬರಾಜು',     status: 'Active' },
  { id: 6, minorHeadId:  4, code: '2', nameEnglish: 'Unmetered Water Supply',  nameKannada: 'ಮೀಟರ್ ರಹಿತ ನೀರು ಸರಬರಾಜು', status: 'Active' },
  // Under Salaries & Wages (minorHeadId=8, prefix=211)
  { id: 7, minorHeadId:  8, code: '1', nameEnglish: 'Regular Pay',             nameKannada: 'ನಿಯಮಿತ ವೇತನ',             status: 'Active' },
  { id: 8, minorHeadId:  8, code: '2', nameEnglish: 'Contractual Pay',         nameKannada: 'ಗುತ್ತಿಗೆ ವೇತನ',            status: 'Active' },
  // Under Land (minorHeadId=11, prefix=311)
  { id: 9, minorHeadId: 11, code: '1', nameEnglish: 'Agricultural Land',       nameKannada: 'ಕೃಷಿ ಭೂಮಿ',               status: 'Active' },
  // Under State Govt Loans (minorHeadId=13, prefix=411)
  { id: 10, minorHeadId: 13, code: '1', nameEnglish: 'HUDCO Loans',            nameKannada: 'ಹಡ್ಕೋ ಸಾಲ',               status: 'Active' },
];

/* ── Level 5: Detail Codes ───────────────────────────────────────────────── */
// Composite = AT.code + MH.code + MinH.code + SH.code + DC.code  (6 digits total)
export const INITIAL_DETAIL_CODES: DetailCode[] = [
  // Under Residential Property (subHeadId=1, prefix=1111)
  { id: 1,  subHeadId:  1, code: '01', nameEnglish: 'General Residential',   nameKannada: 'ಸಾಮಾನ್ಯ ವಸತಿ',           status: 'Active' },
  { id: 2,  subHeadId:  1, code: '02', nameEnglish: 'Slum / Low-Income',     nameKannada: 'ಕೊಳಗೇರಿ / ಕಡಿಮೆ ಆದಾಯ',  status: 'Active' },
  // Under Commercial Property (subHeadId=2, prefix=1112)
  { id: 3,  subHeadId:  2, code: '01', nameEnglish: 'Retail Commercial',     nameKannada: 'ಚಿಲ್ಲರೆ ವಾಣಿಜ್ಯ',         status: 'Active' },
  { id: 4,  subHeadId:  2, code: '02', nameEnglish: 'Office / Corporate',    nameKannada: 'ಕಚೇರಿ / ಕಾರ್ಪೊರೇಟ್',      status: 'Active' },
  // Under Industrial Property (subHeadId=3, prefix=1113)
  { id: 5,  subHeadId:  3, code: '01', nameEnglish: 'Light Industry',        nameKannada: 'ಲಘು ಕೈಗಾರಿಕೆ',           status: 'Active' },
  // Under Hoardings (subHeadId=4, prefix=1121)
  { id: 6,  subHeadId:  4, code: '01', nameEnglish: 'Private Hoardings',     nameKannada: 'ಖಾಸಗಿ ಹೋರ್ಡಿಂಗ್',         status: 'Active' },
  { id: 7,  subHeadId:  4, code: '02', nameEnglish: 'Government Hoardings',  nameKannada: 'ಸರ್ಕಾರಿ ಹೋರ್ಡಿಂಗ್',       status: 'Inactive' },
  // Under Metered Water (subHeadId=5, prefix=1211)
  { id: 8,  subHeadId:  5, code: '01', nameEnglish: 'Domestic Metered',      nameKannada: 'ಮನೆ ಬಳಕೆ ಮೀಟರ್',          status: 'Active' },
  { id: 9,  subHeadId:  5, code: '02', nameEnglish: 'Commercial Metered',    nameKannada: 'ವಾಣಿಜ್ಯ ಮೀಟರ್',            status: 'Active' },
  // Under Regular Pay (subHeadId=7, prefix=2111)
  { id: 10, subHeadId:  7, code: '01', nameEnglish: 'Grade I Officers',      nameKannada: 'ದರ್ಜೆ I ಅಧಿಕಾರಿ',         status: 'Active' },
  { id: 11, subHeadId:  7, code: '02', nameEnglish: 'Grade II Officers',     nameKannada: 'ದರ್ಜೆ II ಅಧಿಕಾರಿ',        status: 'Active' },
  // Under Agricultural Land (subHeadId=9, prefix=3111)
  { id: 12, subHeadId:  9, code: '01', nameEnglish: 'Dry Land',              nameKannada: 'ಒಣ ಭೂಮಿ',                 status: 'Active' },
  // Under HUDCO Loans (subHeadId=10, prefix=4111)
  { id: 13, subHeadId: 10, code: '01', nameEnglish: 'Long-term HUDCO',       nameKannada: 'ದೀರ್ಘಕಾಲೀನ ಹಡ್ಕೋ',        status: 'Active' },
];
