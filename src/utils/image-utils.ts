
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
    
    console.log("Storage buckets check:", {
      designImages: designBucketExists,
      referenceImages: refBucketExists,
      bucketsFound: buckets.map(b => b.name).join(', ')
    });
    
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
      // If we can't check buckets due to permissions, assume they exist
      // This fixes the issue where RLS policy prevents bucket creation but buckets already exist
      console.warn(`Unable to check buckets: ${error}. Assuming they exist and continuing...`);
      return { 
        success: true, 
        message: 'Assuming buckets exist due to permission restrictions',
        created 
      };
    }
    
    // Create design_images bucket if it doesn't exist
    if (!designImages) {
      try {
        const { error: createError } = await supabase.storage.createBucket('design_images', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (createError) {
          // If error is due to RLS policy, assume bucket exists and continue
          if (createError.message.includes('row-level security policy')) {
            console.warn("Unable to create design_images bucket due to RLS policy. Assuming it exists.");
          } else {
            console.error("Error creating design_images bucket:", createError);
          }
        } else {
          console.log("Successfully created design_images bucket");
          created.designImages = true;
        }
      } catch (err) {
        console.warn("Exception creating design_images bucket. Assuming it exists:", err);
      }
    } else {
      console.log("design_images bucket already exists");
    }
    
    // Create reference_images bucket if it doesn't exist
    if (!referenceImages) {
      try {
        const { error: createError } = await supabase.storage.createBucket('reference_images', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (createError) {
          // If error is due to RLS policy, assume bucket exists and continue
          if (createError.message.includes('row-level security policy')) {
            console.warn("Unable to create reference_images bucket due to RLS policy. Assuming it exists.");
          } else {
            console.error("Error creating reference_images bucket:", createError);
          }
        } else {
          console.log("Successfully created reference_images bucket");
          created.referenceImages = true;
        }
      } catch (err) {
        console.warn("Exception creating reference_images bucket. Assuming it exists:", err);
      }
    } else {
      console.log("reference_images bucket already exists");
    }
    
    // Success if we either created buckets or they already existed
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

/**
 * Uploads a design image to Supabase storage with retry logic
 * @param orderId The order ID for the path
 * @param imageFile The image file to upload
 * @param fileNameSuffix The suffix to append to the filename (default: 'design')
 * @param retries Number of retry attempts (default: 2)
 * @returns Promise resolving to the uploaded file path or empty string on failure
 */
export const uploadDesignImage = async (
  orderId: string, 
  imageFile: File,
  fileNameSuffix: string = 'design',
  retries: number = 2
): Promise<string> => {
  const filePath = `${orderId}/${fileNameSuffix}.png`;
  
  // First, ensure the bucket exists (but don't fail if we can't create it due to RLS)
  await createStorageBucketsIfNeeded();
  
  // Try to upload with retries
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Uploading design image to ${filePath} (attempt ${attempt + 1}/${retries + 1})...`);
      
      const { data, error } = await supabase.storage
        .from('design_images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (error) {
        console.error(`Error uploading design image (attempt ${attempt + 1}):`, error);
        
        // If this is the last attempt, give up
        if (attempt === retries) {
          return '';
        }
        
        // Wait before retrying (increased delay with each attempt)
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      
      console.log(`Successfully uploaded design image on attempt ${attempt + 1}:`, data.path);
      return data.path;
    } catch (err) {
      console.error(`Exception uploading design image (attempt ${attempt + 1}):`, err);
      
      // If this is the last attempt, give up
      if (attempt === retries) {
        return '';
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  
  return '';
};

/**
 * Checks if a file exists in a Supabase storage bucket
 * @param bucket The bucket name
 * @param path The file path
 * @returns Promise resolving to boolean indicating if file exists
 */
export const checkFileExistsInStorage = async (
  bucket: string,
  path: string
): Promise<boolean> => {
  try {
    if (!path) return false;
    
    // Get the folder path and filename
    const pathParts = path.split('/');
    const fileName = pathParts.pop();
    const folderPath = pathParts.join('/');
    
    if (!fileName) return false;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folderPath, {
        limit: 100,
        search: fileName
      });
      
    if (error) {
      console.error(`Error checking if file exists in ${bucket}:`, error);
      return false;
    }
    
    const fileExists = data && data.length > 0 && data.some(file => file.name === fileName);
    console.log(`File ${path} in ${bucket} exists: ${fileExists}`);
    return fileExists;
  } catch (err) {
    console.error(`Error checking if file exists in ${bucket}:`, err);
    return false;
  }
};

/**
 * Verifies that an image was successfully uploaded to storage
 * @param bucket The bucket name 
 * @param path The file path
 * @returns Promise resolving to boolean and public URL if successful
 */
export const verifyImageUpload = async (
  bucket: string,
  path: string
): Promise<{ success: boolean, publicUrl: string | null }> => {
  try {
    if (!path) {
      return { success: false, publicUrl: null };
    }
    
    // Check if file exists in storage
    const fileExists = await checkFileExistsInStorage(bucket, path);
    
    if (!fileExists) {
      console.warn(`Image does not exist in ${bucket}: ${path}`);
      return { success: false, publicUrl: null };
    }
    
    // Get public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    console.log(`Successfully verified image upload to ${bucket}: ${path}`);
    return { success: true, publicUrl: data.publicUrl };
  } catch (err) {
    console.error(`Error verifying image upload to ${bucket}:`, err);
    return { success: false, publicUrl: null };
  }
};

