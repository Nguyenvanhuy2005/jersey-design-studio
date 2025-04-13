
/**
 * Format number with commas as thousands separators
 * @param num Number to format
 * @returns Formatted number string with commas
 */
export function formatNumberWithCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
