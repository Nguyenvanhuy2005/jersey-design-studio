
import { supabase } from "@/integrations/supabase/client";
import { createStorageBucketsIfNeeded } from "./bucket-utils";
import { checkFileExistsInStorage } from "./file-utils";

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
  // Create file path using suffix for front/back differentiation
  const filePath = `${orderId}/${fileNameSuffix}.png`;
  
  try {
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
            console.error('Failed all attempts to upload design image');
            return '';
          }
          
          // Wait before retrying (increased delay with each attempt)
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        
        // Verify the upload was successful
        const fileExists = await checkFileExistsInStorage('design_images', data.path);
        if (!fileExists) {
          console.error(`Upload reported success but file not found in storage: ${data.path}`);
          
          if (attempt === retries) {
            return '';
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        
        console.log(`Successfully uploaded and verified design image on attempt ${attempt + 1}:`, data.path);
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
  } catch (err) {
    console.error('Error in uploadDesignImage:', err);
  }
  
  return '';
};

/**
 * Uploads a reference image to storage with proper error handling
 * @param orderId The order ID to associate with the image
 * @param imageFile The file to upload
 * @param index Optional index for the file name
 * @returns Promise resolving to the uploaded file path or empty string
 */
export const uploadReferenceImage = async (
  orderId: string,
  imageFile: File,
  index?: number
): Promise<string> => {
  try {
    await createStorageBucketsIfNeeded();
    
    const fileExt = imageFile.name.split('.').pop() || 'png';
    const timestamp = Date.now();
    const indexSuffix = index !== undefined ? `-${index}` : '';
    const filePath = `${orderId}/${timestamp}-ref${indexSuffix}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('reference_images')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error(`Error uploading reference image:`, error);
      return '';
    }
    
    // Verify upload
    const fileExists = await checkFileExistsInStorage('reference_images', data.path);
    if (!fileExists) {
      console.error(`Reference image upload reported success but file not found: ${data.path}`);
      return '';
    }
    
    return data.path;
  } catch (err) {
    console.error('Error in uploadReferenceImage:', err);
    return '';
  }
};

/**
 * Uploads a logo to storage with proper error handling
 * @param orderId The order ID to associate with the logo
 * @param logoFile The file to upload
 * @param position The position of the logo (e.g., 'chest_left')
 * @returns Promise resolving to the uploaded file path or empty string
 */
export const uploadLogo = async (
  orderId: string,
  logoFile: File,
  position: string
): Promise<string> => {
  try {
    await createStorageBucketsIfNeeded();
    
    const fileExt = logoFile.name.split('.').pop() || 'png';
    const filePath = `${orderId}/${Date.now()}-${position}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('logos')
      .upload(filePath, logoFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error(`Error uploading logo at position ${position}:`, error);
      return '';
    }
    
    // Verify upload
    const fileExists = await checkFileExistsInStorage('logos', data.path);
    if (!fileExists) {
      console.error(`Logo upload reported success but file not found: ${data.path}`);
      return '';
    }
    
    return data.path;
  } catch (err) {
    console.error(`Error in uploadLogo:`, err);
    return '';
  }
};

// Remove the duplicate export at the bottom that's causing the error
