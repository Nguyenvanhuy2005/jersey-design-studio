
import { supabase } from "@/integrations/supabase/client";

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
    
    // Extract file extension for debugging
    const extension = imagePath.split('.').pop()?.toLowerCase() || '';
    console.log(`Processing reference image (${extension}): ${imagePath}`);
    
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
    
    // Log the file extension for debugging
    const extension = imagePath.split('.').pop()?.toLowerCase() || '';
    console.log(`Checking if reference image exists (${extension}): ${imagePath}`);
    
    // Check if bucket exists first
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      return false;
    }
    
    const refBucketExists = buckets.some(bucket => 
      bucket.name === 'reference_images' || 
      bucket.name.toLowerCase() === 'reference_images'
    );
    
    if (!refBucketExists) {
      console.error("Bucket 'reference_images' does not exist");
      return false;
    }
    
    // Otherwise, check in Supabase storage
    const folderPath = imagePath.split('/').slice(0, -1).join('/');
    const fileName = imagePath.split('/').pop();
    
    if (!fileName) {
      console.error("Invalid file path:", imagePath);
      return false;
    }
    
    const { data, error } = await supabase.storage
      .from('reference_images')
      .list(folderPath, {
        limit: 100,
        offset: 0,
        search: fileName
      });
    
    if (error) {
      console.error("Error checking if reference image exists:", error);
      return false;
    }
    
    const fileExists = data && data.length > 0 && data.some(file => file.name === fileName);
    console.log(`Reference image ${imagePath} exists: ${fileExists}`);
    return fileExists;
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
  
  // Remove any duplicate entries
  const uniqueReferenceImages = [...new Set(referenceImages)];
  console.log(`Processing ${uniqueReferenceImages.length} unique images from ${referenceImages.length} total`);
  
  const urls = uniqueReferenceImages
    .map(path => {
      // Log file extension for debugging
      const extension = path.split('.').pop()?.toLowerCase() || '';
      console.log(`Getting URL for image (${extension}): ${path}`);
      
      const url = getReferenceImageUrl(path);
      if (!url) {
        console.warn(`Could not get URL for reference image: ${path}`);
      }
      return url;
    })
    .filter((url): url is string => url !== null);
  
  console.log(`Generated ${urls.length} reference image URLs out of ${uniqueReferenceImages.length} unique paths`);
  return urls;
};
