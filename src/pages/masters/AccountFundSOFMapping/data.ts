import {
  INITIAL_ACCOUNT_TYPES,
  INITIAL_MAJOR_HEADS,
  INITIAL_MINOR_HEADS,
  INITIAL_SUB_HEADS,
  INITIAL_DETAIL_CODES,
} from '../AccountCode/data';
import type { AccountType, MajorHead, MinorHead, SubHead, DetailCode } from '../AccountCode/types';
import type { AccountFundSOFMapping } from './types';

/* ── Reference data for dropdowns ── */

export interface FundCodeRef {
  id: number;
  fundCode: string;
  nameEnglish: string;
}

export interface SourceRef {
  id: number;
  sourceCode: string;
  nameEnglish: string;
}

export interface SubSourceRef {
  id: number;
  sourceId: number;
  subSourceCode: string;
  nameEnglish: string;
}

export const FUND_CODES_REF: FundCodeRef[] = [
  { id: 1,  fundCode: '101', nameEnglish: 'General Fund' },
  { id: 2,  fundCode: '102', nameEnglish: 'Water Supply & Sewerage Fund' },
  { id: 3,  fundCode: '101', nameEnglish: 'General Fund (Drainage)' },
  { id: 4,  fundCode: '101', nameEnglish: 'General Fund (SFC Grant)' },
  { id: 5,  fundCode: '102', nameEnglish: 'Water Supply & Sewerage Fund (CFC)' },
  { id: 6,  fundCode: '201', nameEnglish: 'Enterprise Fund' },
  { id: 7,  fundCode: '103', nameEnglish: 'Road Fund' },
  { id: 8,  fundCode: '104', nameEnglish: 'Health Fund' },
  { id: 9,  fundCode: '105', nameEnglish: 'Education Fund' },
  { id: 10, fundCode: '106', nameEnglish: 'Parks & Gardens Fund' },
];

export const SOURCES_REF: SourceRef[] = [
  { id: 1, sourceCode: 'SF-001', nameEnglish: 'Own Revenue' },
  { id: 2, sourceCode: 'SF-002', nameEnglish: 'State Grants' },
  { id: 3, sourceCode: 'SF-003', nameEnglish: 'Central Grants' },
  { id: 4, sourceCode: 'SF-004', nameEnglish: 'Loans & Borrowings' },
  { id: 5, sourceCode: 'SF-005', nameEnglish: 'External Aid' },
  { id: 6, sourceCode: 'SF-006', nameEnglish: 'Capital Receipts' },
  { id: 7, sourceCode: 'SF-007', nameEnglish: 'Special Purpose Grants' },
  { id: 8, sourceCode: 'SF-008', nameEnglish: 'Devolution Funds' },
];

export const SUBSOURCES_REF: SubSourceRef[] = [
  { id: 1,  sourceId: 2, subSourceCode: 'SF-002-01', nameEnglish: 'SFC Grants' },
  { id: 2,  sourceId: 2, subSourceCode: 'SF-002-02', nameEnglish: 'State Dev. Grants' },
  { id: 3,  sourceId: 2, subSourceCode: 'SF-002-03', nameEnglish: 'AMRUT Grants' },
  { id: 4,  sourceId: 3, subSourceCode: 'SF-003-01', nameEnglish: 'CFC Grants' },
  { id: 5,  sourceId: 3, subSourceCode: 'SF-003-02', nameEnglish: 'Smart City Mission' },
  { id: 6,  sourceId: 3, subSourceCode: 'SF-003-03', nameEnglish: 'PMAY Grants' },
  { id: 7,  sourceId: 1, subSourceCode: 'SF-001-01', nameEnglish: 'Property Tax' },
  { id: 8,  sourceId: 1, subSourceCode: 'SF-001-02', nameEnglish: 'Water Charges' },
  { id: 9,  sourceId: 4, subSourceCode: 'SF-004-01', nameEnglish: 'HUDCO Loans' },
  { id: 10, sourceId: 4, subSourceCode: 'SF-004-02', nameEnglish: 'Bank Loans' },
];

/* ── Flat code helper ── */

export interface FlatCode {
  accountType: AccountType;
  majorHead: MajorHead;
  minorHead: MinorHead;
  subHead: SubHead;
  detailCode: DetailCode;
  compositeCode: string;
}

