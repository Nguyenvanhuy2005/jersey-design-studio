
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
    
    console.log(`Checking if file exists in ${bucket}: ${folderPath}/${fileName}`);
    
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
      
      // Log specific error details
      console.warn(`Error checking file via download method:`, error);
      console.warn(`Error message: ${error.message}`);
      console.warn(`Error status: ${error.status}`);
      
      // If we get another error, fall back to list method
      console.warn(`Falling back to list method to check if file exists`);
    } else if (data) {
      // File exists and we were able to download it
      console.log(`File ${path} in ${bucket} exists (verified via download)`);
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
      console.error(`Error message: ${listError.message}`);
      console.error(`Error status: ${listError.status}`);
      return false;
    }
    
    const fileExists = files && files.length > 0 && files.some(file => file.name === fileName);
    console.log(`File ${path} in ${bucket} exists (via list method): ${fileExists}`);
    if (fileExists) {
      console.log(`Found file in directory listing: ${fileName}`);
    }
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
 * @returns Promise resolving to success status and public URL
 */
export const verifyImageUpload = async (
  bucket: string,
  path: string
): Promise<{ success: boolean, publicUrl: string | null }> => {
  try {
    if (!path) {
      console.log('Empty path provided to verifyImageUpload');
      return { success: false, publicUrl: null };
    }
    
    console.log(`Verifying image upload in ${bucket}: ${path}`);
    
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
    console.log(`Public URL: ${data.publicUrl}`);
    
    // Try to verify the image is actually accessible via the URL
    try {
      const response = await fetch(data.publicUrl, { method: 'HEAD' });
      if (!response.ok) {
        console.warn(`Image URL exists but returned status ${response.status}: ${data.publicUrl}`);
      } else {
        console.log(`Verified image URL is accessible: ${data.publicUrl}`);
      }
    } catch (err) {
      console.warn(`Could not verify image URL accessibility: ${err}`);
      // Continue anyway since head request failures could be due to CORS
    }
    
    return { success: true, publicUrl: data.publicUrl };
  } catch (err) {
    console.error(`Error verifying image upload to ${bucket}:`, err);
    return { success: false, publicUrl: null };
  }
};
