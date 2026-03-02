export type SchemeFrequency = 'Annually' | 'Once in lifetime';
export type SchemeStatus = 'Active' | 'Inactive';

export interface BeneficiaryScheme {
  id: number;
  nameEnglish: string;
  nameKannada: string;
  frequency: SchemeFrequency;
  status: SchemeStatus;
}
