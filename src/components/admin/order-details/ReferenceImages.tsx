
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, Download } from "lucide-react";
import { AssetViewer } from "@/components/customer/AssetViewer";
import { Logo, LogoPosition, LogoPositionLabel } from "@/types";
import { Button } from "@/components/ui/button";

interface ReferenceImagesProps {
  referenceImages?: string[];
  logos?: Logo[];
}

// Only use the logo positions relevant for the user: 'Ngực trái' (chest_left) and 'Ngực phải' (chest_right)
const SELECTED_POSITIONS: LogoPosition[] = [
  'chest_left',    // Logo 1
  'chest_right'    // Logo 2
];

export const ReferenceImages = ({ referenceImages, logos = [] }: ReferenceImagesProps) => {
  // Only display logos with selected positions
  const filteredLogos = logos.filter(
    (logo) => logo.position && SELECTED_POSITIONS.includes(logo.position)
  );

  const referenceAssets = referenceImages?.map((url, index) => ({
    url,
    name: `Mẫu ${index + 1}`,
    type: 'image' as const
  })) || [];

  // Helper for browser downloading
  const handleLogoDownload = (url?: string, positionLabel?: string, idx?: number) => {
    if (!url) return;
    // In case url is relative, get its absolute version
    const link = document.createElement("a");
    link.href = url;
    link.download = `${positionLabel || "logo"}${idx !== undefined ? `_${idx+1}` : ""}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Only show Logo 1 and Logo 2 by their specific print positions */}
      {filteredLogos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Logo cần in (theo vị trí)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-5">
              {SELECTED_POSITIONS.map((position) => {
                // For each selected position, find the logo (should be at most one for each)
                const logoForThisPosition = filteredLogos.find(l => l.position === position);
                if (!logoForThisPosition) return null;
                const label = LogoPositionLabel[position];
                return (
                  <div key={position} className="flex items-center gap-4 border rounded p-3 bg-muted">
                    <div className="w-24 h-24 flex items-center justify-center rounded bg-white border shadow overflow-hidden">
                      {logoForThisPosition.previewUrl || logoForThisPosition.url ? (
                        <img
                          src={logoForThisPosition.previewUrl || logoForThisPosition.url}
                          alt={label}
                          className="max-h-20 max-w-20 object-contain"
                        />
                      ) : (
                        <span className="text-muted-foreground text-xs">Không có logo</span>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="font-semibold">{label}</div>
                      <span className="text-xs text-muted-foreground truncate">Vị trí in: {label}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLogoDownload(logoForThisPosition.previewUrl || logoForThisPosition.url, label)}
                      title="Tải xuống logo"
                      disabled={!(logoForThisPosition.previewUrl || logoForThisPosition.url)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Tải xuống logo
                    </Button>
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
