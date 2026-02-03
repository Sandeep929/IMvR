export interface Invoice {
  id: number;
  sNo: number;
  date: string;
  product: string;
  quantity: number;
  rate: number;
  amount: number;
  advance: number;
  balance: number;
  pavatiNo: number;
  customerName: string;
  site: string;
  vehicleNo: string;
  marfat: string;
  remarks: string;
}

export type InvoiceFormData = Omit<Invoice, 'id' | 'sNo'>;
