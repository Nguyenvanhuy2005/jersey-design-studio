
import { supabase } from "@/integrations/supabase/client";
import { createStorageBucketsIfNeeded } from "./bucket-utils";
import { checkFileExistsInStorage, createBucketIfNeeded } from "./file-utils";
import { toast } from "sonner";

/**
 * Get proper content type for image upload based on file extension
 * @param imageFile The image file to check
 * @returns Appropriate content type string
 */
const getContentType = (imageFile: File): string => {
  const fileName = imageFile.name.toLowerCase();
  
  // More specific handling for JPG/JPEG files
  if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
    console.log('Setting explicit MIME type for JPG/JPEG file');
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
  
  // Check if file.type is available and valid
  if (imageFile.type && imageFile.type.startsWith('image/')) {
    console.log(`Using file's reported MIME type: ${imageFile.type}`);
    return imageFile.type;
  }
  
  // Fallback for JPG/JPEG files with wrong MIME type
  if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
    console.log('Fallback to image/jpeg for JPG/JPEG file');
    return 'image/jpeg';
  }
  
  // Default fallback
  console.log(`No specific MIME type determined, using default`);
  return 'application/octet-stream';
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
  console.log(`Original file type: ${imageFile.type}`);
  
  // Create the bucket directly
  try {
    await createBucketIfNeeded('design_images');
  } catch (bucketErr) {
    console.error("Error ensuring bucket exists:", bucketErr);
    // Continue with upload attempt as bucket might already exist
  }
  
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
          toast.error(`Không thể tải lên hình ảnh: ${error.message}`);
          return '';
        }
        
        // Wait before retrying (increased delay with each attempt)
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      
      console.log(`Successfully uploaded design image on attempt ${attempt + 1}:`, data.path);
      
      // Verify the upload and get public URL
      const { success, publicUrl } = await verifyUpload('design_images', data.path);
      if (success && publicUrl) {
        console.log(`Verified upload with public URL: ${publicUrl}`);
      }
      
      return data.path;
    } catch (err) {
      console.error(`Exception uploading design image (attempt ${attempt + 1}):`, err);
      
      // If this is the last attempt, give up
      if (attempt === retries) {
        toast.error(`Lỗi khi tải lên hình ảnh: ${err instanceof Error ? err.message : 'Không xác định'}`);
        return '';
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  
  return '';
};

/**
 * Verifies that an image was successfully uploaded and returns its public URL
 * @param bucket The bucket name
 * @param path The file path
 * @returns Promise resolving to success status and public URL
 */
const verifyUpload = async (bucket: string, path: string): Promise<{ success: boolean, publicUrl: string | null }> => {
  try {
    // Check if the file exists
    const fileExists = await checkFileExistsInStorage(bucket, path);
    if (!fileExists) {
      console.error(`File ${path} does not exist in bucket ${bucket} after upload`);
      return { success: false, publicUrl: null };
    }
    
    // Get the public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { success: true, publicUrl: data.publicUrl };
  } catch (err) {
    console.error(`Error verifying upload:`, err);
    return { success: false, publicUrl: null };
  }
};
