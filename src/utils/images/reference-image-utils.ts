
import { supabase } from "@/integrations/supabase/client";
import { createBucketIfNeeded } from "../storage/file-utils";
import { toast } from "sonner";

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
    
    // Special handling for JPG/JPEG files
    if (extension === 'jpg' || extension === 'jpeg') {
      console.log(`Special handling for JPG/JPEG image: ${imagePath}`);
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
    
    // Log the file extension for debugging
    const extension = imagePath.split('.').pop()?.toLowerCase() || '';
    console.log(`Checking if reference image exists (${extension}): ${imagePath}`);
    
    // Ensure reference_images bucket exists
    try {
      await createBucketIfNeeded('reference_images');
    } catch (bucketErr) {
      console.error("Error ensuring reference_images bucket:", bucketErr);
      // Continue checking, as the bucket might already exist
    }
    
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

/**
 * Uploads a reference image to Supabase storage with enhanced error handling for JPG
 * @param orderId The order ID for the path
 * @param imageFile The reference image file to upload
 * @param index The index of the image (for naming)
 * @returns Promise resolving to the uploaded file path or empty string on failure
 */
export const uploadReferenceImage = async (
  orderId: string,
  imageFile: File,
  index: number
): Promise<string> => {
  try {
    // Create the bucket if it doesn't exist
    try {
      await createBucketIfNeeded('reference_images');
    } catch (bucketErr) {
      console.error("Error ensuring reference_images bucket exists:", bucketErr);
      // Continue with upload attempt as bucket might already exist
    }
    
    const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'png';
    const filePath = `${orderId}/${Date.now()}-ref-${index}.${fileExt}`;
    
    console.log(`Uploading reference image (${fileExt}) ${index} to ${filePath}...`);
    
    // Determine the correct content type based on file extension
    let contentType: string;
    if (fileExt === 'jpg' || fileExt === 'jpeg') {
      contentType = 'image/jpeg';
    } else if (fileExt === 'png') {
      contentType = 'image/png';
    } else if (fileExt === 'gif') {
      contentType = 'image/gif';
    } else if (fileExt === 'webp') {
      contentType = 'image/webp';
    } else {
      contentType = imageFile.type || 'application/octet-stream';
    }
    
    console.log(`Using content type: ${contentType} for ${fileExt} file: ${imageFile.name}`);
    
    const { data, error } = await supabase.storage
      .from('reference_images')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: contentType
      });
      
    if (error) {
      console.error(`Error uploading reference image ${index}:`, error);
      toast.error(`Không thể tải lên hình ảnh tham khảo ${index + 1}: ${error.message}`);
      return '';
    }
    
    console.log(`Successfully uploaded reference image ${index}:`, data.path);
    
    // Verify upload was successful
    const { publicUrl } = await verifyRefUpload('reference_images', data.path);
    if (publicUrl) {
      console.log(`Verified reference image upload with public URL: ${publicUrl}`);
    }
    
    return data.path;
  } catch (err) {
    console.error(`Error uploading reference image ${index}:`, err);
    toast.error(`Có lỗi khi tải lên hình ảnh tham khảo ${index + 1}`);
    return '';
  }
};

/**
 * Verifies that a reference image was successfully uploaded
 * @param bucket The bucket name
 * @param path The file path
 * @returns Promise resolving to the public URL if successful
 */
const verifyRefUpload = async (
  bucket: string, 
  path: string
): Promise<{ success: boolean, publicUrl: string | null }> => {
  try {
    // Check if file exists
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path.split('/').slice(0, -1).join('/'), {
        limit: 1,
        search: path.split('/').pop() || ''
      });
      
    if (error || !data || data.length === 0) {
      console.error(`File ${path} verification failed:`, error || 'No file found');
      return { success: false, publicUrl: null };
    }
    
    // Get public URL
    const urlData = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
      
    return { success: true, publicUrl: urlData.data.publicUrl };
  } catch (err) {
    console.error(`Error verifying reference image upload:`, err);
    return { success: false, publicUrl: null };
  }
};
