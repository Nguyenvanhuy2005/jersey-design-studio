
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a file exists in the specified bucket
 * @param bucketName The storage bucket name
 * @param filePath Path to the file within the bucket
 * @returns Promise resolving to boolean indicating if file exists
 */
export const checkFileExistsInStorage = async (bucketName: string, filePath: string): Promise<boolean> => {
  if (!filePath) return false;
  
  try {
    // Extract folder path and filename
    const pathParts = filePath.split('/');
    const fileName = pathParts.pop();
    const folderPath = pathParts.join('/');
    
    if (!fileName) return false;
    
    // If accessing public bucket for the first time, try to initialize it
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets.some(b => b.name === bucketName);
      
      if (!bucketExists) {
        console.warn(`Bucket ${bucketName} does not exist`);
        return false;
      }
    } catch (err) {
      console.warn("Could not check bucket existence:", err);
    }
    
    // Try to get file metadata
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath, {
        search: fileName,
        limit: 1
      });
    
    if (error) {
      console.error(`Error checking if file exists (${bucketName}/${filePath}):`, error);
      return false;
    }
    
    return data && data.length > 0 && data.some(item => item.name === fileName);
  } catch (err) {
    console.error(`Exception checking if file exists (${bucketName}/${filePath}):`, err);
    return false;
  }
};

/**
 * Get public URL for a file in storage
 * @param bucketName The storage bucket name 
 * @param filePath Path to the file within the bucket
 * @returns The public URL as string or null if error
 */
export const getStorageFileUrl = (bucketName: string, filePath: string): string | null => {
  if (!filePath) return null;
  
  try {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  } catch (err) {
    console.error(`Error getting URL for file (${bucketName}/${filePath}):`, err);
    return null;
  }
};
