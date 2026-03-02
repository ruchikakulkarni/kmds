export type FundStatus = 'Active' | 'Inactive';

export interface FundCode {
  id: number;
  fundCode: string;
  nameEnglish: string;
  nameKannada: string;
  description: string;
  status: FundStatus;
}
