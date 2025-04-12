
/**
 * Gets a fallback image URL when the original image cannot be loaded
 * @param type The type of image (design or reference)
 * @returns A fallback image URL
 */
export const getFallbackImageUrl = (type: 'design' | 'reference'): string => {
  return `https://via.placeholder.com/400x300?text=Không+thể+tải+${type === 'design' ? 'thiết+kế' : 'hình+ảnh'}`;
};
