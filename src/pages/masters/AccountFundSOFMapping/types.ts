export type MappingStatus = 'Active' | 'Inactive';

export interface AccountFundSOFMapping {
  id: number;
  accountTypeId: number;
  majorHeadId: number;
  minorHeadId: number;
  subHeadId: number;
  detailCodeId: number;
  compositeCode: string;
  fundCodeId: number;
  sourceId: number;
  subSourceId: number;
  status: MappingStatus;
}
