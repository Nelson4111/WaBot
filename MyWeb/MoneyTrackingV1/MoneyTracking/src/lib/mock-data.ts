// ============================================
// MOCK DATA — MoneyTracking V1
// TODO: Replace with Supabase API calls
// ============================================

import type {
  User, Workspace, Account, Category, Transaction,
  Budget, Customer, Donation, Notification, AdminStats, ChartDataPoint
} from './types';

// --- USER ---
export const mockUser: User = {
  id: 'user-001',
  name: 'Budi Santoso',
  email: 'budi@example.com',
  avatar: undefined,
  role: 'user',
  workspaceMode: 'both',
  createdAt: '2025-01-15T08:00:00Z',
};

export const mockAdminUser: User = {
  id: 'admin-001',
  name: 'Admin MoneyTracking',
  email: 'admin@moneytracking.app',
  role: 'admin',
  workspaceMode: 'personal',
  createdAt: '2024-12-01T00:00:00Z',
};

// --- WORKSPACES ---
export const mockWorkspaces: Workspace[] = [
  {
    id: 'ws-personal',
    name: 'Pribadi',
    type: 'personal',
    userId: 'user-001',
    currency: 'IDR',
    createdAt: '2025-01-15T08:00:00Z',
  },
  {
    id: 'ws-business',
    name: 'Usaha Warung',
    type: 'business',
    userId: 'user-001',
    currency: 'IDR',
    createdAt: '2025-01-15T08:00:00Z',
  },
];

// --- CATEGORIES ---
export const mockCategories: Category[] = [
  // Expense
  { id: 'cat-01', name: 'Makanan', type: 'expense', icon: '🍜', color: '#FF6B35', isDefault: true, isActive: true },
  { id: 'cat-02', name: 'Transportasi', type: 'expense', icon: '🚗', color: '#4ECDC4', isDefault: true, isActive: true },
  { id: 'cat-03', name: 'Belanja', type: 'expense', icon: '🛍️', color: '#FFE66D', isDefault: true, isActive: true },
  { id: 'cat-04', name: 'Kesehatan', type: 'expense', icon: '💊', color: '#A8E63D', isDefault: true, isActive: true },
  { id: 'cat-05', name: 'Hiburan', type: 'expense', icon: '🎮', color: '#C77DFF', isDefault: true, isActive: true },
  { id: 'cat-06', name: 'Tagihan', type: 'expense', icon: '🧾', color: '#F4A261', isDefault: true, isActive: true },
  { id: 'cat-07', name: 'Pendidikan', type: 'expense', icon: '📚', color: '#06D6A0', isDefault: true, isActive: true },
  { id: 'cat-08', name: 'Perawatan', type: 'expense', icon: '💆', color: '#FF4D8D', isDefault: true, isActive: true },
  { id: 'cat-09', name: 'Internet', type: 'expense', icon: '📡', color: '#457B9D', isDefault: true, isActive: true },
  { id: 'cat-10', name: 'Lainnya', type: 'expense', icon: '📦', color: '#999999', isDefault: true, isActive: true },
  // Income
  { id: 'cat-11', name: 'Gaji', type: 'income', icon: '💵', color: '#16a34a', isDefault: true, isActive: true },
  { id: 'cat-12', name: 'Bonus', type: 'income', icon: '🎁', color: '#0ea5e9', isDefault: true, isActive: true },
  { id: 'cat-13', name: 'Freelance', type: 'income', icon: '💻', color: '#8b5cf6', isDefault: true, isActive: true },
  { id: 'cat-14', name: 'Investasi', type: 'income', icon: '📈', color: '#f59e0b', isDefault: true, isActive: true },
  { id: 'cat-15', name: 'Hadiah', type: 'income', icon: '🎀', color: '#ec4899', isDefault: true, isActive: true },
  { id: 'cat-16', name: 'Penjualan', type: 'income', icon: '🏪', color: '#10b981', isDefault: true, isActive: true },
];

