export type SubServiceStatus = 'Active' | 'Inactive';

export interface SubService {
  id: number;
  subServiceCode: string;
  nameEnglish: string;
  nameKannada: string;
  serviceId: number;
  serviceName: string;
  serviceCode: string;
  accountTypeId: number;
  accountTypeName: string;
  compositeCode: string;
  compositeDescription: string;
  fundId: string;
  fundName: string;
  status: SubServiceStatus;
  /** ULB bank mapping */
  mappedBankAccountId: string;
  mappedBankAccountLabel: string;
}

export interface ServiceOption {
  id: number;
  code: string;
  name: string;
}

export interface AccountTypeOption {
  id: number;
  code: string;
  name: string;
}

export interface CompositeOption {
  code: string;
  description: string;
  accountTypeId: number;
}

export interface FundOption {
  id: string;
  name: string;
}

export interface BankAccountOption {
  id: string;
  label: string;
  shortName: string;
}
