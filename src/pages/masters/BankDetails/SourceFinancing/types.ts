export type SourceStatus = 'Active' | 'Inactive';

export interface SourceFinancing {
  id: number;
  sourceCode: string;
  nameEnglish: string;
  nameKannada: string;
  description: string;
  status: SourceStatus;
}

export interface SubSourceFinancing {
  id: number;
  sourceId: number;
  subSourceCode: string;
  nameEnglish: string;
  nameKannada: string;
  description: string;
  status: SourceStatus;
}
