
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, Download } from "lucide-react";
import { AssetViewer } from "@/components/customer/AssetViewer";
import { Logo, LogoPosition, LogoPositionLabel } from "@/types";
import { Button } from "@/components/ui/button";

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
  // Lấy logo có vị trí hợp lệ trong 6 vị trí chính
  const filteredLogos = logos.filter(
    (logo) => logo.position && ALL_POSITIONS.includes(logo.position)
  );

  // Tạo bản đồ [vị trí] -> logo (nếu nhiều, chỉ lấy 1 logo cho mỗi vị trí)
  const logoByPosition: Partial<Record<LogoPosition, Logo>> = {};
  filteredLogos.forEach((logo) => {
    if (logo.position && !logoByPosition[logo.position]) {
      logoByPosition[logo.position] = logo;
    }
  });

  const referenceAssets = referenceImages?.map((url, index) => ({
    url,
    name: `Mẫu ${index + 1}`,
    type: 'image' as const
  })) || [];

  // Helper cho phép tải hình về
  const handleLogoDownload = (url?: string, positionLabel?: string, idx?: number) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = `${positionLabel || "logo"}${idx !== undefined ? `_${idx+1}` : ""}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div className="flex flex-col gap-3">
            {ALL_POSITIONS.map((position, posIdx) => {
              const logo = logoByPosition[position];
              const label = LOGO_POSITION_LABEL_VI[position];
              const src = logo?.previewUrl || logo?.url; // Ưu tiên previewUrl (local), fallback url (đã upload)
              return (
                <div key={position} className="flex items-center gap-4 border rounded p-3 bg-muted">
                  <div className="w-24 h-24 flex items-center justify-center rounded bg-white border shadow overflow-hidden">
                    {src ? (
                      <img
                        src={src}
                        alt={label}
                        className="max-h-20 max-w-20 object-contain"
                        onError={e => { (e.target as HTMLImageElement).src = "/logo-placeholder.png" }}
                      />
                    ) : (
                      <span className="text-muted-foreground text-xs">Không có logo</span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="font-semibold">{label}</div>
                    <span className="text-xs text-muted-foreground truncate">Vị trí in: {position}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLogoDownload(src, label)}
                    title={`Tải xuống logo vị trí ${label}`}
                    disabled={!src}
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

