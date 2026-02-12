/**
 * Invoice Plugin
 * Invoice and billing management - create, send, and pay invoices
 */

export { InvoiceScreen } from './components/screens';
export { InvoiceListScreen } from './components/screens';
export { InvoiceDetailScreen } from './components/screens';

export { InvoiceTab } from './components/tabs';
export { InvoiceFeatured } from './components/widgets';

export { useInvoiceData, getInvoices, getInvoiceById } from './hooks';
export type { Invoice, InvoiceStatus, InvoiceSenderType } from './models';

export const InvoiceModule = {
  id: 'invoice',
  name: 'Invoice',
  screens: {
    Invoice: 'InvoiceScreen',
    InvoiceList: 'InvoiceListScreen',
    InvoiceDetail: 'InvoiceDetailScreen',
    InvoicePayment: 'InvoicePaymentScreen',
  },
};
