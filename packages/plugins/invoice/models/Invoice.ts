export type InvoiceStatus = 'lunas' | 'belum_lunas' | 'dicicil' | 'menunggu' | 'terlambat' | 'selesai';
export type InvoiceSenderType = 'member' | 'merchant';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  title: string;
  billedFrom: string;
  billedTo: string;
  senderType: InvoiceSenderType;
  status: InvoiceStatus;
  amount: number;
  discount: number;
  amountPaid: number;
  issuedDate: string; // ISO date string
  dueDate: string;    // ISO date string
  description: string;
  items?: { name: string; amount: number }[];
  customerNumber?: string;
  subtotal?: number;
  adminFee?: number;
  promo?: number;
  allowInstallment?: boolean;
}

