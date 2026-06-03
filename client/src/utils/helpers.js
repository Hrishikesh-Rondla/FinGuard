/**
 * Format a number as INR currency
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string as "Jan 15, 2024"
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a date as relative time, e.g. "2 hours ago"
 */
export function formatDateRelative(date) {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  if (diffWeek < 5) return `${diffWeek} week${diffWeek !== 1 ? 's' : ''} ago`;
  return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`;
}

/**
 * Get color class based on stress level
 */
export function getStressColor(level) {
  switch (level?.toLowerCase?.()) {
    case 'low':
      return 'emerald';
    case 'medium':
      return 'amber';
    case 'high':
      return 'rose';
    default:
      return 'emerald';
  }
}

/**
 * Get hex color for stress level — professional muted tones
 */
export function getStressHexColor(level) {
  switch (level?.toLowerCase?.()) {
    case 'low':
      return '#10b981'; // emerald-500
    case 'medium':
      return '#f59e0b'; // amber-500
    case 'high':
      return '#f43f5e'; // rose-500
    default:
      return '#10b981';
  }
}

/**
 * Category color map — professional muted palette
 */
const CATEGORY_COLORS = {
  rent: '#8b5cf6',
  groceries: '#10b981',
  utilities: '#3b82f6',
  transport: '#f59e0b',
  entertainment: '#ec4899',
  dining: '#f97316',
  shopping: '#a855f7',
  healthcare: '#06b6d4',
  education: '#6366f1',
  debt_payment: '#ef4444',
  income: '#10b981',
  savings: '#22d3ee',
  other: '#6b7280',
};

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category?.toLowerCase()] || CATEGORY_COLORS.other;
}

/**
 * Get Lucide icon name for each category
 */
export function getCategoryIcon(category) {
  const icons = {
    rent: 'Home',
    groceries: 'ShoppingCart',
    utilities: 'Zap',
    transport: 'Car',
    entertainment: 'Gamepad2',
    dining: 'UtensilsCrossed',
    shopping: 'ShoppingBag',
    healthcare: 'Heart',
    education: 'GraduationCap',
    debt_payment: 'CreditCard',
    income: 'TrendingUp',
    savings: 'PiggyBank',
    other: 'MoreHorizontal',
  };
  return icons[category?.toLowerCase()] || 'MoreHorizontal';
}

/**
 * Get stress badge class
 */
export function getStressBadgeClass(level) {
  switch (level?.toLowerCase?.()) {
    case 'low':
      return 'badge-low';
    case 'medium':
      return 'badge-medium';
    case 'high':
      return 'badge-high';
    default:
      return 'badge-low';
  }
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncate text
 */
export function truncate(str, maxLen = 50) {
  if (!str) return '';
  return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
}