export function buildFlatCode(detailCodeId: number): FlatCode | null {
  const dc  = INITIAL_DETAIL_CODES.find(d => d.id === detailCodeId);
  if (!dc) return null;
  const sh  = INITIAL_SUB_HEADS.find(s => s.id === dc.subHeadId);
  if (!sh) return null;
  const min = INITIAL_MINOR_HEADS.find(m => m.id === sh.minorHeadId);
  if (!min) return null;
  const mh  = INITIAL_MAJOR_HEADS.find(m => m.id === min.majorHeadId);
  if (!mh) return null;
  const at  = INITIAL_ACCOUNT_TYPES.find(a => a.id === mh.accountTypeId);
  if (!at) return null;
  return {
    accountType: at,
    majorHead: mh,
    minorHead: min,
    subHead: sh,
    detailCode: dc,
    compositeCode: at.code + mh.code + min.code + sh.code + dc.code,
  };
}

export function getDetailCodesByAccountType(accountTypeId: number): DetailCode[] {
  const mhIds  = INITIAL_MAJOR_HEADS.filter(m => m.accountTypeId === accountTypeId).map(m => m.id);
  const minIds = INITIAL_MINOR_HEADS.filter(m => mhIds.includes(m.majorHeadId)).map(m => m.id);
  const shIds  = INITIAL_SUB_HEADS.filter(s => minIds.includes(s.minorHeadId)).map(s => s.id);
  return INITIAL_DETAIL_CODES.filter(d => shIds.includes(d.subHeadId));
}

/* ── Display helpers ── */

export function getAccountTypeName(id: number): string {
  return INITIAL_ACCOUNT_TYPES.find(a => a.id === id)?.nameEnglish ?? '—';
}

export function getFundLabel(id: number): string {
  const f = FUND_CODES_REF.find(f => f.id === id);
  return f ? `${f.fundCode} – ${f.nameEnglish}` : '—';
}

export function getSourceName(id: number): string {
  return SOURCES_REF.find(s => s.id === id)?.nameEnglish ?? '—';
}

export function getSubSourceName(id: number): string {
  return SUBSOURCES_REF.find(ss => ss.id === id)?.nameEnglish ?? '—';
}

/* ── Seed data ── */

function seed(
  id: number,
  dcId: number,
  fundCodeId: number,
  sourceId: number,
  subSourceId: number,
  status: 'Active' | 'Inactive',
): AccountFundSOFMapping {
  const flat = buildFlatCode(dcId)!;
  return {
    id,
    accountTypeId: flat.accountType.id,
    majorHeadId:   flat.majorHead.id,
    minorHeadId:   flat.minorHead.id,
    subHeadId:     flat.subHead.id,
    detailCodeId:  dcId,
    compositeCode: flat.compositeCode,
    fundCodeId,
    sourceId,
    subSourceId,
    status,
  };
}

export const INITIAL_MAPPINGS: AccountFundSOFMapping[] = [
  // Income – Property Tax – Residential General  →  General Fund / Own Revenue / Property Tax
  seed(1,  1,  1, 1, 7, 'Active'),
  // Income – Property Tax – Slum/Low-Income      →  General Fund / Own Revenue / Property Tax
  seed(2,  2,  1, 1, 7, 'Active'),
  // Income – Comm Property – Retail Commercial   →  General Fund / State Grants / SFC Grants
  seed(3,  3,  1, 2, 1, 'Active'),
  // Income – Water – Domestic Metered            →  Water Supply Fund / Own Revenue / Water Charges
  seed(4,  8,  2, 1, 8, 'Active'),
  // Income – Water – Commercial Metered          →  Water Supply Fund / Central Grants / CFC Grants
  seed(5,  9,  2, 3, 4, 'Active'),
  // Expenditure – Grade I Officers               →  General Fund / State Grants / SFC Grants
  seed(6,  10, 1, 2, 1, 'Active'),
  // Assets – Dry Land                            →  Enterprise Fund / Loans / HUDCO
  seed(7,  12, 6, 4, 9, 'Active'),
  // Liabilities – Long-term HUDCO                →  Enterprise Fund / Loans / HUDCO
  seed(8,  13, 6, 4, 9, 'Inactive'),
];
