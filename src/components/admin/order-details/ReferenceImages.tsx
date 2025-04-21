import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import { AssetViewer } from "@/components/customer/AssetViewer";
import { Logo, LogoPosition, LogoPositionLabel } from "@/types";

// Helper to group logos by position
function groupLogosByPosition(logos: Logo[]): Partial<Record<LogoPosition, Logo[]>> {
  const grouped: Partial<Record<LogoPosition, Logo[]>> = {};
  for (const logo of logos) {
    if (!grouped[logo.position]) grouped[logo.position] = [];
    grouped[logo.position]!.push(logo);
  }
  return grouped;
}

interface ReferenceImagesProps {
  referenceImages?: string[];
  logos?: Logo[];
}

export const ReferenceImages = ({ referenceImages, logos = [] }: ReferenceImagesProps) => {
  // Do not check logo_url, only use logos array
  const hasLogoImages = logos && logos.length > 0;

  // Group all logos by position
  const logosByPosition = groupLogosByPosition(logos || []);
  const hasLogoPosition = Object.keys(logosByPosition).length > 0;

  const referenceAssets = referenceImages?.map((url, index) => ({
    url,
    name: `Mẫu ${index + 1}`,
    type: 'image' as const
  })) || [];

  return (
    <div className="space-y-4">
      {/* Logo section - group by position */}
      {hasLogoImages && hasLogoPosition && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Logo các vị trí
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {Object.entries(LogoPositionLabel).map(([position, label]) => {
                const logosForThisPos = logosByPosition[position as LogoPosition];
                if (!logosForThisPos || logosForThisPos.length === 0) return null;
                return (
                  <div key={position} className="mb-4">
                    <div className="font-semibold mb-1">{label}</div>
                    <AssetViewer
                      assets={logosForThisPos.map((logo, idx) => ({
                        url: logo.previewUrl || logo.url || "",
                        name: `Logo ${label}${logosForThisPos.length > 1 ? ` #${idx + 1}` : ""}`,
                        type: "image"
                      }))}
                      gridCols={Math.max(logosForThisPos.length, 1)}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reference Images */}
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
