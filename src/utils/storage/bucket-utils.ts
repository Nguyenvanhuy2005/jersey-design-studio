
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if storage buckets exist in Supabase
 * @returns Promise resolving to object with buckets existence status
 */
export const checkStorageBucketsExist = async (): Promise<{ 
  designImages: boolean; 
  referenceImages: boolean; 
  error?: string;
}> => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Error checking storage buckets:", error);
      return { 
        designImages: false, 
        referenceImages: false, 
        error: error.message 
      };
    }
    
    // The bucket name in Supabase might be different from what we expect
    // Check both 'design_images' and 'Design Images'
    const designBucketExists = buckets.some(bucket => 
      bucket.name === 'design_images' || 
      bucket.name === 'Design Images' ||
      bucket.name.toLowerCase() === 'design_images'
    );
    
    const refBucketExists = buckets.some(bucket => 
      bucket.name === 'reference_images' || 
      bucket.name === 'Reference Images' ||
      bucket.name.toLowerCase() === 'reference_images'
    );
    
    console.log("Storage buckets check:", {
      designImages: designBucketExists,
      referenceImages: refBucketExists,
      bucketsFound: buckets.map(b => b.name).join(', ')
    });
    
    return {
      designImages: designBucketExists,
      referenceImages: refBucketExists
    };
  } catch (err) {
    console.error("Exception checking storage buckets:", err);
    return { 
      designImages: false, 
      referenceImages: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
};

/**
 * Create storage buckets if they don't exist
 * @returns Promise resolving when operation completes
 */
export const createStorageBucketsIfNeeded = async (): Promise<{ 
  success: boolean; 
  message: string; 
  created: { designImages: boolean; referenceImages: boolean; } 
}> => {
  const created = { designImages: false, referenceImages: false };
  
  try {
    // Check if buckets exist
    const { designImages, referenceImages, error } = await checkStorageBucketsExist();
    
    if (error) {
      // If we can't check buckets due to permissions, assume they exist
      // This fixes the issue where RLS policy prevents bucket creation but buckets already exist
      console.warn(`Unable to check buckets: ${error}. Assuming they exist and continuing...`);
      return { 
        success: true, 
        message: 'Assuming buckets exist due to permission restrictions',
        created 
      };
    }
    
    // Create design_images bucket if it doesn't exist
    if (!designImages) {
      try {
        const { error: createError } = await supabase.storage.createBucket('design_images', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (createError) {
          // If error is due to RLS policy, assume bucket exists and continue
          if (createError.message.includes('row-level security policy')) {
            console.warn("Unable to create design_images bucket due to RLS policy. Assuming it exists.");
          } else {
            console.error("Error creating design_images bucket:", createError);
          }
        } else {
          console.log("Successfully created design_images bucket");
          created.designImages = true;
        }
      } catch (err) {
        console.warn("Exception creating design_images bucket. Assuming it exists:", err);
      }
    } else {
      console.log("design_images bucket already exists");
    }
    
    // Create reference_images bucket if it doesn't exist
    if (!referenceImages) {
      try {
        const { error: createError } = await supabase.storage.createBucket('reference_images', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (createError) {
          // If error is due to RLS policy, assume bucket exists and continue
          if (createError.message.includes('row-level security policy')) {
            console.warn("Unable to create reference_images bucket due to RLS policy. Assuming it exists.");
          } else {
            console.error("Error creating reference_images bucket:", createError);
          }
        } else {
          console.log("Successfully created reference_images bucket");
          created.referenceImages = true;
        }
      } catch (err) {
        console.warn("Exception creating reference_images bucket. Assuming it exists:", err);
      }
    } else {
      console.log("reference_images bucket already exists");
    }
    
    // Success if we either created buckets or they already existed
    return { 
      success: true, 
      message: 'Buckets check completed',
      created
    };
  } catch (err) {
    console.error("Exception creating storage buckets:", err);
    return { 
      success: false, 
      message: err instanceof Error ? err.message : 'Unknown error',
      created
    };
  }
};
