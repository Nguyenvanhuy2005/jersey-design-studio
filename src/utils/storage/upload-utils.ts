
import { supabase } from "@/integrations/supabase/client";
import { createStorageBucketsIfNeeded } from "./bucket-utils";
import { checkFileExistsInStorage } from "./file-utils";

/**
 * Get proper content type for image upload based on file extension
 * @param imageFile The image file to check
 * @returns Appropriate content type string
 */
const getContentType = (imageFile: File): string => {
  const fileName = imageFile.name.toLowerCase();
  
  if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
    return 'image/jpeg';
  } else if (fileName.endsWith('.png')) {
    return 'image/png';
  } else if (fileName.endsWith('.gif')) {
    return 'image/gif';
  } else if (fileName.endsWith('.webp')) {
    return 'image/webp';
  } else if (fileName.endsWith('.svg')) {
    return 'image/svg+xml';
  }
  
  // Default to the file's type or a fallback
  return imageFile.type || 'application/octet-stream';
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
  // Get file extension from original file name
  const fileExtension = imageFile.name.split('.').pop()?.toLowerCase() || 'png';
  
  // Create file path using suffix and preserving extension
  const filePath = `${orderId}/${fileNameSuffix}.${fileExtension}`;
  
  console.log(`Uploading image with extension ${fileExtension}: ${filePath}`);
  
  // First, ensure the bucket exists (but don't fail if we can't create it due to RLS)
  await createStorageBucketsIfNeeded();
  
  // Set content type based on file extension
  const contentType = getContentType(imageFile);
  console.log(`Using content type: ${contentType} for file: ${imageFile.name}`);
  
  // Try to upload with retries
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Uploading design image to ${filePath} (attempt ${attempt + 1}/${retries + 1})...`);
      
      const { data, error } = await supabase.storage
        .from('design_images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: contentType
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
