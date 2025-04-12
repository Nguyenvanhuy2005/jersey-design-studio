
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

export const ImageViewer = ({
  isOpen,
  onClose,
  imageUrl
}: ImageViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  if (!imageUrl) return null;
  
  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };
  
  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    console.error("Failed to load image:", imageUrl);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Xem hình ảnh</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          {isLoading && (
            <div className="w-full h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          
          {hasError && (
            <div className="text-center text-red-500">
              <p>Không thể tải hình ảnh.</p>
              <p className="text-sm text-muted-foreground">Có thể URL hình ảnh không hợp lệ hoặc hình ảnh đã bị xóa.</p>
            </div>
          )}
          
          <img 
            src={imageUrl} 
            alt="Hình ảnh xem trước" 
            className={`max-w-full max-h-[70vh] object-contain ${isLoading ? 'hidden' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
