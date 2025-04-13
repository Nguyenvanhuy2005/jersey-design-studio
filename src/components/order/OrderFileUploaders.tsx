
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo, PrintConfig, DesignData } from "@/types";
import { createStorageBucketsIfNeeded, checkFileExistsInStorage } from "@/utils/image-utils";

export const useOrderFileUploaders = () => {
  const uploadReferenceImages = async (orderId: string, referenceImages: File[]): Promise<string[]> => {
    if (referenceImages.length === 0) return [];
    
    const uploadedPaths: string[] = [];
    let uploadProgress = 0;
    
    toast.info(`Đang tải lên hình ảnh tham khảo (0/${referenceImages.length})...`);
    
    for (const [index, file] of referenceImages.entries()) {
      try {
        const fileExt = file.name.split('.').pop();
        const filePath = `${orderId}/${Date.now()}-ref-${index}.${fileExt}`;
        
        console.log(`Uploading reference image ${index} to ${filePath}...`);
        
        const { data, error } = await supabase.storage
          .from('reference_images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error(`Error uploading reference image ${index}:`, error);
          toast.error(`Không thể tải lên hình ảnh tham khảo ${index + 1}: ${error.message}`);
          continue;
        }
        
        const { data: urlData } = supabase.storage
          .from('reference_images')
          .getPublicUrl(data.path);
          
        console.log(`Reference image ${index} public URL: ${urlData.publicUrl}`);
        
        uploadedPaths.push(data.path);
        uploadProgress++;
        
        toast.info(`Đang tải lên hình ảnh tham khảo (${uploadProgress}/${referenceImages.length})...`);
        
      } catch (err) {
        console.error(`Error uploading reference image ${index}:`, err);
        toast.error(`Có lỗi khi tải lên hình ảnh tham khảo ${index + 1}`);
      }
    }
    
    if (uploadedPaths.length > 0) {
      toast.success(`Đã tải lên ${uploadedPaths.length}/${referenceImages.length} hình ảnh tham khảo`);
    }
    
    return uploadedPaths;
  };

  const uploadFontFiles = async (
    orderId: string,
    printConfig: PrintConfig
  ): Promise<{ textFontPath?: string, numberFontPath?: string }> => {
    const result: { textFontPath?: string, numberFontPath?: string } = {};
    
    if (printConfig.fontText.customFontFile) {
      try {
        const file = printConfig.fontText.customFontFile;
        const fileExt = file.name.split('.').pop();
        const filePath = `${orderId}/fonts/text-${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('fonts')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error(`Error uploading text font:`, error);
          toast.error(`Không thể tải lên font chữ: ${error.message}`);
        } else {
          const { data: urlData } = supabase.storage
            .from('fonts')
            .getPublicUrl(data.path);
            
          console.log(`Text font public URL: ${urlData.publicUrl}`);
          result.textFontPath = data.path;
        }
      } catch (err) {
        console.error(`Error uploading text font:`, err);
        toast.error(`Có lỗi khi tải lên font chữ`);
      }
    }
    
    if (printConfig.fontNumber.customFontFile) {
      try {
        const file = printConfig.fontNumber.customFontFile;
        const fileExt = file.name.split('.').pop();
        const filePath = `${orderId}/fonts/number-${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('fonts')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error(`Error uploading number font:`, error);
          toast.error(`Không thể tải lên font số: ${error.message}`);
        } else {
          const { data: urlData } = supabase.storage
            .from('fonts')
            .getPublicUrl(data.path);
            
          console.log(`Number font public URL: ${urlData.publicUrl}`);
          result.numberFontPath = data.path;
        }
      } catch (err) {
        console.error(`Error uploading number font:`, err);
        toast.error(`Có lỗi khi tải lên font số`);
      }
    }
    
    return result;
  };

  return {
    uploadReferenceImages,
    uploadFontFiles
  };
};
