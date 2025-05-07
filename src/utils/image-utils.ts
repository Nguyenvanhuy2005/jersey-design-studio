
// Export all image utilities from a single file for backward compatibility
import { checkStorageBucketsExist, createStorageBucketsIfNeeded, verifyBucketPermissions } from './storage/bucket-utils';
import { checkFileExistsInStorage, verifyImageUpload } from './storage/file-utils';
import { uploadDesignImage, uploadReferenceImage, uploadLogo } from './storage/upload-utils';
import { getDesignImageUrl, checkDesignImageExists } from './images/design-image-utils';
import { getReferenceImageUrl, checkReferenceImageExists, getReferenceImageUrls } from './images/reference-image-utils';
import { getFallbackImageUrl } from './images/fallback-utils';
import { toast } from "sonner";

// Ensure storage buckets exist
const ensureStorageBuckets = async (): Promise<boolean> => {
  try {
    console.log('Starting ensureStorageBuckets process...');
    
    // Check if buckets exist first
    const bucketsExist = await checkStorageBucketsExist();
    console.log(`checkStorageBucketsExist returned: ${bucketsExist}`);
    
    if (!bucketsExist) {
      console.log('Some buckets do not exist, attempting to create them...');
      
      // Create buckets if they don't exist
      const created = await createStorageBucketsIfNeeded();
      console.log(`createStorageBucketsIfNeeded returned: ${created}`);
      
      if (created) {
        console.log('Created storage buckets successfully');
        toast.success('Đã khởi tạo thư mục lưu trữ hình ảnh thành công.');
        
        // Verify permissions after creation
        const permissionsValid = await verifyBucketPermissions();
        if (!permissionsValid) {
          console.warn('Created buckets, but permissions validation failed.');
          toast.warning('Đã tạo thư mục lưu trữ nhưng quyền truy cập có thể bị hạn chế.');
        }
      } else {
        console.error('Failed to create some or all storage buckets');
        toast.error('Không thể tạo thư mục lưu trữ hình ảnh. Vui lòng thử lại sau.');
        return false;
      }
    } else {
      console.log('All required buckets already exist.');
    }
    
    return true;
  } catch (err) {
    console.error('Error ensuring storage buckets exist:', err);
    toast.error('Có lỗi khi khởi tạo thư mục lưu trữ hình ảnh.');
    return false;
  }
};

// Re-export everything for backward compatibility
export {
  // Bucket utilities
  checkStorageBucketsExist,
  createStorageBucketsIfNeeded,
  ensureStorageBuckets,
  verifyBucketPermissions,
  
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
