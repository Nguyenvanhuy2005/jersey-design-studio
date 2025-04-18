
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Eye } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getReferenceImageUrls } from "@/utils/images/reference-image-utils";

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

  // Filter out invalid or empty URLs
  const validAssets = assets.filter(asset => asset.url && asset.url.trim() !== '');

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
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
                  <img
                    src={asset.url}
                    alt={asset.name || `Asset ${index + 1}`}
                    className="w-full h-full object-cover rounded-md"
                    onError={(e) => {
                      console.error(`Error loading image: ${asset.url}`);
                      e.currentTarget.alt = 'Không thể tải hình ảnh';
                      e.currentTarget.classList.add('opacity-50');
                    }}
                  />
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center bg-muted rounded-md">
                  <span className="text-sm font-medium">{asset.name || 'Font file'}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                {asset.type === 'image' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedAsset(asset.url);
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
                  onClick={() => handleDownload(asset.url, asset.name || `asset-${index + 1}`)}
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
