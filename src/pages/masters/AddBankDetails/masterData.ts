export interface Bank     { id: string; name: string; }
export interface Branch   { id: string; bankId: string; name: string; ifsc: string; micr: string; }
export interface District { id: string; name: string; }
export interface Taluk    { id: string; districtId: string; name: string; }
export interface Fund     { id: string; name: string; }
export interface Purpose  { id: string; name: string; }

export const BANKS: Bank[] = [
  { id: 'sbi',   name: 'State Bank of India' },
  { id: 'cnrb',  name: 'Canara Bank' },
  { id: 'bob',   name: 'Bank of Baroda' },
  { id: 'hdfc',  name: 'HDFC Bank' },
  { id: 'icici', name: 'ICICI Bank' },
];

export const BRANCHES: Branch[] = [
  { id: 'sbi_blg',   bankId: 'sbi',   name: 'Belagavi Main',   ifsc: 'SBIN0004628', micr: '590002004' },
  { id: 'sbi_hub',   bankId: 'sbi',   name: 'Hubli Branch',    ifsc: 'SBIN0004324', micr: '580002004' },
  { id: 'cnrb_blg',  bankId: 'cnrb',  name: 'Belagavi Branch', ifsc: 'CNRB0001234', micr: '590015001' },
  { id: 'cnrb_dhw',  bankId: 'cnrb',  name: 'Dharwad Branch',  ifsc: 'CNRB0005678', micr: '580015002' },
  { id: 'bob_blg',   bankId: 'bob',   name: 'Belagavi Branch', ifsc: 'BARB0BELAGA', micr: '590012001' },
  { id: 'hdfc_blg',  bankId: 'hdfc',  name: 'Belagavi Branch', ifsc: 'HDFC0001234', micr: '590240001' },
  { id: 'icici_blg', bankId: 'icici', name: 'Belagavi Branch', ifsc: 'ICIC0001234', micr: '590229001' },
];

export const DISTRICTS: District[] = [
  { id: 'blg', name: 'Belagavi' },
  { id: 'dhw', name: 'Dharwad' },
  { id: 'hub', name: 'Hubballi' },
  { id: 'vjp', name: 'Vijayapura' },
];

export const TALUKS: Taluk[] = [
  { id: 'blg_blg', districtId: 'blg', name: 'Belagavi' },
  { id: 'blg_gok', districtId: 'blg', name: 'Gokak' },
  { id: 'blg_chi', districtId: 'blg', name: 'Chikkodi' },
  { id: 'blg_rai', districtId: 'blg', name: 'Raibag' },
  { id: 'blg_ath', districtId: 'blg', name: 'Athani' },
  { id: 'dhw_dhw', districtId: 'dhw', name: 'Dharwad' },
  { id: 'dhw_kal', districtId: 'dhw', name: 'Kalghatgi' },
  { id: 'dhw_nav', districtId: 'dhw', name: 'Navalgund' },
  { id: 'hub_hub', districtId: 'hub', name: 'Hubballi' },
  { id: 'hub_dhw', districtId: 'hub', name: 'Dharwad' },
  { id: 'vjp_vjp', districtId: 'vjp', name: 'Vijayapura' },
  { id: 'vjp_bas', districtId: 'vjp', name: 'Basavana Bagewadi' },
];

export const FUNDS: Fund[] = [
  { id: 'gen',  name: 'General Fund' },
  { id: 'ws',   name: 'Water Supply Fund' },
  { id: 'sw',   name: 'Solid Waste Management Fund' },
  { id: 'road', name: 'Road Development Fund' },
];

export const PURPOSES: Purpose[] = [
  { id: 'sal',   name: 'Bank Account-Nationalised Banks-Specific Grants' },
  { id: 'rev',   name: 'Bank Account-Nationalised Banks-General' },
  { id: 'cap',   name: 'Bank Account-Nationalized Banks-Collection' },
  { id: 'maint', name: 'Bank Account-Nationalised Banks-Earmarked Funds' },
  { id: 'tax',   name: 'Bank Account-Other Scheduled Banks-Specific Grants' },
];

export const INTEGRATIONS: string[] = [ 'BBPS', 'UPI', 'Payment gateway'];

export const ACCOUNT_TYPES: string[] = [
  'Savings', 'Current', 'Fixed Deposit', 'Cash Credit', 'Overdraft',
];
