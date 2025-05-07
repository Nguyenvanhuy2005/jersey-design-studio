
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const REQUIRED_BUCKETS = ['design_images', 'reference_images', 'logos'];

/**
 * Checks if all required storage buckets exist
 * @returns Promise resolving to boolean indicating if all buckets exist
 */
export const checkStorageBucketsExist = async (): Promise<boolean> => {
  try {
    console.log('Checking if storage buckets exist...');
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error checking buckets:', error);
      return false;
    }
    
    if (!buckets || buckets.length === 0) {
      console.log('No buckets found');
      return false;
    }
    
    const existingBucketNames = buckets.map(bucket => bucket.name);
    console.log('Existing buckets:', existingBucketNames);
    
    const missingBuckets = REQUIRED_BUCKETS.filter(
      required => !existingBucketNames.includes(required)
    );
    
    if (missingBuckets.length > 0) {
      console.log('Missing buckets:', missingBuckets);
      return false;
    }
    
    console.log('All required buckets exist:', REQUIRED_BUCKETS);
    return true;
  } catch (err) {
    console.error('Exception checking buckets:', err);
    return false;
  }
};

/**
 * Creates all required storage buckets if they don't exist
 * @param retries Number of retry attempts (default: 1)
 * @returns Promise resolving to boolean indicating success
 */
export const createStorageBucketsIfNeeded = async (retries = 2): Promise<boolean> => {
  try {
    // First check which buckets we need to create
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      toast.error('Không thể kiểm tra thư mục lưu trữ hình ảnh. Vui lòng thử lại sau.');
      // Don't return false here, try to create anyway
    }
    
    const existingBucketNames = existingBuckets?.map(b => b.name) || [];
    console.log('Existing buckets before creation attempt:', existingBucketNames);
    
    const bucketsToCreate = REQUIRED_BUCKETS.filter(
      b => !existingBucketNames.includes(b)
    );
    
    if (bucketsToCreate.length === 0) {
      console.log('All required buckets already exist');
      return true;
    }
    
    console.log(`Creating ${bucketsToCreate.length} missing buckets:`, bucketsToCreate);
    
    // Create each missing bucket with error handling and retries
    const results = await Promise.all(
      bucketsToCreate.map(async bucketName => {
        try {
          console.log(`Creating bucket: ${bucketName}`);
          const { error } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 5 * 1024 * 1024, // 5MB limit
          });
          
          if (error) {
            console.error(`Error creating bucket ${bucketName}:`, error);
            
            // Check permissions error specifically
            if (error.message.includes('permission') || error.message.includes('not authorized')) {
              console.error(`Permission denied creating bucket ${bucketName}. User may need to be logged in or have proper permissions.`);
              toast.error(`Không có quyền tạo thư mục lưu trữ "${bucketName}". Vui lòng đăng nhập lại.`);
            }
            
            return false;
          }
          
          console.log(`Successfully created bucket: ${bucketName}`);
          return true;
        } catch (err) {
          console.error(`Exception creating bucket ${bucketName}:`, err);
          return false;
        }
      })
    );
    
    const allSuccess = results.every(result => result === true);
    
    if (!allSuccess && retries > 0) {
      console.log(`Some buckets failed to create, retrying (${retries} attempts left)...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
      return createStorageBucketsIfNeeded(retries - 1);
    }
    
    if (!allSuccess) {
      console.error('Failed to create all required buckets after retries');
      toast.error('Không thể tạo đầy đủ thư mục lưu trữ hình ảnh. Một số tính năng có thể không hoạt động.');
    } else {
      console.log('Successfully created all required buckets');
      toast.success('Đã khởi tạo thư mục lưu trữ hình ảnh thành công');
    }
    
    return allSuccess;
  } catch (err) {
    console.error('Exception creating buckets:', err);
    toast.error('Có lỗi xảy ra khi tạo thư mục lưu trữ hình ảnh');
    return false;
  }
};

/**
 * Verifies that the buckets have correct permissions
 * @returns Promise resolving to boolean indicating if permissions are correct
 */
export const verifyBucketPermissions = async (): Promise<boolean> => {
  try {
    // Try to retrieve the bucket policies to verify permissions
    const verificationResults = await Promise.all(
      REQUIRED_BUCKETS.map(async (bucketName) => {
        try {
          const { data, error } = await supabase.storage
            .from(bucketName)
            .list('', { limit: 1 });
          
          if (error) {
            console.error(`Permission error for bucket ${bucketName}:`, error);
            return false;
          }
          
          console.log(`Successfully verified access to bucket ${bucketName}`);
          return true;
        } catch (err) {
          console.error(`Error verifying permissions for bucket ${bucketName}:`, err);
          return false;
        }
      })
    );
    
    const allPermissionsValid = verificationResults.every(result => result === true);
    if (!allPermissionsValid) {
      console.error('Some buckets have permission issues. User may need to authenticate or get proper permissions');
    }
    
    return allPermissionsValid;
  } catch (err) {
    console.error('Exception checking bucket permissions:', err);
    return false;
  }
};
