
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Upload, Image } from "lucide-react";
import { toast } from "sonner";

interface ReferenceImageUploadProps {
  referenceImages: File[];
  referenceImagesPreview: string[];
  onReferenceImagesUpload: (fileList: FileList | null) => void;
  onRemoveReferenceImage: (index: number) => void;
}

export function ReferenceImageUpload({
  referenceImages,
  referenceImagesPreview,
  onReferenceImagesUpload,
  onRemoveReferenceImage
}: ReferenceImageUploadProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (referenceImages.length + files.length > 5) {
        toast.warning("Chỉ có thể tải lên tối đa 5 hình ảnh tham khảo.");
        return;
      }
      onReferenceImagesUpload(files);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Hình ảnh tham khảo
        </CardTitle>
        <CardDescription>
          Tải lên tối đa 5 hình ảnh tham khảo để minh họa thiết kế mong muốn
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="reference-images">Chọn hình ảnh</Label>
          <Input
            id="reference-images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Hỗ trợ: JPG, PNG, GIF, WebP (tối đa 10MB mỗi file)
          </p>
        </div>

        {referenceImagesPreview.length > 0 && (
          <div>
            <Label>Hình ảnh đã tải lên ({referenceImagesPreview.length}/5)</Label>
            <ScrollArea className="h-[300px] mt-2">
              <div className="grid grid-cols-2 gap-3">
                {referenceImagesPreview.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg border overflow-hidden bg-gray-50">
                      <img 
                        src={preview} 
                        alt={`Tham khảo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onRemoveReferenceImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <p className="text-xs text-center mt-1 truncate">
                      {referenceImages[index]?.name || `Hình ${index + 1}`}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {referenceImagesPreview.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500 mb-2">
              Chưa có hình ảnh tham khảo nào
            </p>
            <p className="text-xs text-gray-400">
              Tải lên hình ảnh để giúp chúng tôi hiểu rõ hơn về thiết kế bạn mong muốn
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
