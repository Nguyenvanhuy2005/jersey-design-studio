
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Eye, ImageOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface AssetViewerProps {
  title?: string;
  assets: {
    url: string;
    name?: string;
    type: 'image' | 'font';
  }[];
  gridCols?: number;
}

export const AssetViewer = ({ 
  title = 'Mẫu cần in', 
  assets, 
  gridCols = 4 
}: AssetViewerProps) => {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Filter out invalid or empty URLs
  const validAssets = assets.filter(asset => asset.url && asset.url.trim() !== '');

  // Process image URLs to ensure they use Supabase storage URLs
  const processImageUrl = (url: string): string => {
    // If it's already a full URL, return it
    if (url.startsWith('http')) {
      return url;
    }
    
    // If it's a relative path in reference_images bucket
    if (!url.includes('/')) {
      return supabase.storage.from('reference_images').getPublicUrl(url).data.publicUrl;
    }
    
    // If it has path structure like orderId/filename
    const { data } = supabase.storage.from('reference_images').getPublicUrl(url);
    return data.publicUrl;
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      // Process the URL to ensure it's a full URL
      const processedUrl = url.startsWith('http') ? url : processImageUrl(url);
      
      const response = await fetch(processedUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleImageError = (index: number) => {
    console.error(`Error loading image: ${assets[index].url}`);
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  if (validAssets.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${gridCols} gap-4`}>
          {validAssets.map((asset, index) => (
            <div key={index} className="relative border rounded-md p-2 space-y-2">
              {asset.type === 'image' ? (
                <div className="aspect-square relative">
                  {imageErrors[index] ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-muted rounded-md">
                      <ImageOff className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Không thể tải hình ảnh</p>
                    </div>
                  ) : (
                    <img
                      src={asset.url.startsWith('http') ? asset.url : processImageUrl(asset.url)}
                      alt={asset.name || `Mẫu ${index + 1}`}
                      className="w-full h-full object-cover rounded-md"
                      onError={() => handleImageError(index)}
                    />
                  )}
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center bg-muted rounded-md">
                  <span className="text-sm font-medium">{asset.name || 'Font file'}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                {asset.type === 'image' && !imageErrors[index] && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedAsset(asset.url.startsWith('http') ? asset.url : processImageUrl(asset.url));
                      setIsPreviewOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Xem
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDownload(asset.url, asset.name || `mau-${index + 1}`)}
                  disabled={asset.type === 'image' && imageErrors[index]}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Tải xuống
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Xem hình ảnh</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <img
              src={selectedAsset || ''}
              alt="Preview"
              className="w-full h-auto max-h-[70vh] object-contain"
              onError={(e) => {
                console.error(`Error loading preview image: ${selectedAsset}`);
                e.currentTarget.alt = 'Không thể tải hình ảnh';
                e.currentTarget.classList.add('opacity-50');
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