// --- ACCOUNTS ---
export const mockAccounts: Account[] = [
  { id: 'acc-01', workspaceId: 'ws-personal', name: 'BCA', type: 'bank', balance: 8_500_000, icon: '🏦', color: '#0066CC', isActive: true, createdAt: '2025-01-15T08:00:00Z' },
  { id: 'acc-02', workspaceId: 'ws-personal', name: 'DANA', type: 'ewallet', balance: 350_000, icon: '📱', color: '#118EEA', isActive: true, createdAt: '2025-01-15T08:00:00Z' },
  { id: 'acc-03', workspaceId: 'ws-personal', name: 'Kas', type: 'cash', balance: 500_000, icon: '💵', color: '#16a34a', isActive: true, createdAt: '2025-01-15T08:00:00Z' },
  { id: 'acc-04', workspaceId: 'ws-personal', name: 'OVO', type: 'ewallet', balance: 125_000, icon: '💜', color: '#4C3494', isActive: true, createdAt: '2025-01-15T08:00:00Z' },
  { id: 'acc-05', workspaceId: 'ws-business', name: 'BRI Usaha', type: 'bank', balance: 15_250_000, icon: '🏦', color: '#003D7C', isActive: true, createdAt: '2025-01-15T08:00:00Z' },
  { id: 'acc-06', workspaceId: 'ws-business', name: 'Kas Toko', type: 'cash', balance: 2_000_000, icon: '💵', color: '#16a34a', isActive: true, createdAt: '2025-01-15T08:00:00Z' },
];

const cat = (id: string) => mockCategories.find(c => c.id === id)!;
const acc = (id: string) => mockAccounts.find(a => a.id === id)!;

// --- TRANSACTIONS ---
export const mockTransactions: Transaction[] = [
  { id: 'tx-001', workspaceId: 'ws-personal', type: 'income', amount: 5_000_000, categoryId: 'cat-11', category: cat('cat-11'), accountId: 'acc-01', account: acc('acc-01'), date: '2025-08-01T08:00:00Z', note: 'Gaji bulan Agustus', createdAt: '2025-08-01T08:00:00Z' },
  { id: 'tx-002', workspaceId: 'ws-personal', type: 'expense', amount: 45_000, categoryId: 'cat-01', category: cat('cat-01'), accountId: 'acc-03', account: acc('acc-03'), date: '2025-08-09T07:30:00Z', note: 'Sarapan nasi goreng', createdAt: '2025-08-09T07:30:00Z' },
  { id: 'tx-003', workspaceId: 'ws-personal', type: 'expense', amount: 50_000, categoryId: 'cat-02', category: cat('cat-02'), accountId: 'acc-03', account: acc('acc-03'), date: '2025-08-09T06:00:00Z', note: 'Bensin', createdAt: '2025-08-09T06:00:00Z' },
  { id: 'tx-004', workspaceId: 'ws-personal', type: 'expense', amount: 350_000, categoryId: 'cat-06', category: cat('cat-06'), accountId: 'acc-01', account: acc('acc-01'), date: '2025-08-08T09:00:00Z', note: 'Listrik + Air', createdAt: '2025-08-08T09:00:00Z' },
  { id: 'tx-005', workspaceId: 'ws-personal', type: 'transfer', amount: 500_000, categoryId: 'cat-10', category: cat('cat-10'), accountId: 'acc-01', account: acc('acc-01'), toAccountId: 'acc-02', toAccount: acc('acc-02'), date: '2025-08-08T10:00:00Z', note: 'Top up DANA', createdAt: '2025-08-08T10:00:00Z' },
  { id: 'tx-006', workspaceId: 'ws-personal', type: 'expense', amount: 89_000, categoryId: 'cat-03', category: cat('cat-03'), accountId: 'acc-02', account: acc('acc-02'), date: '2025-08-07T14:00:00Z', note: 'Beli baju online', createdAt: '2025-08-07T14:00:00Z' },
  { id: 'tx-007', workspaceId: 'ws-personal', type: 'expense', amount: 25_000, categoryId: 'cat-01', category: cat('cat-01'), accountId: 'acc-03', account: acc('acc-03'), date: '2025-08-07T12:00:00Z', note: 'Makan siang', createdAt: '2025-08-07T12:00:00Z' },
  { id: 'tx-008', workspaceId: 'ws-personal', type: 'income', amount: 500_000, categoryId: 'cat-13', category: cat('cat-13'), accountId: 'acc-01', account: acc('acc-01'), date: '2025-08-06T10:00:00Z', note: 'Freelance desain', createdAt: '2025-08-06T10:00:00Z' },
  { id: 'tx-009', workspaceId: 'ws-personal', type: 'expense', amount: 150_000, categoryId: 'cat-09', category: cat('cat-09'), accountId: 'acc-01', account: acc('acc-01'), date: '2025-08-05T09:00:00Z', note: 'Internet bulanan', createdAt: '2025-08-05T09:00:00Z' },
  { id: 'tx-010', workspaceId: 'ws-personal', type: 'expense', amount: 75_000, categoryId: 'cat-05', category: cat('cat-05'), accountId: 'acc-04', account: acc('acc-04'), date: '2025-08-04T20:00:00Z', note: 'Nonton bioskop', createdAt: '2025-08-04T20:00:00Z' },
  { id: 'tx-011', workspaceId: 'ws-personal', type: 'expense', amount: 200_000, categoryId: 'cat-04', category: cat('cat-04'), accountId: 'acc-01', account: acc('acc-01'), date: '2025-08-03T11:00:00Z', note: 'Obat dan vitamin', createdAt: '2025-08-03T11:00:00Z' },
  { id: 'tx-012', workspaceId: 'ws-personal', type: 'expense', amount: 35_000, categoryId: 'cat-01', category: cat('cat-01'), accountId: 'acc-03', account: acc('acc-03'), date: '2025-08-02T19:00:00Z', note: 'Makan malam', createdAt: '2025-08-02T19:00:00Z' },
];

