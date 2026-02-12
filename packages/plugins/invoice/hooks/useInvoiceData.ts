import { useState, useMemo } from 'react';
import type { Invoice, InvoiceStatus } from '../models';

const MOCK_RECEIVED_INVOICES: Invoice[] = [
  {
    id: 'INV-DEMO-2023',
    invoiceNumber: 'IT-9920334812',
    title: 'IndiHome Internet',
    billedFrom: 'IndiHome',
    billedTo: 'Nama Saya',
    customerNumber: '122455983301',
    senderType: 'member',
    status: 'belum_lunas',
    amount: 371500,
    discount: 25000,
    promo: 25000,
    allowInstallment: false,
    amountPaid: 0,
    issuedDate: '2023-12-05',
    dueDate: '2023-12-25',
    description: 'Layanan Fiber Optic & Entertainment',
    items: [
      { name: 'Paket Internet 30Mbps', amount: 345000 },
      { name: 'Add-on Disney+ Hotstar', amount: 49000 },
      { name: 'Biaya Admin', amount: 2500 },
    ],
  },
  {
    id: 'INV-001',
    invoiceNumber: 'INV/2025/0001',
    title: 'inv dari yeni ke mangga',
    billedFrom: 'ADMIN',
    billedTo: 'Nama Saya',
    senderType: 'member',
    status: 'belum_lunas',
    amount: 10000,
    allowInstallment: false,
    discount: 0,
    amountPaid: 0,
    issuedDate: '2025-08-14',
    dueDate: '2025-08-28',
    description: 'untuk testing - cicilan TIDAK BOLEH',
  },
  {
    id: 'INV-002',
    invoiceNumber: 'INV/2025/0002',
    title: 'inv dari yeni ke mangga',
    billedFrom: 'ADMIN',
    billedTo: 'Nama Saya',
    senderType: 'member',
    status: 'belum_lunas',
    amount: 10000,
    allowInstallment: true,
    discount: 0,
    amountPaid: 0,
    issuedDate: '2025-08-14',
    dueDate: '2025-08-28',
    description: 'tagihan bulanan - cicilan BOLEH',
  },
  {
    id: 'INV-003',
    invoiceNumber: 'INV/2025/0003',
    title: 'inv dari yeni ke mangga',
    billedFrom: 'ADMIN',
    billedTo: 'Nama Saya',
    senderType: 'member',
    status: 'dicicil',
    amount: 10000,
    allowInstallment: true,
    discount: 0,
    amountPaid: 5000,
    issuedDate: '2025-08-14',
    dueDate: '2025-08-28',
    description: 'cicilan pertama - cicilan LANJUTAN',
  },
  {
    id: 'INV-004',
    invoiceNumber: 'INV/2025/0004',
    title: 'inv bulanan toko barokah',
    billedFrom: 'ADMIN',
    billedTo: 'Toko Barokah',
    senderType: 'merchant',
    status: 'belum_lunas',
    amount: 150000,
    allowInstallment: false,
    discount: 0,
    amountPaid: 0,
    issuedDate: '2025-08-12',
    dueDate: '2025-08-26',
    description: 'tagihan bulanan toko - cicilan TIDAK BOLEH',
  },
  {
    id: 'INV-005',
    invoiceNumber: 'INV/2023/0005',
    title: 'Invoice Lebih Dari Saldo',
    billedFrom: 'ADMIN',
    billedTo: 'Nama Saya',
    senderType: 'member',
    status: 'belum_lunas',
    amount: 20000000,
    discount: 0,
    allowInstallment: true,
    amountPaid: 0,
    issuedDate: '2023-06-07',
    dueDate: '2023-06-18',
    description: 'untuk testing - cicilan BOLEH (Nominal Besar)',
  },
  {
    id: 'INV-006',
    invoiceNumber: 'INV/2025/0006',
    title: 'Tagihan Listrik',
    billedFrom: 'PLN',
    billedTo: 'Nama Saya',
    senderType: 'merchant',
    status: 'lunas',
    amount: 350000,
    allowInstallment: false,
    discount: 0,
    amountPaid: 350000,
    issuedDate: '2025-07-01',
    dueDate: '2025-07-15',
    description: 'Tagihan listrik bulan Juli - LUNAS',
  },
];

