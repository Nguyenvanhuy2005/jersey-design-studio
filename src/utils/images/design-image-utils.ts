
import { supabase } from "@/integrations/supabase/client";
import { checkFileExistsInStorage } from "../storage/file-utils";

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
      try {
        const response = await fetch(imagePath, { method: 'HEAD' });
        return response.ok;
      } catch (err) {
        console.error("Error checking URL existence:", err);
        return false;
      }
    }
    
    // Check if bucket exists first
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      return false;
    }
    
    // If bucket doesn't exist, design image can't exist
    const designBucketExists = buckets.some(bucket => bucket.name === 'design_images');
    if (!designBucketExists) {
      console.error("Bucket 'design_images' does not exist");
      return false;
    }
    
    // First try to download the URL to see if it exists
    const { data, error } = await supabase.storage
      .from('design_images')
      .download(imagePath);
    
    if (error) {
      console.error("Error checking design image exists (download):", error);
      
      // If that failed, try listing the directory to see if the file is there
      try {
        const folderPath = imagePath.split('/').slice(0, -1).join('/');
        const fileName = imagePath.split('/').pop();
        
        if (!fileName) {
          console.error("Invalid image path:", imagePath);
          return false;
        }
        
        const { data: fileList, error: listError } = await supabase.storage
          .from('design_images')
          .list(folderPath, {
            limit: 100,
            search: fileName
          });
        
        if (listError) {
          console.error("Error listing design images:", listError);
          return false;
        }
        
        const fileExists = fileList && fileList.length > 0 && fileList.some(file => file.name === fileName);
        console.log(`Design image ${imagePath} exists (listing): ${fileExists}`);
        return fileExists;
      } catch (listErr) {
        console.error("Error checking image existence by listing:", listErr);
        return false;
      }
    }
    
    // If we successfully downloaded the file, it exists
    console.log(`Design image ${imagePath} exists (download): true`);
    return !!data;
  } catch (error) {
    console.error("Error checking if design image exists:", error);
    return false;
  }
};
