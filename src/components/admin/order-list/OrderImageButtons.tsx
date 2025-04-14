
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getFallbackImageUrl, getDesignImageUrl } from "@/utils/image-utils";

type OrderImageButtonsProps = {
  orderId: string | undefined;
  frontDesignImage: string | undefined;
  backDesignImage: string | undefined;
  imageAvailability: {
    front: boolean;
    back: boolean;
  } | undefined;
  isCheckingImages?: boolean;
  onViewImage: (imageUrl: string | null) => void;
};

export const OrderImageButtons = ({
  orderId,
  frontDesignImage,
  backDesignImage,
  imageAvailability,
  isCheckingImages = false,
  onViewImage
}: OrderImageButtonsProps) => {
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});

  const hasFrontDesignImage = !!frontDesignImage;
  const hasBackDesignImage = !!backDesignImage;
  const hasFrontDesignImageError = orderId ? imageLoadErrors[`${orderId}-front`] : false;
  const hasBackDesignImageError = orderId ? imageLoadErrors[`${orderId}-back`] : false;

  const handleImageError = (orderId: string | undefined, side: 'front' | 'back') => {
    if (!orderId) return;
    console.error(`Failed to load ${side} design image for order ${orderId}`);
    setImageLoadErrors(prev => ({ ...prev, [`${orderId}-${side}`]: true }));
  };

  const handleViewImage = (imagePath: string | undefined, type: 'front' | 'back') => {
    console.log(`View ${type} design - path: ${imagePath}`);
    
    if (imagePath) {
      try {
        const imageUrl = getDesignImageUrl(imagePath);
        console.log(`Generated ${type} design image URL:`, imageUrl);
        
        if (imageUrl) {
          onViewImage(imageUrl);
        } else {
          console.error(`Failed to get URL for ${type} design image: ${imagePath}`);
          toast.error(`Không thể tải hình ảnh thiết kế mặt ${type === 'front' ? 'trước' : 'sau'}`);
          onViewImage(getFallbackImageUrl('design'));
        }
      } catch (error) {
        console.error(`Error processing ${type} design image:`, error);
        toast.error(`Có lỗi xử lý hình ảnh thiết kế`);
        onViewImage(getFallbackImageUrl('design'));
      }
    }
  };

  const isImageAvailable = (type: 'front' | 'back') => {
    if (isCheckingImages) return null; // Still checking
    if (!imageAvailability) return false; // No data
    return type === 'front' ? imageAvailability.front : imageAvailability.back;
  };

  const frontAvailable = isImageAvailable('front');
  const backAvailable = isImageAvailable('back');

  return (
    <div className="flex flex-col gap-2">
      {isCheckingImages && (
        <div className="flex items-center text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" /> 
          Đang kiểm tra...
        </div>
      )}
      
      {hasFrontDesignImage && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleViewImage(frontDesignImage, 'front')}
          className={`flex items-center gap-1 w-full ${!frontAvailable && !isCheckingImages ? 'text-muted-foreground border-dashed' : ''}`}
        >
          <ImageIcon className="h-4 w-4" /> Xem mặt trước
        </Button>
      )}
      
      {hasBackDesignImage && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleViewImage(backDesignImage, 'back')}
          className={`flex items-center gap-1 w-full ${!backAvailable && !isCheckingImages ? 'text-muted-foreground border-dashed' : ''}`}
        >
          <ImageIcon className="h-4 w-4" /> Xem mặt sau
        </Button>
      )}
      
      {!isCheckingImages && (imageAvailability && 
        ((hasFrontDesignImage && !imageAvailability.front) || 
         (hasBackDesignImage && !imageAvailability.back) ||
         hasFrontDesignImageError || 
         hasBackDesignImageError)) && (
        <div className="flex items-center mt-1 text-red-500 text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" /> 
          Có vấn đề với hình ảnh thiết kế
        </div>
      )}
    </div>
  );
};
