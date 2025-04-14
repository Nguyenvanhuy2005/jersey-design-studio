
import { supabase } from "@/integrations/supabase/client";

export interface StorageBucketsStatus {
  designImages: boolean;
  referenceImages: boolean;
  checking: boolean;
  error?: string;
}

export const checkStorageBucketsExist = async (): Promise<StorageBucketsStatus> => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Error checking storage buckets:", error);
      return { 
        designImages: false, 
        referenceImages: false, 
        checking: false,
        error: error.message 
      };
    }
    
    // Check for design_images bucket
    const designBucketExists = buckets.some(bucket => 
      bucket.name === 'design_images' || 
      bucket.name === 'Design Images' ||
      bucket.name.toLowerCase() === 'design_images'
    );
    
    // Check for reference_images bucket
    const refBucketExists = buckets.some(bucket => 
      bucket.name === 'reference_images' || 
      bucket.name === 'Reference Images' ||
      bucket.name.toLowerCase() === 'reference_images'
    );
    
    return {
      designImages: designBucketExists,
      referenceImages: refBucketExists,
      checking: false
    };
  } catch (err) {
    console.error("Exception checking storage buckets:", err);
    return { 
      designImages: false, 
      referenceImages: false, 
      checking: false,
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
};

export const createStorageBucketsIfNeeded = async (): Promise<{
  success: boolean;
  message: string;
  created: { designImages: boolean; referenceImages: boolean };
}> => {
  const created = { designImages: false, referenceImages: false };
  
  try {
    // Check if buckets exist
    const { designImages, referenceImages, error } = await checkStorageBucketsExist();
    
    if (error) {
      console.warn(`Unable to check buckets: ${error}. Assuming they exist and continuing...`);
      return { 
        success: true, 
        message: 'Assuming buckets exist due to permission restrictions',
        created 
      };
    }
    
    // Create design_images bucket if needed
    if (!designImages) {
      try {
        const { error: createError } = await supabase.storage.createBucket('design_images', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (createError) {
          console.error("Error creating design_images bucket:", createError);
        } else {
          console.log("Successfully created design_images bucket");
          created.designImages = true;
        }
      } catch (err) {
        console.warn("Exception creating design_images bucket:", err);
      }
    } else {
      console.log("design_images bucket already exists");
    }
    
    // Create reference_images bucket if needed
    if (!referenceImages) {
      try {
        const { error: createError } = await supabase.storage.createBucket('reference_images', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (createError) {
          console.error("Error creating reference_images bucket:", createError);
        } else {
          console.log("Successfully created reference_images bucket");
          created.referenceImages = true;
        }
      } catch (err) {
        console.warn("Exception creating reference_images bucket:", err);
      }
    } else {
      console.log("reference_images bucket already exists");
    }
    
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
