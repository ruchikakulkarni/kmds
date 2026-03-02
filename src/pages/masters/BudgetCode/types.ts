export type BudgetStatus = 'Active' | 'Inactive';

export type BudgetType = 'Revenue' | 'Capital' | 'Deposit';

export interface BudgetCodeRecord {
  id: number;
  /** FK to AccountType.id — kept for filtering the composite dropdown */
  accountTypeId: number;
  /** Full 15-char composite account code (AT+MH+MinH+SH+DC) */
  compositeAccountCode: string;
  /** Denormalised display values auto-fetched from the composite selection */
  majorHeadName: string;
  minorHeadName: string;
  subHeadName: string;
  detailCodeName: string;
  /** FK to FunctionCode.id */
  functionCodeId: number;
  functionCode: string;   // e.g. "FC-01"
  functionName: string;
  budgetType: BudgetType;
  descriptionEnglish: string;
  descriptionKannada: string;
  /** Auto-generated read-only field */
  budgetCode: string;
  status: BudgetStatus;
}

/** Option shape for the Composite Account Code dropdown */
export interface FlatAccountCodeOption {
  compositeCode: string;
  accountTypeId: number;
  accountTypeName: string;
  majorHeadName: string;
  minorHeadName: string;
  subHeadName: string;
  detailCodeName: string;
}

/** Option shape for the Function Name / Function Code dropdowns */
export interface FunctionCodeOption {
  id: number;
  code: string;
  name: string;
}
