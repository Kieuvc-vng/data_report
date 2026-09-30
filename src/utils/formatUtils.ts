/**
 * Formatting Utilities
 * Provides functions for formatting dates, numbers, currencies, and strings
 */

/**
 * Formats a date string from ISO format to readable format
 * @param date - Date string in ISO format (YYYY-MM-DD) or Date object
 * @param format - Output format: 'short', 'long', or 'full' (default: 'short')
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date, format: 'short' | 'long' | 'full' = 'short'): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const options: Intl.DateTimeFormatOptions =
      format === 'short' ? { year: 'numeric', month: 'short', day: 'numeric' } :
      format === 'long' ? { year: 'numeric', month: 'long', day: 'numeric' } :
      { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };

    return dateObj.toLocaleDateString('en-US', options);
  } catch {
    return typeof date === 'string' ? date : '';
  }
};

/**
 * Formats a salary range string (e.g., "$50K-$75K")
 * @param salary - Salary string (e.g., "$50K-$75K" or "$50000-$75000")
 * @returns Formatted salary range
 */
export const formatCurrency = (salary: string): string => {
  if (!salary) return '';

  // If already formatted with K, return as-is
  if (salary.includes('K')) {
    return salary;
  }

  // Parse and format numbers with commas
  const parts = salary.split('-');
  return parts
    .map(part => {
      const clean = part.replace(/[^\d.]/g, '');
      const num = parseFloat(clean);
      if (isNaN(num)) return part;

      // Format as currency
      return '$' + Math.round(num / 1000) + 'K';
    })
    .join('-');
};

/**
 * Formats a number with thousands separator
 * @param num - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 */
export const formatNumber = (num: number, decimals: number = 0): string => {
  if (isNaN(num)) return '0';

  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return formatted;
};

/**
 * Truncates a string to a maximum length and adds ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated string
 */
export const truncateString = (str: string, maxLength: number, suffix: string = '...'): string => {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitalizes the first letter of each word in a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return '';

  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Converts a camelCase or snake_case string to Title Case
 * @param str - String to convert
 * @returns Title case string
 */
export const toTitleCase = (str: string): string => {
  if (!str) return '';

  // Handle camelCase
  const withSpaces = str.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
  return capitalizeWords(withSpaces.trim());
};

/**
 * Formats a number as a percentage
 * @param num - Number to format (0-1 or 0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @param isDecimal - If true, num is 0-1; if false, num is 0-100 (default: false)
 * @returns Formatted percentage string
 */
export const formatPercentage = (num: number, decimals: number = 1, isDecimal: boolean = false): string => {
  if (isNaN(num)) return '0%';

  const value = isDecimal ? num * 100 : num;
  return value.toFixed(decimals) + '%';
};

/**
 * Formats an object property name for display (handles common naming patterns)
 * @param key - Property key
 * @returns Formatted display name
 */
export const formatPropertyName = (key: string): string => {
  const labelMap: Record<string, string> = {
    notFitSkills: 'Not Fit Skills',
    lowExp: 'Low Experience',
    salaryMismatch: 'Salary Mismatch',
    totalHired: 'Total Hired',
    hcTotal: 'HC Total',
    salaryRange: 'Salary Range',
    aiInsight: 'AI Insight',
    levelDistribution: 'Level Distribution',
    byTeam: 'By Team',
    rejectReasons: 'Reject Reasons',
  };

  return labelMap[key] || toTitleCase(key);
};
