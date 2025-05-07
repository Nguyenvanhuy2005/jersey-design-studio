
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
    const missingBuckets = REQUIRED_BUCKETS.filter(
      required => !existingBucketNames.includes(required)
    );
    
    if (missingBuckets.length > 0) {
      console.log('Missing buckets:', missingBuckets);
      return false;
    }
    
    console.log('All required buckets exist');
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
export const createStorageBucketsIfNeeded = async (retries = 1): Promise<boolean> => {
  try {
    // First check which buckets we need to create
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      // Don't return false here, try to create anyway
    }
    
    const existingBucketNames = existingBuckets?.map(b => b.name) || [];
    const bucketsToCreate = REQUIRED_BUCKETS.filter(
      b => !existingBucketNames.includes(b)
    );
    
    if (bucketsToCreate.length === 0) {
      console.log('All required buckets already exist');
      return true;
    }
    
    console.log(`Creating ${bucketsToCreate.length} missing buckets:`, bucketsToCreate);
    
    // Create each missing bucket
    const results = await Promise.all(
      bucketsToCreate.map(async bucketName => {
        try {
          const { error } = await supabase.storage.createBucket(bucketName, {
            public: true, // Make buckets public for easier access
          });
          
          if (error) {
            console.error(`Error creating bucket ${bucketName}:`, error);
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
      toast.error('Không thể tạo thư mục lưu trữ hình ảnh');
    }
    
    return allSuccess;
  } catch (err) {
    console.error('Exception creating buckets:', err);
    return false;
  }
};
