
// The updated component requires adding an onImageError prop for handling image load failures
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageViewer } from "@/components/admin/ImageViewer";
import { AlertCircle } from "lucide-react";

interface Asset {
  url: string;
  name: string;
  type: 'image' | 'pdf' | 'other';
}

interface AssetViewerProps {
  title?: string; // Added title prop as optional
  assets: Asset[];
  gridCols?: number;
  onImageError?: (url: string) => void;
}

export const AssetViewer: React.FC<AssetViewerProps> = ({ 
  title,
  assets,
  gridCols = 3,
  onImageError
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [errorImages, setErrorImages] = useState<Record<string, boolean>>({});

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
  };
  
  const handleImageError = (url: string) => {
    setErrorImages(prev => ({ ...prev, [url]: true }));
    if (onImageError) {
      onImageError(url);
    }
  };

  if (!assets || assets.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Không có tài liệu nào
      </div>
    );
  }

  return (
    <>
      {title && <h3 className="text-lg font-medium mb-3">{title}</h3>}
      <div className={`grid grid-cols-2 sm:grid-cols-${gridCols} gap-4`}>
        {assets.map((asset, index) => {
          const hasError = errorImages[asset.url];
          
          if (asset.type === 'image') {
            return (
              <div 
                key={index} 
                className="border rounded-md overflow-hidden aspect-square relative"
              >
                {!hasError ? (
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handleImageClick(asset.url)}
                    onError={() => handleImageError(asset.url)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-sm p-2">
                    <AlertCircle className="h-8 w-8 mb-2 text-muted-foreground" />
                    <span className="text-center text-muted-foreground">Không thể tải hình ảnh</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white py-1 px-2 text-xs">
                  {asset.name}
                </div>
              </div>
            );
          } else if (asset.type === 'pdf') {
            return (
              <div key={index} className="border rounded-md p-4 flex flex-col items-center justify-center">
                <div className="text-4xl mb-2">📄</div>
                <div className="text-sm mb-2 text-center">{asset.name}</div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => window.open(asset.url, '_blank')}
                >
                  Xem PDF
                </Button>
              </div>
            );
          } else {
            return (
              <div key={index} className="border rounded-md p-4 flex flex-col items-center justify-center">
                <div className="text-4xl mb-2">📎</div>
                <div className="text-sm mb-2 text-center">{asset.name}</div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => window.open(asset.url, '_blank')}
                >
                  Tải xuống
                </Button>
              </div>
            );
          }
        })}
      </div>

      {/* Image Viewer Dialog */}
      <ImageViewer 
        isOpen={!!selectedImage} 
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage}
      />
    </>
  );
};
