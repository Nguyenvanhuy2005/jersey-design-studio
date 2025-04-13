
/**
 * Format number with commas as thousands separators
 * @param num Number to format
 * @returns Formatted number string with commas
 */
export function formatNumberWithCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format a number as Vietnamese currency (VND)
 * @param amount Amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return formatNumberWithCommas(amount) + ' VNĐ';
}

/**
 * Format a number as Vietnamese currency with rounding to thousands
 * @param amount Amount to format 
 * @returns Rounded and formatted currency string
 */
export function formatCurrencyRounded(amount: number): string {
  const rounded = Math.round(amount / 1000) * 1000;
  return formatCurrency(rounded);
}
