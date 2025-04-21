
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import { AssetViewer } from "@/components/customer/AssetViewer";
import { Logo } from "@/types";

interface ReferenceImagesProps {
  referenceImages?: string[];
  logo_url?: string;
  logos?: Logo[]; // NEW
}

export const ReferenceImages = ({ referenceImages, logo_url, logos = [] }: ReferenceImagesProps) => {
  if ((!referenceImages || referenceImages.length === 0) && !logo_url && (!logos || logos.length === 0)) {
    return null;
  }

  // Logos from prop (NEW: support all logos)
  const logoAssets = (logos && logos.length > 0)
    ? logos.map((logo, idx) => ({
        url: logo.previewUrl || logo.url,
        name: `Logo ${idx + 1} (${logo.position})`,
        type: 'image' as const
      }))
    : logo_url
      ? [{ url: logo_url, name: 'Logo đội', type: 'image' as const }]
      : [];

  const referenceAssets = referenceImages?.map((url, index) => ({
    url,
    name: `Mẫu ${index + 1}`,
    type: 'image' as const
  })) || [];

  return (
    <div className="space-y-4">
      {/* Display Logo section if exists */}
      {logoAssets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              {logos && logos.length > 0 ? "Logo các vị trí" : "Logo đội"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AssetViewer assets={logoAssets} gridCols={Math.max(logoAssets.length, 1)} />
          </CardContent>
        </Card>
      )}

      {/* Display Reference Images section if exists */}
      {referenceAssets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Tài nguyên hình ảnh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AssetViewer assets={referenceAssets} gridCols={4} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
