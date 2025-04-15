
/**
 * Gets a fallback image URL for when an image cannot be loaded
 * @param type The type of image (design, reference, etc.)
 * @returns The fallback image URL
 */
export const getFallbackImageUrl = (type: 'design' | 'reference' | 'logo'): string => {
  switch (type) {
    case 'design':
      return '/placeholder.svg';
    case 'reference':
      return '/placeholder.svg';
    case 'logo':
      return '/placeholder.svg';
    default:
      return '/placeholder.svg';
  }
};
