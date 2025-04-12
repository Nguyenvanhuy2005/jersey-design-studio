
import { supabase } from "@/integrations/supabase/client";

/**
 * Get a public URL for a design image from storage
 * @param designImage Path to the design image in storage
 * @returns Public URL for the design image
 */
export const getDesignImageUrl = (designImage?: string): string | null => {
  if (!designImage) return null;
  
  try {
    // Return as-is if it's already a URL
    if (designImage.startsWith('http')) {
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
 * Get a public URL for a reference image from storage
 * @param imagePath Path to the reference image in storage
 * @returns Public URL for the reference image
 */
export const getReferenceImageUrl = (imagePath: string): string | null => {
  if (!imagePath) return null;
  
  try {
    // Return as-is if it's already a URL
    if (imagePath.startsWith('http')) {
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
 * Convert reference image paths to public URLs
 * @param referenceImages Array of reference image paths
 * @returns Array of public URLs for the reference images
 */
export const getReferenceImageUrls = (referenceImages?: string[]): string[] => {
  if (!referenceImages || referenceImages.length === 0) {
    return [];
  }
  
  return referenceImages
    .map(path => getReferenceImageUrl(path))
    .filter((url): url is string => url !== null);
};
