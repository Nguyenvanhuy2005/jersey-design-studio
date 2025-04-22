
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, Download } from "lucide-react";
import { AssetViewer } from "@/components/customer/AssetViewer";
import { Logo, LogoPosition } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Show all 6 positions: chest_left, chest_right, chest_center, sleeve_left, sleeve_right, pants
const ALL_POSITIONS: LogoPosition[] = [
  'chest_left',
  'chest_right',
  'chest_center',
  'sleeve_left',
  'sleeve_right',
  'pants'
];

// Map vị trí sang tiếng Việt rõ ràng
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
  // Tạo map để lấy đúng logo theo từng vị trí (chỉ lấy 1 logo/position)
  const logoByPosition: Partial<Record<LogoPosition, Logo>> = {};
  for (const pos of ALL_POSITIONS) {
    const logo = logos.find(l => l.position === pos && (l.previewUrl || l.url));
    if (logo) logoByPosition[pos] = logo;
  }

  const referenceAssets = referenceImages?.map((url, index) => ({
    url,
    name: `Mẫu ${index + 1}`,
    type: 'image' as const
  })) || [];

  // Helper tải logo về, có thông báo nếu không có ảnh
  const handleLogoDownload = (url?: string, positionLabel?: string) => {
    if (!url) {
      toast.warning("Không tìm thấy file logo để tải về.");
      return;
    }
    const link = document.createElement("a");
    link.href = url;
    link.download = `${positionLabel || "logo"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Đã bắt đầu tải logo vị trí ${positionLabel}!`);
  };

  return (
    <div className="space-y-4">
      {/* 6 vị trí logo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            6 vị trí logo cần in
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {ALL_POSITIONS.map((position) => {
              const logo = logoByPosition[position];
              const label = LOGO_POSITION_LABEL_VI[position];
              const src = logo?.previewUrl || logo?.url;

              return (
                <div
                  key={position}
                  className="flex flex-col items-center bg-muted rounded-md p-4 border shadow-sm gap-2"
                >
                  <div className="w-20 h-20 flex items-center justify-center bg-white rounded border overflow-hidden mb-2">
                    {src ? (
                      <img
                        src={src}
                        alt={label}
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
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      <span>({position})</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLogoDownload(src, label)}
                    disabled={!src}
                    title={`Tải xuống logo vị trí ${label}`}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Tải xuống
                  </Button>
                </div>
              );
            })}
          </div>
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