const MOCK_SENT_INVOICES: Invoice[] = [
  {
    id: 'SINV-001',
    invoiceNumber: 'INV/2023/1024',
    title: 'Budi Santoso',
    billedFrom: 'Nama Saya',
    billedTo: 'Budi Santoso',
    senderType: 'member',
    status: 'menunggu',
    amount: 1250000,
    discount: 0,
    amountPaid: 0,
    issuedDate: '2023-10-01',
    dueDate: '2023-10-25',
    description: 'Tagihan project',
  },
  {
    id: 'SINV-002',
    invoiceNumber: 'INV/2023/1022',
    title: 'PT. Makmur Sejahtera',
    billedFrom: 'Nama Saya',
    billedTo: 'PT. Makmur Sejahtera',
    senderType: 'merchant',
    status: 'lunas',
    amount: 4800000,
    discount: 0,
    amountPaid: 4800000,
    issuedDate: '2023-10-01',
    dueDate: '2023-10-22',
    description: 'Tagihan bulanan',
  },
  {
    id: 'SINV-003',
    invoiceNumber: 'INV/2023/1018',
    title: 'Siti Aminah',
    billedFrom: 'Nama Saya',
    billedTo: 'Siti Aminah',
    senderType: 'member',
    status: 'terlambat',
    amount: 350000,
    discount: 0,
    amountPaid: 0,
    issuedDate: '2023-10-01',
    dueDate: '2023-10-18',
    description: 'Tagihan jasa',
  },
  {
    id: 'SINV-004',
    invoiceNumber: 'INV/2023/0998',
    title: 'Warung Berkah',
    billedFrom: 'Nama Saya',
    billedTo: 'Warung Berkah',
    senderType: 'merchant',
    status: 'selesai',
    amount: 75000,
    discount: 0,
    amountPaid: 75000,
    issuedDate: '2023-10-01',
    dueDate: '2023-10-14',
    description: 'Tagihan supply',
  },
];

export const getInvoices = (): Invoice[] => MOCK_RECEIVED_INVOICES;

export const getSentInvoices = (): Invoice[] => MOCK_SENT_INVOICES;

export const getInvoiceById = (id: string): Invoice | null => {
  const all = [...MOCK_RECEIVED_INVOICES, ...MOCK_SENT_INVOICES];
  return all.find((inv) => inv.id === id) || null;
};

export type SentStatusFilter = 'all' | 'belum_lunas' | 'menunggu';

export const useInvoiceData = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [statusFilters, setStatusFilters] = useState<InvoiceStatus[]>([
    'lunas',
    'belum_lunas',
    'dicicil',
  ]);
  const [sentStatusFilter, setSentStatusFilter] = useState<SentStatusFilter>('all');

  const invoices = useMemo(() => {
    let filtered =
      activeTab === 'received' ? MOCK_RECEIVED_INVOICES : MOCK_SENT_INVOICES;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.title.toLowerCase().includes(q) ||
          inv.billedTo.toLowerCase().includes(q) ||
          inv.invoiceNumber.toLowerCase().includes(q),
      );
    }

    if (activeTab === 'received') {
      if (statusFilters.length > 0) {
        filtered = filtered.filter((inv) => statusFilters.includes(inv.status));
      }
    } else {
      if (sentStatusFilter !== 'all') {
        filtered = filtered.filter((inv) => inv.status === sentStatusFilter);
      }
    }

    return filtered;
  }, [searchQuery, statusFilters, sentStatusFilter, activeTab]);

  const toggleStatusFilter = (status: InvoiceStatus) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
  };

  return {
    invoices,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    statusFilters,
    toggleStatusFilter,
    sentStatusFilter,
    setSentStatusFilter,
  };
};
