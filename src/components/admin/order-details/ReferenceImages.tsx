
import { useState, useEffect } from "react";
import { Order } from "@/types";
import { ImageIcon } from "lucide-react";
import { getReferenceImageUrls } from "@/utils/image-utils";

interface ReferenceImagesProps {
  referenceImages: Order['referenceImages'];
  onViewImage: (imageUrl: string) => void;
}

export const ReferenceImages = ({ referenceImages, onViewImage }: ReferenceImagesProps) => {
  const [referenceImageUrls, setReferenceImageUrls] = useState<string[]>([]);
  const [referenceImagesLoaded, setReferenceImagesLoaded] = useState<boolean[]>([]);
  
  useEffect(() => {
    if (Array.isArray(referenceImages) && referenceImages.length > 0) {
      const urls = getReferenceImageUrls(referenceImages);
      setReferenceImageUrls(urls);
      setReferenceImagesLoaded(Array(urls.length).fill(false));
      console.log(`Generated ${urls.length} reference image URLs`);
    }
  }, [referenceImages]);
  
  const handleImageLoad = (index: number) => {
    setReferenceImagesLoaded(prev => {
      const newLoaded = [...prev];
      newLoaded[index] = true;
      return newLoaded;
    });
  };
  
  const handleImageError = (referenceImage: string, index: number) => {
    console.error(`Failed to load reference image: ${referenceImage}`);
    setReferenceImagesLoaded(prev => {
      const newLoaded = [...prev];
      newLoaded[index] = false;
      return newLoaded;
    });
  };
  
  if (referenceImageUrls.length === 0) {
    return null;
  }
  
  return (
    <div>
      <h3 className="font-semibold mb-2">Hình ảnh tham khảo ({referenceImageUrls.length})</h3>
      <div className="flex flex-wrap gap-2">
        {referenceImageUrls.map((imageUrl, index) => (
          <div 
            key={index}
            className="group relative h-16 w-16 overflow-hidden rounded border border-muted"
          >
            <img
              src={imageUrl}
              alt={`Reference ${index + 1}`}
              className="h-full w-full object-cover cursor-pointer transition-transform group-hover:scale-110"
              onClick={() => onViewImage(imageUrl)}
              onLoad={() => handleImageLoad(index)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/150?text=Error';
                handleImageError(Array.isArray(referenceImages) ? referenceImages[index] : '', index);
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <ImageIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        ))}
      </div>
      {referenceImagesLoaded.some(loaded => !loaded) && (
        <p className="text-center text-sm text-red-500 mt-2">
          Một số hình ảnh không thể tải. Vui lòng kiểm tra quyền truy cập.
        </p>
      )}
    </div>
  );
};
