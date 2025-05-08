
// Export all image utilities from a single file for backward compatibility
import { checkStorageBucketsExist, createStorageBucketsIfNeeded } from './storage/bucket-utils';
import { checkFileExistsInStorage, verifyImageUpload } from './storage/file-utils';
import { uploadDesignImage } from './storage/upload-utils';
import { getDesignImageUrl, checkDesignImageExists } from './images/design-image-utils';
import { getReferenceImageUrl, checkReferenceImageExists, getReferenceImageUrls } from './images/reference-image-utils';
import { getFallbackImageUrl } from './images/fallback-utils';

// Re-export everything for backward compatibility
export {
  // Bucket utilities
  checkStorageBucketsExist,
  createStorageBucketsIfNeeded,
  
  // File utilities
  checkFileExistsInStorage,
  verifyImageUpload,
  uploadDesignImage,
  
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
