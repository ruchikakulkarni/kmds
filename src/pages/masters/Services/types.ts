export type ServiceStatus = 'Active' | 'Inactive';

export interface Service {
  id: number;
  serviceCode: string;
  nameEnglish: string;
  nameKannada: string;
  status: ServiceStatus;
}
