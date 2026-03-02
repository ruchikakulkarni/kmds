import {
  INITIAL_ACCOUNT_TYPES,
  INITIAL_MAJOR_HEADS,
  INITIAL_MINOR_HEADS,
  INITIAL_SUB_HEADS,
  INITIAL_DETAIL_CODES,
} from '../AccountCode/data';
import type {
  BudgetCodeRecord,
  BudgetType,
  FlatAccountCodeOption,
  FunctionCodeOption,
} from './types';

/* ── Flat composite account-code list (derived from AccountCode seed data) ── */
export const FLAT_ACCOUNT_CODES: FlatAccountCodeOption[] = INITIAL_DETAIL_CODES.flatMap(dc => {
  const sh  = INITIAL_SUB_HEADS.find(s => s.id === dc.subHeadId);
  if (!sh) return [];
  const min = INITIAL_MINOR_HEADS.find(m => m.id === sh.minorHeadId);
  if (!min) return [];
  const mh  = INITIAL_MAJOR_HEADS.find(m => m.id === min.majorHeadId);
  if (!mh) return [];
  const at  = INITIAL_ACCOUNT_TYPES.find(a => a.id === mh.accountTypeId);
  if (!at) return [];
  return [{
    compositeCode:   at.code + mh.code + min.code + sh.code + dc.code,
    accountTypeId:   at.id,
    accountTypeName: at.nameEnglish,
    majorHeadName:   mh.nameEnglish,
    minorHeadName:   min.nameEnglish,
    subHeadName:     sh.nameEnglish,
    detailCodeName:  dc.nameEnglish,
  }];
});

/* ── Function code option list (mirrors FunctionCodeTab seed data) ── */
export const FUNCTION_CODES: FunctionCodeOption[] = [
  { id:  1, code: 'FC-01', name: 'General Administration' },
  { id:  2, code: 'FC-02', name: 'Urban Planning & Development' },
  { id:  3, code: 'FC-03', name: 'Roads & Bridges' },
  { id:  4, code: 'FC-04', name: 'Water Supply' },
  { id:  5, code: 'FC-05', name: 'Sewerage & Drainage' },
  { id:  6, code: 'FC-06', name: 'Public Health' },
  { id:  7, code: 'FC-07', name: 'Primary Education' },
  { id:  8, code: 'FC-08', name: 'Parks & Gardens' },
  { id:  9, code: 'FC-09', name: 'Street Lighting' },
  { id: 10, code: 'FC-10', name: 'Solid Waste Management' },
  { id: 11, code: 'FC-11', name: 'Social Welfare' },
  { id: 12, code: 'FC-12', name: 'Regulation & Enforcement' },
];

/* ── Budget code auto-generation helper ─────────────────────────────────── */
export function generateBudgetCode(
  compositeAccountCode: string,
  functionCode: string,
  budgetType: BudgetType,
): string {
  const fcNum  = functionCode.replace(/\D/g, '').padStart(2, '0');
  const btCode = budgetType === 'Revenue' ? 'RV' : budgetType === 'Capital' ? 'CA' : 'DP';
  return compositeAccountCode + fcNum + btCode;
}

/* ── Seed budget code records ────────────────────────────────────────────── */
export const INITIAL_BUDGET_CODES: BudgetCodeRecord[] = [
  {
    id: 1,
    accountTypeId: 1,
    compositeAccountCode: '101001000100001',
    majorHeadName:  'Tax Revenue',
    minorHeadName:  'Property Tax',
    subHeadName:    'Residential Property',
    detailCodeName: 'General Residential',
    functionCodeId: 1,
    functionCode:   'FC-01',
    functionName:   'General Administration',
    budgetType:     'Revenue',
    descriptionEnglish: 'Revenue budget for residential property tax under general administration',
    descriptionKannada: 'ಸಾಮಾನ್ಯ ಆಡಳಿತ ಅಡಿ ವಸತಿ ಆಸ್ತಿ ತೆರಿಗೆ ರಾಜಸ್ವ ಬಜೆಟ್',
    budgetCode: '101001000100001' + '01' + 'RV',
    status: 'Active',
  },
  {
    id: 2,
    accountTypeId: 1,
    compositeAccountCode: '101001000200001',
    majorHeadName:  'Tax Revenue',
    minorHeadName:  'Property Tax',
    subHeadName:    'Commercial Property',
    detailCodeName: 'Retail Commercial',
    functionCodeId: 2,
    functionCode:   'FC-02',
    functionName:   'Urban Planning & Development',
    budgetType:     'Capital',
    descriptionEnglish: 'Capital budget for commercial property tax under urban planning',
    descriptionKannada: 'ನಗರ ಯೋಜನೆ ಅಡಿ ವಾಣಿಜ್ಯ ಆಸ್ತಿ ತೆರಿಗೆ ಬಂಡವಾಳ ಬಜೆಟ್',
    budgetCode: '101001000200001' + '02' + 'CA',
    status: 'Active',
  },
  {
    id: 3,
    accountTypeId: 2,
    compositeAccountCode: '201001000100001',
    majorHeadName:  'Establishment Expenses',
    minorHeadName:  'Salaries & Wages',
    subHeadName:    'Regular Pay',
    detailCodeName: 'Grade I Officers',
    functionCodeId: 1,
    functionCode:   'FC-01',
    functionName:   'General Administration',
    budgetType:     'Revenue',
    descriptionEnglish: 'Revenue provision for Grade I officers salaries under general administration',
    descriptionKannada: 'ಸಾಮಾನ್ಯ ಆಡಳಿತ ಅಡಿ ದರ್ಜೆ I ಅಧಿಕಾರಿಗಳ ವೇತನ ರಾಜಸ್ವ ತರತಮ',
    budgetCode: '201001000100001' + '01' + 'RV',
    status: 'Active',
  },
  {
    id: 4,
    accountTypeId: 1,
    compositeAccountCode: '102001000100001',
    majorHeadName:  'Non-Tax Revenue',
    minorHeadName:  'Water & Sewerage Charges',
    subHeadName:    'Metered Water Supply',
    detailCodeName: 'Domestic Metered',
    functionCodeId: 4,
    functionCode:   'FC-04',
    functionName:   'Water Supply',
    budgetType:     'Revenue',
    descriptionEnglish: 'Revenue budget for domestic metered water supply charges',
    descriptionKannada: 'ಮನೆ ಬಳಕೆ ಮೀಟರ್ ನೀರು ಸರಬರಾಜು ಶುಲ್ಕ ರಾಜಸ್ವ ಬಜೆಟ್',
    budgetCode: '102001000100001' + '04' + 'RV',
    status: 'Active',
  },
  {
    id: 5,
    accountTypeId: 4,
    compositeAccountCode: '401001000100001',
    majorHeadName:  'Long-term Liabilities',
    minorHeadName:  'State Government Loans',
    subHeadName:    'HUDCO Loans',
    detailCodeName: 'Long-term HUDCO',
    functionCodeId: 3,
    functionCode:   'FC-03',
    functionName:   'Roads & Bridges',
    budgetType:     'Deposit',
    descriptionEnglish: 'Deposit provision for long-term HUDCO loan repayment – roads & bridges',
    descriptionKannada: 'ರಸ್ತೆ ಮತ್ತು ಸೇತುವೆ ಅಡಿ ದೀರ್ಘಕಾಲೀನ ಹಡ್ಕೋ ಸಾಲ ಮರುಪಾವತಿ ಠೇವಣಿ ತರತಮ',
    budgetCode: '401001000100001' + '03' + 'DP',
    status: 'Inactive',
  },
];
