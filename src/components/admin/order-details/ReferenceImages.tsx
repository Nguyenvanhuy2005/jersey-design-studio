
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
        <AssetViewer assets={assets} />
      </CardContent>
    </Card>
  );
};
