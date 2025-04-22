
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, Download } from "lucide-react";
import { AssetViewer } from "@/components/customer/AssetViewer";
import { Logo, LogoPosition } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// All possible logo positions (for reference)
const ALL_POSITIONS: LogoPosition[] = [
  'chest_left',
  'chest_right',
  'chest_center',
  'sleeve_left',
  'sleeve_right',
  'pants'
];

const LOGO_POSITION_LABEL_VI: Record<LogoPosition, string> = {
  chest_left: "Ngực trái",
  chest_right: "Ngực phải",
  chest_center: "Ngực giữa",
  sleeve_left: "Tay trái",
  sleeve_right: "Tay phải",
  pants: "Quần"
};

interface ReferenceImagesProps {
  referenceImages?: string[];
  logos?: Logo[];
}

export const ReferenceImages = ({ referenceImages, logos = [] }: ReferenceImagesProps) => {
  // Reference assets
  const referenceAssets = referenceImages?.map((url, index) => ({
    url,
    name: `Mẫu ${index + 1}`,
    type: 'image' as const
  })) || [];

  // Only show logos that actually have a working url/previewUrl (never fill to 6)
  const displayLogos = (logos || []).filter(logo => !!(logo.previewUrl || logo.url));

  // Helper tải logo về, có thông báo nếu không có ảnh
  const handleLogoDownload = (src?: string, name?: string) => {
    if (!src) {
      toast.warning("Không tìm thấy file logo để tải về.");
      return;
    }
    const link = document.createElement("a");
    link.href = src;
    link.download = `${name || 'logo'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Đã bắt đầu tải logo${name ? ` (${name})` : ""}!`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Logo đã tải lên
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayLogos.length === 0 ? (
            <div className="text-muted-foreground text-center">Chưa có logo nào được tải lên.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {displayLogos.map((logo, index) => {
                const src = logo.previewUrl || logo.url;
                let positionLabel = "";
                if (logo.position && ALL_POSITIONS.includes(logo.position as LogoPosition)) {
                  positionLabel = LOGO_POSITION_LABEL_VI[logo.position as LogoPosition];
                }
                // If no position (legacy), show generic name
                const showName = positionLabel || `Logo ${index + 1}`;
                return (
                  <div
                    key={logo.id || logo.url || index}
                    className="flex flex-col items-center bg-muted rounded-md p-4 border shadow-sm gap-2"
                  >
                    <div className="w-20 h-20 flex items-center justify-center bg-white rounded border overflow-hidden mb-2">
                      {src ? (
                        <img
                          src={src}
                          alt={showName}
                          className="max-h-16 max-w-16 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "/lovable-uploads/447a2264-3805-4538-84ac-a4d65e10802c.png";
                          }}
                        />
                      ) : (
                        <div className="text-muted-foreground text-xs text-center p-1 leading-4">
                          Không có logo
                        </div>
                      )}
                    </div>
                    <div className="w-full text-center">
                      <div className="font-medium text-sm">{showName}</div>
                      {!!logo.position && (
                        <div className="text-xs text-muted-foreground mb-2">
                          <span>({logo.position})</span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLogoDownload(src, showName)}
                      disabled={!src}
                      title={`Tải xuống ${showName}`}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Tải xuống
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
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
};
