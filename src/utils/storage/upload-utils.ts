
import { supabase } from "@/integrations/supabase/client";
import { createStorageBucketsIfNeeded, verifyBucketPermissions } from "./bucket-utils";
import { checkFileExistsInStorage, verifyImageUpload } from "./file-utils";
import { toast } from "sonner";

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
  const bucketName = 'design_images';
  
  try {
    // First, ensure the bucket exists (but don't fail if we can't create it due to RLS)
    const bucketsCreated = await createStorageBucketsIfNeeded();
    if (!bucketsCreated) {
      console.warn('Could not verify all storage buckets exist. Trying upload anyway...');
    }
    
    // Verify permissions on buckets before attempting upload
    await verifyBucketPermissions();
    
    // Try to upload with retries
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`Uploading design image to ${bucketName}/${filePath} (attempt ${attempt + 1}/${retries + 1})...`);
        
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (error) {
          console.error(`Error uploading design image (attempt ${attempt + 1}):`, error);
          
          // Handle specific error cases
          if (error.message.includes('permission') || error.message.includes('not authorized')) {
            toast.error('Không có quyền tải hình ảnh lên. Vui lòng đăng nhập lại.');
          } else if (error.message.includes('bucket') && error.message.includes('not found')) {
            toast.error(`Thư mục lưu trữ "${bucketName}" không tồn tại. Đang thử tạo lại...`);
            await createStorageBucketsIfNeeded(1);
          } else {
            // Only show generic error on last attempt
            if (attempt === retries) {
              toast.error(`Không thể tải hình ảnh lên: ${error.message}`);
            }
          }
          
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
        const { success, publicUrl } = await verifyImageUpload(bucketName, data.path);
        if (!success) {
          console.error(`Upload reported success but image validation failed: ${data.path}`);
          
          if (attempt === retries) {
            toast.error('Hình ảnh đã tải lên nhưng không thể xác thực. Vui lòng thử lại.');
            return '';
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        
        console.log(`Successfully uploaded and verified design image on attempt ${attempt + 1}:`, data.path);
        console.log('Public URL:', publicUrl);
        return data.path;
      } catch (err) {
        console.error(`Exception uploading design image (attempt ${attempt + 1}):`, err);
        
        // If this is the last attempt, give up
        if (attempt === retries) {
          toast.error('Có lỗi khi tải hình ảnh lên. Vui lòng thử lại sau.');
          return '';
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  } catch (err) {
    console.error('Error in uploadDesignImage:', err);
    toast.error('Có lỗi không xác định khi tải hình ảnh lên.');
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
  const bucketName = 'reference_images';
  
  try {
    // Ensure storage buckets exist with added logging
    console.log(`Beginning upload of reference image to ${bucketName}`);
    const bucketsCreated = await createStorageBucketsIfNeeded();
    if (!bucketsCreated) {
      console.warn('Could not ensure all buckets exist. Will attempt upload anyway...');
    }
    
    // Get file extension, default to png if not found
    const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'png';
    const timestamp = Date.now();
    const indexSuffix = index !== undefined ? `-${index}` : '';
    const filePath = `${orderId}/${timestamp}-ref${indexSuffix}.${fileExt}`;
    
    console.log(`Uploading reference image to ${bucketName}/${filePath}`);
    console.log(`File type: ${imageFile.type}, size: ${imageFile.size} bytes`);
    
    // Attempt upload with 2 retries
    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error(`Error uploading reference image (attempt ${attempt + 1}):`, error);
          
          if (error.message.includes('permission') || error.message.includes('not authorized')) {
            toast.error('Không có quyền tải hình ảnh tham khảo. Vui lòng đăng nhập lại.');
          } else if (error.message.includes('bucket') && error.message.includes('not found')) {
            toast.error(`Thư mục "${bucketName}" không tồn tại. Đang thử tạo lại...`);
            await createStorageBucketsIfNeeded(1);
          }
          
          if (attempt === 2) {
            toast.error(`Không thể tải hình ảnh tham khảo: ${error.message}`);
            return '';
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        
        // Verify upload
        const { success, publicUrl } = await verifyImageUpload(bucketName, data.path);
        if (!success) {
          console.error(`Reference image upload validation failed: ${data.path}`);
          
          if (attempt === 2) {
            toast.error('Hình ảnh tham khảo đã tải lên nhưng không thể xác thực.');
            return '';
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        
        console.log('Successfully uploaded reference image:', data.path);
        console.log('Public URL:', publicUrl);
        return data.path;
      } catch (err) {
        console.error(`Exception in reference image upload (attempt ${attempt + 1}):`, err);
        
        if (attempt === 2) {
          toast.error('Có lỗi khi tải hình ảnh tham khảo.');
          return '';
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
    
    return '';
  } catch (err) {
    console.error('Error in uploadReferenceImage:', err);
    toast.error('Có lỗi không xác định khi tải hình ảnh tham khảo.');
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
  const bucketName = 'logos';
  
  try {
    // Ensure buckets exist before uploading
    console.log(`Beginning upload of logo (position: ${position}) to ${bucketName}`);
    const bucketsCreated = await createStorageBucketsIfNeeded();
    if (!bucketsCreated) {
      console.warn('Could not ensure all buckets exist. Will attempt upload anyway...');
    }
    
    // Get file extension, default to png if not found
    const fileExt = logoFile.name.split('.').pop()?.toLowerCase() || 'png';
    const timestamp = Date.now();
    const filePath = `${orderId}/${timestamp}-${position}.${fileExt}`;
    
    console.log(`Uploading logo to ${bucketName}/${filePath}`);
    console.log(`File type: ${logoFile.type}, size: ${logoFile.size} bytes`);
    
    // Attempt upload with retries
    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, logoFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error(`Error uploading logo at position ${position} (attempt ${attempt + 1}):`, error);
          
          if (error.message.includes('permission') || error.message.includes('not authorized')) {
            toast.error('Không có quyền tải logo lên. Vui lòng đăng nhập lại.');
          } else if (error.message.includes('bucket') && error.message.includes('not found')) {
            toast.error(`Thư mục "${bucketName}" không tồn tại. Đang thử tạo lại...`);
            await createStorageBucketsIfNeeded(1);
          }
          
          if (attempt === 2) {
            toast.error(`Không thể tải logo lên: ${error.message}`);
            return '';
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        
        // Verify upload
        const { success, publicUrl } = await verifyImageUpload(bucketName, data.path);
        if (!success) {
          console.error(`Logo upload validation failed: ${data.path}`);
          
          if (attempt === 2) {
            toast.error('Logo đã tải lên nhưng không thể xác thực.');
            return '';
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        
        console.log(`Successfully uploaded logo at position ${position}:`, data.path);
        console.log('Public URL:', publicUrl);
        return data.path;
      } catch (err) {
        console.error(`Exception uploading logo at position ${position} (attempt ${attempt + 1}):`, err);
        
        if (attempt === 2) {
          toast.error(`Có lỗi khi tải logo vị trí ${position}.`);
          return '';
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
    
    return '';
  } catch (err) {
    console.error(`Error in uploadLogo:`, err);
    toast.error('Có lỗi không xác định khi tải logo lên.');
    return '';
  }
};
