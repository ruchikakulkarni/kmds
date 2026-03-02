export type BillQueueStatus = 'Active' | 'Inactive';

export interface BillQueue {
  id: number;
  descriptionEnglish: string;
  descriptionKannada: string;
  status: BillQueueStatus;
}
