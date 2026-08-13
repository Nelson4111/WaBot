// ============================================
// TYPES — MoneyTracking V1
// ============================================

export type WorkspaceType = 'personal' | 'business';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type AccountType = 'bank' | 'cash' | 'ewallet' | 'credit_card' | 'other';
export type UserRole = 'user' | 'admin' | 'superadmin';
export type DonationStatus = 'pending' | 'approved' | 'rejected';

// --- User ---
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  workspaceMode: 'personal' | 'business' | 'both';
  createdAt: string;
}

// --- Workspace ---
export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;
  userId: string;
  currency: string;
  createdAt: string;
}

// --- Account ---
export interface Account {
  id: string;
  workspaceId: string;
  name: string;
  type: AccountType;
  balance: number;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

// --- Category ---
export interface Category {
  id: string;
  workspaceId?: string; // null = system default
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault: boolean;
  isActive: boolean;
}

// --- Transaction ---
export interface Transaction {
  id: string;
  workspaceId: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  category: Category;
  accountId: string;
  account: Account;
  toAccountId?: string; // for transfer
  toAccount?: Account;
  customerId?: string;
  customer?: Customer;
  date: string;
  note?: string;
  createdAt: string;
}

// --- Budget ---
export interface Budget {
  id: string;
  workspaceId: string;
  categoryId: string;
  category: Category;
  amount: number;
  spent: number;
  period: string; // "2025-08"
  createdAt: string;
}

// --- Customer (Business only) ---
export interface Customer {
  id: string;
  workspaceId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  note?: string;
  isActive: boolean;
  totalTransactions: number;
  totalAmount: number;
  unpaidAmount: number;
  createdAt: string;
}

// --- Donation ---
export interface Donation {
  id: string;
  userId?: string;
  displayName: string;
  isAnonymous: boolean;
  amount: number;
  message?: string;
  status: DonationStatus;
  createdAt: string;
}

// --- Notification ---
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'announcement' | 'donation_reminder';
  isRead: boolean;
  createdAt: string;
}

// --- Admin ---
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalDonations: number;
  pendingDonations: number;
  approvedDonations: number;
}

// --- Summary ---
export interface FinancialSummary {
  totalBalance: number;
  income: number;
  expense: number;
  net: number;
  period: string;
}

// --- Chart data ---
export interface ChartDataPoint {
  label: string;
  income: number;
  expense: number;
}
