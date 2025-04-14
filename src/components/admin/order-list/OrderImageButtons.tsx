
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, AlertTriangle } from "lucide-react";
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
  onViewImage: (imageUrl: string | null) => void;
};

export const OrderImageButtons = ({
  orderId,
  frontDesignImage,
  backDesignImage,
  imageAvailability,
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
      const imageUrl = getDesignImageUrl(imagePath);
      console.log(`Generated ${type} design image URL:`, imageUrl);
      
      if (imageUrl) {
        onViewImage(imageUrl);
      } else {
        console.error(`Failed to get URL for ${type} design image: ${imagePath}`);
        toast.error(`Không thể tải hình ảnh thiết kế mặt ${type === 'front' ? 'trước' : 'sau'}`);
        onViewImage(getFallbackImageUrl('design'));
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {hasFrontDesignImage && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleViewImage(frontDesignImage, 'front')}
          className="flex items-center gap-1 w-full"
        >
          <ImageIcon className="h-4 w-4" /> Xem mặt trước
        </Button>
      )}
      
      {hasBackDesignImage && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleViewImage(backDesignImage, 'back')}
          className="flex items-center gap-1 w-full"
        >
          <ImageIcon className="h-4 w-4" /> Xem mặt sau
        </Button>
      )}
      
      {(imageAvailability && 
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
