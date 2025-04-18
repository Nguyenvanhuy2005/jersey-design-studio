
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";

interface ReferenceImagesProps {
  referenceImages?: string[];
}

export const ReferenceImages = ({ referenceImages }: ReferenceImagesProps) => {
  if (!referenceImages || referenceImages.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Hình ảnh tham khảo ({referenceImages.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {referenceImages.map((image, index) => (
            <a 
              key={index}
              href={image} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block border rounded overflow-hidden"
            >
              <img
                src={image}
                alt={`Tham khảo ${index + 1}`}
                className="w-full h-40 object-cover"
              />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
