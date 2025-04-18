
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";

interface ReferenceImagesProps {
  referenceImages?: string[];
  logo_url?: string;
}

export const ReferenceImages = ({ referenceImages, logo_url }: ReferenceImagesProps) => {
  if ((!referenceImages || referenceImages.length === 0) && !logo_url) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Tài nguyên hình ảnh
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {logo_url && (
          <div>
            <h3 className="text-sm font-medium mb-2">Logo đội</h3>
            <div className="border rounded overflow-hidden w-32 h-32">
              <img
                src={logo_url}
                alt="Logo đội"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
        
        {referenceImages && referenceImages.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">
              Hình ảnh tham khảo ({referenceImages.length})
            </h3>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};
