
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { toast } from "sonner";

interface ReferenceImagesProps {
  referenceImages: File[];
  referenceImagesPreview: string[];
  onReferenceImagesChange: (images: File[]) => void;
  onReferenceImagesPreviewChange: (previews: string[]) => void;
}

export function ReferenceImages({
  referenceImages,
  referenceImagesPreview,
  onReferenceImagesChange,
  onReferenceImagesPreviewChange
}: ReferenceImagesProps) {
  
  const handleReferenceImagesUpload = (fileList: FileList | null) => {
    if (!fileList) return;
    
    const newFiles = Array.from(fileList);
    const updatedFiles = [...referenceImages];
    const updatedPreviews = [...referenceImagesPreview];
    
    const filesToAdd = newFiles.slice(0, 5 - referenceImages.length);
    
    filesToAdd.forEach(file => {
      updatedFiles.push(file);
      updatedPreviews.push(URL.createObjectURL(file));
    });
    
    onReferenceImagesChange(updatedFiles);
    onReferenceImagesPreviewChange(updatedPreviews);
    
    if (filesToAdd.length < newFiles.length) {
      toast.warning("Chỉ có thể tải lên tối đa 5 hình ảnh tham khảo.");
    }
  };
  
  const removeReferenceImage = (index: number) => {
    const updatedFiles = [...referenceImages];
    const updatedPreviews = [...referenceImagesPreview];
    
    URL.revokeObjectURL(updatedPreviews[index]);
    
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    
    onReferenceImagesChange(updatedFiles);
    onReferenceImagesPreviewChange(updatedPreviews);
  };

  return (
    <div className="space-y-2">
      <Label>Hình ảnh tham khảo (tối đa 5 hình)</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-2">
        {referenceImagesPreview.map((preview, index) => (
          <div key={index} className="relative border rounded overflow-hidden h-40">
            <img 
              src={preview} 
              alt={`Tham khảo ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black/80"
              onClick={() => removeReferenceImage(index)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        {referenceImagesPreview.length < 5 && (
          <label className="border border-dashed rounded flex flex-col items-center justify-center h-40 cursor-pointer hover:bg-muted/30">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              multiple
              onChange={(e) => handleReferenceImagesUpload(e.target.files)}
            />
            <div className="text-center p-4">
              <p className="text-sm text-muted-foreground">Thêm ảnh</p>
            </div>
          </label>
        )}
      </div>
    </div>
  );
}
