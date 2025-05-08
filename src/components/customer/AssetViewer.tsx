
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Eye, ImageOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AssetViewerProps {
  title?: string;
  assets: {
    url: string;
    name?: string;
    type: 'image' | 'font';
    onError?: () => void;
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
  const [isDownloading, setIsDownloading] = useState<Record<number, boolean>>({});

  // Filter out invalid or empty URLs
  const validAssets = assets.filter(asset => asset.url && asset.url.trim() !== '');

  // Process image URLs to ensure they use Supabase storage URLs
  const processImageUrl = (url: string): string => {
    // If it's already a full URL, return it
    if (url.startsWith('http')) {
      console.log("Using existing URL:", url);
      return url;
    }
    
    try {
      // Extract the file extension to preserve it
      const extension = url.split('.').pop()?.toLowerCase() || '';
      console.log(`Processing image with extension: ${extension}, URL: ${url}`);
      
      // If it's a relative path in reference_images bucket
      if (!url.includes('/')) {
        const { data } = supabase.storage.from('reference_images').getPublicUrl(url);
        console.log("Generated URL for simple path:", data.publicUrl);
        return data.publicUrl;
      }
      
      // If it has path structure like orderId/filename
      const { data } = supabase.storage.from('reference_images').getPublicUrl(url);
      console.log("Generated URL for path with structure:", data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error("Error processing image URL:", url, error);
      return url; // Return original URL as fallback
    }
  };

  const getFileExtension = (url: string): string => {
    const parts = url.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
  };

  const getFileNameFromUrl = (url: string): string => {
    const parts = url.split('/');
    return parts[parts.length - 1] || 'file';
  };

  const handleDownload = async (url: string, filename: string, index: number) => {
    try {
      setIsDownloading(prev => ({ ...prev, [index]: true }));
      
      // Process the URL to ensure it's a full URL
      const processedUrl = url.startsWith('http') ? url : processImageUrl(url);
      const extension = getFileExtension(url) || 'png';
      
      console.log(`Attempting to download: ${processedUrl} with extension ${extension}`);
      
      const response = await fetch(processedUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      // Use the original extension if available
      link.download = `${filename || 'file'}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success(`Đã tải xuống ${filename ? ` (${filename})` : ""}!`);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error(`Không thể tải xuống: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setIsDownloading(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleImageError = (index: number) => {
    console.error(`Error loading image: ${assets[index].url}`);
    setImageErrors(prev => ({ ...prev, [index]: true }));
    
    // Call custom onError handler if provided
    if (assets[index].onError) {
      assets[index].onError();
    }
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
                      className="w-full h-full object-contain rounded-md"
                      onError={() => handleImageError(index)}
                      loading="lazy"
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
                      const processedUrl = asset.url.startsWith('http') 
                        ? asset.url 
                        : processImageUrl(asset.url);
                      
                      setSelectedAsset(processedUrl);
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
                  onClick={() => handleDownload(
                    asset.url, 
                    asset.name || `mau-${index + 1}`, 
                    index
                  )}
                  disabled={asset.type === 'image' && imageErrors[index] || isDownloading[index]}
                >
                  <Download className="h-4 w-4 mr-1" />
                  {isDownloading[index] ? "Đang tải..." : "Tải xuống"}
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
