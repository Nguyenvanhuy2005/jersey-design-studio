
import { supabase } from "@/integrations/supabase/client";

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
    if (!path) {
      console.log('Empty path provided to checkFileExistsInStorage');
      return false;
    }
    
    // Get the folder path and filename
    const pathParts = path.split('/');
    const fileName = pathParts.pop();
    const folderPath = pathParts.join('/');
    
    if (!fileName) {
      console.log('Invalid path format (no filename) provided to checkFileExistsInStorage');
      return false;
    }
    
    // Try direct download to check if file exists
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(`${folderPath}/${fileName}`);
    
    if (error) {
      if (error.message.includes('Object not found') || 
          error.message.includes('The specified key does not exist')) {
        console.log(`File ${path} in ${bucket} does not exist (verified via download)`);
        return false;
      }
      
      // If we get another error, fall back to list method
      console.warn(`Error checking file via download, falling back to list method:`, error);
    } else if (data) {
      // File exists and we were able to download it
      return true;
    }
    
    // Fallback method: list files in the directory
    const { data: files, error: listError } = await supabase.storage
      .from(bucket)
      .list(folderPath, {
        limit: 100,
        search: fileName
      });
      
    if (listError) {
      console.error(`Error listing files in ${bucket}/${folderPath}:`, listError);
      return false;
    }
    
    const fileExists = files && files.length > 0 && files.some(file => file.name === fileName);
    console.log(`File ${path} in ${bucket} exists (via list method): ${fileExists}`);
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
    
    if (!data || !data.publicUrl) {
      console.error(`Failed to get public URL for ${bucket}/${path}`);
      return { success: true, publicUrl: null };
    }
    
    console.log(`Successfully verified image upload to ${bucket}: ${path}`);
    return { success: true, publicUrl: data.publicUrl };
  } catch (err) {
    console.error(`Error verifying image upload to ${bucket}:`, err);
    return { success: false, publicUrl: null };
  }
};
