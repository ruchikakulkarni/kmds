export type AccountStatus = 'Active' | 'Inactive';

export type AccountTypeCategory = 'Income' | 'Expense' | 'Asset' | 'Liability';

export interface AccountType {
  id: number;
  code: string;                 // 1 digit: "1", "2", "3", "4"
  category: AccountTypeCategory;
  nameEnglish: string;
  nameKannada: string;
  status: AccountStatus;
}

export interface MajorHead {
  id: number;
  accountTypeId: number;
  code: string;                 // 1 digit: "1", "2", ...
  nameEnglish: string;
  nameKannada: string;
  status: AccountStatus;
}

export interface MinorHead {
  id: number;
  majorHeadId: number;
  code: string;                 // 1 digit: "1", "2", ...
  nameEnglish: string;
  nameKannada: string;
  status: AccountStatus;
}

export interface SubHead {
  id: number;
  minorHeadId: number;
  code: string;                 // 1 digit: "1", "2", ...
  nameEnglish: string;
  nameKannada: string;
  status: AccountStatus;
}

export interface DetailCode {
  id: number;
  subHeadId: number;
  code: string;                 // 2 digits: "01", "02", ...
  nameEnglish: string;
  nameKannada: string;
  status: AccountStatus;
}

export type ActiveLevel =
  | 'account-type'
  | 'major-head'
  | 'minor-head'
  | 'sub-head'
  | 'detail-code'
  | 'all-codes';

/** Flat row for the All-Codes grid view */
export interface FlatAccountCode {
  id: number;             // detail_code.id
  compositeCode: string;
  accountType:  AccountType;
  majorHead:    MajorHead;
  minorHead:    MinorHead;
  subHead:      SubHead;
  detailCode:   DetailCode;
}
