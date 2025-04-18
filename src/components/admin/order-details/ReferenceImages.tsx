
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import { AssetViewer } from "@/components/customer/AssetViewer";

interface ReferenceImagesProps {
  referenceImages?: string[];
  logo_url?: string;
}

export const ReferenceImages = ({ referenceImages, logo_url }: ReferenceImagesProps) => {
  if ((!referenceImages || referenceImages.length === 0) && !logo_url) {
    return null;
  }

  const assets = [
    ...(logo_url ? [{ url: logo_url, name: 'Logo đội', type: 'image' as const }] : []),
    ...(referenceImages?.map((url, index) => ({
      url,
      name: `Mẫu ${index + 1}`,
      type: 'image' as const
    })) || [])
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Tài nguyên hình ảnh
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logo_url && (
            <div>
              <h4 className="font-medium mb-2">Logo đội</h4>
              <AssetViewer 
                title="Logo đội"
                assets={[{ url: logo_url, name: 'Logo đội', type: 'image' as const }]} 
                gridCols={2}
              />
            </div>
          )}
          
          {referenceImages && referenceImages.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Mẫu cần in</h4>
              <AssetViewer 
                title="Mẫu cần in"
                assets={referenceImages.map((url, index) => ({
                  url,
                  name: `Mẫu ${index + 1}`,
                  type: 'image' as const
                }))}
                gridCols={2}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
