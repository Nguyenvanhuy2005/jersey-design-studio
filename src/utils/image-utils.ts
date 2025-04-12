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
    
    // Check if bucket exists first
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      return false;
    }
    
    const designBucketExists = buckets.some(bucket => bucket.name === 'design_images');
    if (!designBucketExists) {
      console.error("Bucket 'design_images' does not exist");
      return false;
    }
    
    // Otherwise, check in Supabase storage
    const folderPath = imagePath.split('/').slice(0, -1).join('/');
    const fileName = imagePath.split('/').pop();
    
    const { data, error } = await supabase.storage
      .from('design_images')
      .list(folderPath, {
        limit: 100,
        offset: 0,
        search: fileName
      });
    
    if (error) {
      console.error("Error checking if design image exists:", error);
      return false;
    }
    
    return data && data.length > 0 && data.some(file => file.name === fileName);
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
    
    // Check if bucket exists first
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      return false;
    }
    
    const refBucketExists = buckets.some(bucket => bucket.name === 'reference_images');
    if (!refBucketExists) {
      console.error("Bucket 'reference_images' does not exist");
      return false;
    }
    
    // Otherwise, check in Supabase storage
    const folderPath = imagePath.split('/').slice(0, -1).join('/');
    const fileName = imagePath.split('/').pop();
    
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
    
    return data && data.length > 0 && data.some(file => file.name === fileName);
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

/**
 * Check if storage buckets exist in Supabase
 * @returns Promise resolving to object with buckets existence status
 */
export const checkStorageBucketsExist = async (): Promise<{ 
  designImages: boolean; 
  referenceImages: boolean; 
  error?: string;
}> => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Error checking storage buckets:", error);
      return { 
        designImages: false, 
        referenceImages: false, 
        error: error.message 
      };
    }
    
    const designBucketExists = buckets.some(bucket => bucket.name === 'design_images');
    const refBucketExists = buckets.some(bucket => bucket.name === 'reference_images');
    
    return {
      designImages: designBucketExists,
      referenceImages: refBucketExists
    };
  } catch (err) {
    console.error("Exception checking storage buckets:", err);
    return { 
      designImages: false, 
      referenceImages: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
};

/**
 * Create storage buckets if they don't exist
 * @returns Promise resolving when operation completes
 */
export const createStorageBucketsIfNeeded = async (): Promise<{ 
  success: boolean; 
  message: string; 
  created: { designImages: boolean; referenceImages: boolean; } 
}> => {
  const created = { designImages: false, referenceImages: false };
  
  try {
    // Check if buckets exist
    const { designImages, referenceImages, error } = await checkStorageBucketsExist();
    
    if (error) {
      return { 
        success: false, 
        message: `Error checking buckets: ${error}`, 
        created 
      };
    }
    
    // Create design_images bucket if it doesn't exist
    if (!designImages) {
      const { error: createError } = await supabase.storage.createBucket('design_images', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (createError) {
        console.error("Error creating design_images bucket:", createError);
      } else {
        created.designImages = true;
      }
    }
    
    // Create reference_images bucket if it doesn't exist
    if (!referenceImages) {
      const { error: createError } = await supabase.storage.createBucket('reference_images', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (createError) {
        console.error("Error creating reference_images bucket:", createError);
      } else {
        created.referenceImages = true;
      }
    }
    
    return { 
      success: true, 
      message: 'Buckets check completed',
      created
    };
  } catch (err) {
    console.error("Exception creating storage buckets:", err);
    return { 
      success: false, 
      message: err instanceof Error ? err.message : 'Unknown error',
      created
    };
  }
};
