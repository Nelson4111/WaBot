// ============================================
// UTILS — MoneyTracking V1
// ============================================

/**
 * Format angka sebagai mata uang Rupiah
 */
export function formatCurrency(amount: number, compact = false): string {
  if (compact) {
    if (Math.abs(amount) >= 1_000_000_000) {
      return `Rp${(amount / 1_000_000_000).toFixed(1)}M`;
    }
    if (Math.abs(amount) >= 1_000_000) {
      return `Rp${(amount / 1_000_000).toFixed(1)}jt`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `Rp${(amount / 1_000).toFixed(0)}rb`;
    }
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format tanggal: "9 Agu 2025"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Format tanggal relatif: "Hari ini", "Kemarin", "3 hari lalu"
 */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return formatDate(dateStr);
}

/**
 * Format tanggal untuk group header: "Senin, 9 Agustus 2025"
 */
export function formatDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Format bulan: "Agustus 2025"
 */
export function formatMonth(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Hitung persentase penggunaan budget
 */
export function getBudgetPercentage(spent: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((spent / total) * 100), 100);
}

/**
 * Get budget status color
 */
export function getBudgetStatus(percentage: number): 'safe' | 'warning' | 'danger' {
  if (percentage < 70) return 'safe';
  if (percentage < 90) return 'warning';
  return 'danger';
}

/**
 * Greeting berdasarkan waktu
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
}

/**
 * Generate inisial dari nama untuk avatar
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

/**
 * Truncate text
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return `${str.slice(0, maxLen)}…`;
}

/**
 * Group transactions by date
 */
export function groupByDate<T extends { date: string }>(items: T[]): Record<string, T[]> {
  return items.reduce(
    (groups, item) => {
      const key = item.date.split('T')[0];
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Format nominal input (auto-formatting: 1000000 → 1.000.000)
 */
export function formatInputAmount(raw: string): string {
  const numeric = raw.replace(/\D/g, '');
  if (!numeric) return '';
  return parseInt(numeric).toLocaleString('id-ID');
}

/**
 * Parse formatted amount string to number
 */
export function parseAmount(formatted: string): number {
  return parseInt(formatted.replace(/\./g, '').replace(/,/g, '')) || 0;
}