// --- BUDGETS ---
export const mockBudgets: Budget[] = [
  { id: 'bud-01', workspaceId: 'ws-personal', categoryId: 'cat-01', category: cat('cat-01'), amount: 800_000, spent: 645_000, period: '2025-08', createdAt: '2025-08-01T00:00:00Z' },
  { id: 'bud-02', workspaceId: 'ws-personal', categoryId: 'cat-02', category: cat('cat-02'), amount: 400_000, spent: 320_000, period: '2025-08', createdAt: '2025-08-01T00:00:00Z' },
  { id: 'bud-03', workspaceId: 'ws-personal', categoryId: 'cat-03', category: cat('cat-03'), amount: 500_000, spent: 430_000, period: '2025-08', createdAt: '2025-08-01T00:00:00Z' },
  { id: 'bud-04', workspaceId: 'ws-personal', categoryId: 'cat-05', category: cat('cat-05'), amount: 200_000, spent: 75_000, period: '2025-08', createdAt: '2025-08-01T00:00:00Z' },
  { id: 'bud-05', workspaceId: 'ws-personal', categoryId: 'cat-06', category: cat('cat-06'), amount: 600_000, spent: 350_000, period: '2025-08', createdAt: '2025-08-01T00:00:00Z' },
  { id: 'bud-06', workspaceId: 'ws-personal', categoryId: 'cat-04', category: cat('cat-04'), amount: 300_000, spent: 295_000, period: '2025-08', createdAt: '2025-08-01T00:00:00Z' },
];

// --- CUSTOMERS (Business) ---
export const mockCustomers: Customer[] = [
  { id: 'cust-01', workspaceId: 'ws-business', name: 'Andi Wijaya', phone: '081234567890', email: 'andi@email.com', isActive: true, totalTransactions: 12, totalAmount: 4_500_000, unpaidAmount: 0, createdAt: '2025-03-01T00:00:00Z' },
  { id: 'cust-02', workspaceId: 'ws-business', name: 'Siti Rahma', phone: '082345678901', isActive: true, totalTransactions: 8, totalAmount: 2_800_000, unpaidAmount: 350_000, createdAt: '2025-04-15T00:00:00Z' },
  { id: 'cust-03', workspaceId: 'ws-business', name: 'Budi Hartono', phone: '083456789012', isActive: true, totalTransactions: 5, totalAmount: 1_200_000, unpaidAmount: 200_000, createdAt: '2025-05-10T00:00:00Z' },
  { id: 'cust-04', workspaceId: 'ws-business', name: 'Dewi Lestari', phone: '084567890123', isActive: true, totalTransactions: 20, totalAmount: 7_500_000, unpaidAmount: 0, createdAt: '2025-02-01T00:00:00Z' },
  { id: 'cust-05', workspaceId: 'ws-business', name: 'Rizki Pratama', phone: '085678901234', isActive: false, totalTransactions: 3, totalAmount: 900_000, unpaidAmount: 500_000, createdAt: '2025-06-20T00:00:00Z' },
];

