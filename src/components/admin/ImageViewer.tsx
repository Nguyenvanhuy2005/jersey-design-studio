
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  if (!imageUrl) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Xem thiết kế</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center p-4">
          <img 
            src={imageUrl} 
            alt="Jersey Design" 
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
