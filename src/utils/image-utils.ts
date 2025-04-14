
import { supabase } from "@/integrations/supabase/client";

export const checkDesignImageExists = async (path: string): Promise<boolean> => {
  if (!path) return false;
  
  try {
    // Extract folder path and filename
    const pathParts = path.split('/');
    const fileName = pathParts.pop();
    const folderPath = pathParts.join('/');
    
    if (!fileName) return false;
    
    const { data, error } = await supabase.storage
      .from('design_images')
      .list(folderPath, {
        search: fileName,
      });
    
    if (error) {
      console.error("Error checking design image:", error);
      return false;
    }
    
    return data && data.length > 0;
    
  } catch (err) {
    console.error("Error checking design image:", err);
    return false;
  }
};

export const getDesignImageUrl = (path: string): string | null => {
  if (!path) return null;
  
  try {
    const { data } = supabase.storage
      .from('design_images')
      .getPublicUrl(path);
      
    return data.publicUrl;
  } catch (err) {
    console.error("Error getting design image URL:", err);
    return null;
  }
};

export const getFallbackImageUrl = (type: 'design' | 'reference'): string => {
  return type === 'design' ? '/placeholder.svg' : '/placeholder.svg';
};

// Check if storage buckets exist
export const checkStorageBucketsExist = async () => {
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

// Create storage buckets if needed
export const createStorageBucketsIfNeeded = async () => {
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