// --- DONATIONS ---
export const mockDonations: Donation[] = [
  { id: 'don-01', displayName: 'Seseorang dari Jakarta', isAnonymous: false, amount: 100_000, message: 'Semangat terus ya!', status: 'approved', createdAt: '2025-07-01T10:00:00Z' },
  { id: 'don-02', displayName: 'Anonymous', isAnonymous: true, amount: 50_000, status: 'approved', createdAt: '2025-07-05T14:00:00Z' },
  { id: 'don-03', displayName: 'Nelson', isAnonymous: false, amount: 200_000, message: 'Keep up the great work!', status: 'approved', createdAt: '2025-07-10T09:00:00Z' },
  { id: 'don-04', displayName: 'Hamba Allah', isAnonymous: false, amount: 75_000, status: 'approved', createdAt: '2025-07-15T16:00:00Z' },
  { id: 'don-05', displayName: 'Anonymous', isAnonymous: true, amount: 500_000, status: 'approved', createdAt: '2025-07-20T11:00:00Z' },
  { id: 'don-06', displayName: 'Budi S.', isAnonymous: false, amount: 25_000, status: 'pending', createdAt: '2025-08-08T13:00:00Z' },
];

// --- NOTIFICATIONS ---
export const mockNotifications: Notification[] = [
  { id: 'notif-01', userId: 'user-001', title: 'Selamat datang! 🎉', body: 'Selamat datang di MoneyTracking! Mulai catat keuanganmu sekarang.', type: 'info', isRead: false, createdAt: '2025-08-09T08:00:00Z' },
  { id: 'notif-02', userId: 'user-001', title: 'Budget Hampir Habis ⚠️', body: 'Budget Kesehatan sudah mencapai 98%. Berhati-hatilah dengan pengeluaran.', type: 'warning', isRead: false, createdAt: '2025-08-08T09:00:00Z' },
  { id: 'notif-03', userId: 'user-001', title: 'Pengumuman Sistem 📢', body: 'MoneyTracking v1.1 akan segera rilis dengan fitur recurring transaction!', type: 'announcement', isRead: true, createdAt: '2025-08-05T10:00:00Z' },
  { id: 'notif-04', userId: 'user-001', title: 'Dukung MoneyTracking ❤️', body: 'MoneyTracking gratis untuk semua. Jika terbantu, pertimbangkan untuk berdonasi.', type: 'donation_reminder', isRead: true, createdAt: '2025-08-01T08:00:00Z' },
];

// --- CHART DATA ---
export const mockChartData: ChartDataPoint[] = [
  { label: 'Mar', income: 5_000_000, expense: 3_200_000 },
  { label: 'Apr', income: 5_500_000, expense: 4_100_000 },
  { label: 'Mei', income: 4_800_000, expense: 3_800_000 },
  { label: 'Jun', income: 6_200_000, expense: 3_500_000 },
  { label: 'Jul', income: 5_000_000, expense: 4_500_000 },
  { label: 'Agu', income: 5_500_000, expense: 1_769_000 },
];

// --- ADMIN STATS ---
export const mockAdminStats: AdminStats = {
  totalUsers: 248,
  activeUsers: 187,
  totalDonations: 950_000,
  pendingDonations: 1,
  approvedDonations: 5,
};

// --- FINANCIAL SUMMARY ---
export const mockFinancialSummary = {
  personal: {
    totalBalance: 9_475_000,
    income: 5_500_000,
    expense: 1_769_000,
    net: 3_731_000,
    period: '2025-08',
  },
  business: {
    totalBalance: 17_250_000,
    income: 12_500_000,
    expense: 4_800_000,
    net: 7_700_000,
    period: '2025-08',
  },
};
