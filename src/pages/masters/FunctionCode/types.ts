export type FunctionStatus = 'Active' | 'Inactive';

export interface FunctionCode {
  id: number;
  functionCode: string;
  nameEnglish: string;
  nameKannada: string;
  description: string;
  status: FunctionStatus;
}
