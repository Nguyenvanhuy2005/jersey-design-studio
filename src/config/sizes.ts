
export const ADULT_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'] as const;
export const KID_SIZES = ['1', '3', '5', '7', '9', '11', '13', '15'] as const;

export type AdultSize = typeof ADULT_SIZES[number];
export type KidSize = typeof KID_SIZES[number];
export type Size = AdultSize | KidSize;

export const PRINT_TYPES = [
  'In chuyển nhiệt',
  'In decal'
] as const;

export type PrintType = typeof PRINT_TYPES[number];
