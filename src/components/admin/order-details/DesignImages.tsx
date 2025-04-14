
import { useState, useEffect } from "react";
import { Order } from "@/types";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { checkFileExistsInStorage, getStorageFileUrl } from "@/utils/storage/file-utils";

interface DesignImagesProps {
  order: Order;
  onViewImage: (imageUrl: string) => void;
}

export const DesignImages = ({ order, onViewImage }: DesignImagesProps) => {
  const [designImagesLoaded, setDesignImagesLoaded] = useState({
    front: false,
    back: false
  });
  const [frontDesignImageUrl, setFrontDesignImageUrl] = useState<string | null>(null);
  const [backDesignImageUrl, setBackDesignImageUrl] = useState<string | null>(null);
  const [designImagesExist, setDesignImagesExist] = useState({
    front: false,
    back: false
  });
  const [isCheckingImages, setIsCheckingImages] = useState(true);

  useEffect(() => {
    const initializeImages = async () => {
      setIsCheckingImages(true);
      
      // Check front design image
      const frontImagePath = order.designImageFront || order.designImage;
      if (frontImagePath) {
        // Check if the file exists in storage
        const exists = await checkFileExistsInStorage('design_images', frontImagePath);
        setDesignImagesExist(prev => ({ ...prev, front: exists }));
        console.log(`Front design image exists check for ${frontImagePath}: ${exists}`);
        
        // Get the public URL
        const url = getStorageFileUrl('design_images', frontImagePath);
        setFrontDesignImageUrl(url);
        console.log(`Front design image URL for ${frontImagePath}: ${url}`);
      }
      
      // Check back design image
      if (order.designImageBack) {
        const exists = await checkFileExistsInStorage('design_images', order.designImageBack);
        setDesignImagesExist(prev => ({ ...prev, back: exists }));
        console.log(`Back design image exists check for ${order.designImageBack}: ${exists}`);
        
        const url = getStorageFileUrl('design_images', order.designImageBack);
        setBackDesignImageUrl(url);
        console.log(`Back design image URL for ${order.designImageBack}: ${url}`);
      }
      
      setIsCheckingImages(false);
    };
    
    initializeImages();
  }, [order.designImageFront, order.designImage, order.designImageBack]);

  const handleImageLoad = (type: 'front' | 'back') => {
    setDesignImagesLoaded(prev => ({ ...prev, [type]: true }));
  };

  const handleImageError = (type: 'front' | 'back', imagePath?: string) => {
    console.error(`Failed to load ${type} image:`, imagePath);
    setDesignImagesLoaded(prev => ({ ...prev, [type]: false }));
  };
  
  const getFallbackImageUrl = (): string => {
    return '/placeholder.svg';
  };
  
  const getFrontDesignImageUrl = (): string => {
    const imagePath = order.designImageFront || order.designImage;
    if (!imagePath) return getFallbackImageUrl();
    return frontDesignImageUrl || getFallbackImageUrl();
  };
  
  const getBackDesignImageUrl = (): string => {
    if (!order.designImageBack) return getFallbackImageUrl();
    return backDesignImageUrl || getFallbackImageUrl();
  };
  
  const hasFrontDesign = !!(order.designImageFront || order.designImage);
  const hasBackDesign = !!order.designImageBack;
  
  if (!hasFrontDesign && !hasBackDesign) {
    return null;
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Hình ảnh thiết kế</h3>
      
      {isCheckingImages && (
        <div className="p-4 text-center text-muted-foreground">
          <div className="inline-block animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
          Đang kiểm tra hình ảnh...
        </div>
      )}
      
      {!isCheckingImages && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hasFrontDesign && (
            <div className="border rounded p-3">
              <h4 className="font-medium text-sm mb-2">Mặt trước</h4>
              <div className="relative">
                <img 
                  src={getFrontDesignImageUrl()} 
                  alt="Front Design Preview" 
                  className="max-h-64 object-contain cursor-pointer w-full"
                  onClick={() => {
                    onViewImage(getFrontDesignImageUrl());
                  }}
                  onLoad={() => handleImageLoad('front')}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getFallbackImageUrl();
                    handleImageError('front', order.designImageFront || order.designImage);
                  }}
                />
                
                {(!designImagesExist.front || !designImagesLoaded.front) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-500/70 text-white p-1 text-xs flex items-center justify-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Có vấn đề với hình ảnh thiết kế
                  </div>
                )}
              </div>
              <p className="text-xs mt-1 text-muted-foreground break-all">
                {order.designImageFront || order.designImage || "N/A"}
              </p>
            </div>
          )}
          
          {hasBackDesign && (
            <div className="border rounded p-3">
              <h4 className="font-medium text-sm mb-2">Mặt sau</h4>
              <div className="relative">
                <img 
                  src={getBackDesignImageUrl()} 
                  alt="Back Design Preview" 
                  className="max-h-64 object-contain cursor-pointer w-full"
                  onClick={() => {
                    onViewImage(getBackDesignImageUrl());
                  }}
                  onLoad={() => handleImageLoad('back')}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getFallbackImageUrl();
                    handleImageError('back', order.designImageBack);
                  }}
                />
                
                {(!designImagesExist.back || !designImagesLoaded.back) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-500/70 text-white p-1 text-xs flex items-center justify-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Có vấn đề với hình ảnh thiết kế
                  </div>
                )}
              </div>
              <p className="text-xs mt-1 text-muted-foreground break-all">
                {order.designImageBack || "N/A"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
