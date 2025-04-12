import { supabase } from "@/integrations/supabase/client";

/**
 * Get a public URL for a design image from storage with enhanced error handling
 * @param designImage Path to the design image in storage
 * @returns Public URL for the design image
 */
export const getDesignImageUrl = (designImage?: string): string | null => {
  if (!designImage) {
    console.log("No design image path provided");
    return null;
  }
  
  try {
    // Return as-is if it's already a URL
    if (designImage.startsWith('http')) {
      console.log("Design image is already a URL:", designImage);
      return designImage;
    }
    
    // Get public URL from Supabase storage
    const { data } = supabase.storage
      .from('design_images')
      .getPublicUrl(designImage);
    
    console.log("Design image URL generated:", data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error("Error getting design image URL:", error);
    return null;
  }
};

/**
 * Check if a design image exists in storage
 * @param imagePath Path to the design image in storage
 * @returns Promise resolving to boolean indicating if the image exists
 */
export const checkDesignImageExists = async (imagePath?: string): Promise<boolean> => {
  if (!imagePath) return false;
  
  try {
    // If already a URL, try to fetch it to check existence
    if (imagePath.startsWith('http')) {
      const response = await fetch(imagePath, { method: 'HEAD' });
      return response.ok;
    }
    
    // Otherwise, check in Supabase storage
    const { data, error } = await supabase.storage
      .from('design_images')
      .list(imagePath.split('/').slice(0, -1).join('/'), {
        limit: 1,
        offset: 0,
        search: imagePath.split('/').pop(),
      });
    
    if (error) {
      console.error("Error checking if design image exists:", error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking if design image exists:", error);
    return false;
  }
};

/**
 * Get a public URL for a reference image from storage with enhanced error handling
 * @param imagePath Path to the reference image in storage
 * @returns Public URL for the reference image
 */
export const getReferenceImageUrl = (imagePath: string): string | null => {
  if (!imagePath) {
    console.log("No reference image path provided");
    return null;
  }
  
  try {
    // Return as-is if it's already a URL
    if (imagePath.startsWith('http')) {
      console.log("Reference image is already a URL:", imagePath);
      return imagePath;
    }
    
    // Get public URL from Supabase storage
    const { data } = supabase.storage
      .from('reference_images')
      .getPublicUrl(imagePath);
    
    console.log("Reference image URL generated:", data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error("Error getting reference image URL:", error);
    return null;
  }
};

/**
 * Check if a reference image exists in storage
 * @param imagePath Path to the reference image in storage
 * @returns Promise resolving to boolean indicating if the image exists
 */
export const checkReferenceImageExists = async (imagePath?: string): Promise<boolean> => {
  if (!imagePath) return false;
  
  try {
    // If already a URL, try to fetch it to check existence
    if (imagePath.startsWith('http')) {
      const response = await fetch(imagePath, { method: 'HEAD' });
      return response.ok;
    }
    
    // Otherwise, check in Supabase storage
    const { data, error } = await supabase.storage
      .from('reference_images')
      .list(imagePath.split('/').slice(0, -1).join('/'), {
        limit: 1,
        offset: 0,
        search: imagePath.split('/').pop(),
      });
    
    if (error) {
      console.error("Error checking if reference image exists:", error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking if reference image exists:", error);
    return false;
  }
};

/**
 * Convert reference image paths to public URLs with enhanced error handling
 * @param referenceImages Array of reference image paths
 * @returns Array of public URLs for the reference images
 */
export const getReferenceImageUrls = (referenceImages?: string[]): string[] => {
  if (!referenceImages || referenceImages.length === 0) {
    console.log("No reference images provided");
    return [];
  }
  
  const urls = referenceImages
    .map(path => {
      const url = getReferenceImageUrl(path);
      if (!url) {
        console.warn(`Could not get URL for reference image: ${path}`);
      }
      return url;
    })
    .filter((url): url is string => url !== null);
  
  console.log(`Generated ${urls.length} reference image URLs out of ${referenceImages.length} paths`);
  return urls;
};

/**
 * Gets a fallback image URL when the original image cannot be loaded
 * @param type The type of image (design or reference)
 * @returns A fallback image URL
 */
export const getFallbackImageUrl = (type: 'design' | 'reference'): string => {
  return `https://via.placeholder.com/400x300?text=Không+thể+tải+${type === 'design' ? 'thiết+kế' : 'hình+ảnh'}`;
};
