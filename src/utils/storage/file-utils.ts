
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
    if (!path) return false;
    
    // Get the folder path and filename
    const pathParts = path.split('/');
    const fileName = pathParts.pop();
    const folderPath = pathParts.join('/');
    
    if (!fileName) return false;
    
    // Log the file extension for debugging
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    console.log(`Checking if file exists (${extension}): ${path} in bucket ${bucket}`);
    
    // Create the bucket if it doesn't exist
    try {
      await createBucketIfNeeded(bucket);
    } catch (bucketErr) {
      console.error(`Error creating bucket ${bucket}:`, bucketErr);
      // Continue checking, as the bucket might already exist
    }
    
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
    
    // Log file extension for debugging
    const extension = path.split('.').pop()?.toLowerCase() || '';
    console.log(`Verifying image upload (${extension}): ${path} in bucket ${bucket}`);
    
    // Create the bucket if it doesn't exist
    try {
      await createBucketIfNeeded(bucket);
    } catch (bucketErr) {
      console.error(`Error creating bucket ${bucket}:`, bucketErr);
      // Continue verification, as the bucket might already exist
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
    console.log(`Public URL: ${data.publicUrl}`);
    return { success: true, publicUrl: data.publicUrl };
  } catch (err) {
    console.error(`Error verifying image upload to ${bucket}:`, err instanceof Error ? err.message : err);
    return { success: false, publicUrl: null };
  }
};

/**
 * Helper function to create a bucket if it doesn't exist
 * @param bucketName The name of the bucket to create
 */
export const createBucketIfNeeded = async (bucketName: string): Promise<void> => {
  try {
    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      return;
    }
    
    const bucketExists = buckets.some(bucket => 
      bucket.name === bucketName || 
      bucket.name.toLowerCase() === bucketName.toLowerCase()
    );
    
    if (!bucketExists) {
      console.log(`Bucket '${bucketName}' does not exist. Creating...`);
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (error) {
        console.error(`Error creating bucket '${bucketName}':`, error);
        // Removed toast.error notification
      } else {
        console.log(`Successfully created bucket '${bucketName}'`);
        // Removed toast.success notification
      }
    } else {
      console.log(`Bucket '${bucketName}' already exists`);
    }
  } catch (err) {
    console.error(`Error creating bucket '${bucketName}':`, err);
    throw err;
  }
};
