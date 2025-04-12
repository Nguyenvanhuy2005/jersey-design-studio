
import { useState, useEffect } from "react";
import { Order } from "@/types";
import { AlertTriangle } from "lucide-react";
import { 
  getDesignImageUrl, 
  checkDesignImageExists,
  getFallbackImageUrl 
} from "@/utils/image-utils";

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

  useEffect(() => {
    const initializeImages = async () => {
      const frontImagePath = order.designImageFront || order.designImage;
      if (frontImagePath) {
        const exists = await checkDesignImageExists(frontImagePath);
        setDesignImagesExist(prev => ({ ...prev, front: exists }));
        console.log(`Front design image exists check for ${frontImagePath}: ${exists}`);
        
        const url = getDesignImageUrl(frontImagePath);
        setFrontDesignImageUrl(url);
        console.log(`Front design image URL for ${frontImagePath}: ${url}`);
      }
      
      if (order.designImageBack) {
        const exists = await checkDesignImageExists(order.designImageBack);
        setDesignImagesExist(prev => ({ ...prev, back: exists }));
        console.log(`Back design image exists check for ${order.designImageBack}: ${exists}`);
        
        const url = getDesignImageUrl(order.designImageBack);
        setBackDesignImageUrl(url);
        console.log(`Back design image URL for ${order.designImageBack}: ${url}`);
      }
    };
    
    initializeImages();
  }, [order.designImageFront, order.designImage, order.designImageBack]);

  const handleImageLoad = (type: 'front' | 'back') => {
    if (type === 'front') {
      setDesignImagesLoaded(prev => ({ ...prev, front: true }));
    } else if (type === 'back') {
      setDesignImagesLoaded(prev => ({ ...prev, back: true }));
    }
  };

  const handleImageError = (type: 'front' | 'back', imagePath?: string) => {
    console.error(`Failed to load ${type} image:`, imagePath);
    if (type === 'front') {
      setDesignImagesLoaded(prev => ({ ...prev, front: false }));
    } else if (type === 'back') {
      setDesignImagesLoaded(prev => ({ ...prev, back: false }));
    }
  };
  
  const getFrontDesignImageUrl = (): string => {
    const imagePath = order.designImageFront || order.designImage;
    if (!imagePath) return getFallbackImageUrl('design');
    return frontDesignImageUrl || getFallbackImageUrl('design');
  };
  
  const getBackDesignImageUrl = (): string => {
    if (!order.designImageBack) return getFallbackImageUrl('design');
    return backDesignImageUrl || getFallbackImageUrl('design');
  };
  
  const hasFrontDesign = !!(order.designImageFront || order.designImage);
  const hasBackDesign = !!order.designImageBack;
  
  if (!hasFrontDesign && !hasBackDesign) {
    return null;
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Hình ảnh thiết kế</h3>
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
                  target.src = getFallbackImageUrl('design');
                  handleImageError('front', order.designImageFront || order.designImage);
                }}
              />
              
              {(!designImagesExist.front || !designImagesLoaded.front) && (
                <div className="absolute bottom-0 left-0 right-0 bg-red-500/70 text-white p-1 text-sm flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
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
                  target.src = getFallbackImageUrl('design');
                  handleImageError('back', order.designImageBack);
                }}
              />
              
              {(!designImagesExist.back || !designImagesLoaded.back) && (
                <div className="absolute bottom-0 left-0 right-0 bg-red-500/70 text-white p-1 text-sm flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
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
    </div>
  );
};
