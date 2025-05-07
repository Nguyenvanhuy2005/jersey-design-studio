
// Export all image utilities from a single file for backward compatibility
import { checkStorageBucketsExist, createStorageBucketsIfNeeded } from './storage/bucket-utils';
import { checkFileExistsInStorage, verifyImageUpload } from './storage/file-utils';
import { uploadDesignImage, uploadReferenceImage, uploadLogo } from './storage/upload-utils';
import { getDesignImageUrl, checkDesignImageExists } from './images/design-image-utils';
import { getReferenceImageUrl, checkReferenceImageExists, getReferenceImageUrls } from './images/reference-image-utils';
import { getFallbackImageUrl } from './images/fallback-utils';

// Ensure storage buckets exist
const ensureStorageBuckets = async (): Promise<boolean> => {
  try {
    // Check if buckets exist first
    const bucketsExist = await checkStorageBucketsExist();
    if (!bucketsExist) {
      // Create buckets if they don't exist
      await createStorageBucketsIfNeeded();
      console.log('Created storage buckets successfully');
    }
    return true;
  } catch (err) {
    console.error('Error ensuring storage buckets exist:', err);
    return false;
  }
};

// Re-export everything for backward compatibility
export {
  // Bucket utilities
  checkStorageBucketsExist,
  createStorageBucketsIfNeeded,
  ensureStorageBuckets,
  
  // File utilities
  checkFileExistsInStorage,
  verifyImageUpload,
  uploadDesignImage,
  
  // Upload utilities
  uploadReferenceImage,
  uploadLogo,
  
  // Design image utilities
  getDesignImageUrl,
  checkDesignImageExists,
  
  // Reference image utilities
  getReferenceImageUrl,
  checkReferenceImageExists,
  getReferenceImageUrls,
  
  // Fallback utilities
  getFallbackImageUrl
};
