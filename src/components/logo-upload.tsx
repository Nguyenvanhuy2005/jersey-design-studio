
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { LogoPosition, Logo } from "@/types";
import { toast } from "sonner";

interface LogoUploadProps {
  logos: Logo[];
  onLogosChange: (logos: Logo[]) => void;
}

export function LogoUpload({ logos, onLogosChange }: LogoUploadProps) {
  const [selectedPosition, setSelectedPosition] = useState<LogoPosition>("chest_left");
  
  const positionLabels: Record<LogoPosition, string> = {
    'chest_left': 'Logo ngực trái',
    'chest_right': 'Logo ngực phải',
    'chest_center': 'Logo giữa bụng',
    'sleeve_left': 'Logo tay trái',
    'sleeve_right': 'Logo tay phải',
    'pants': 'Logo quần'
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if logo position is already used
    const positionExists = logos.some(logo => logo.position === selectedPosition);
    if (positionExists) {
      toast.error(`Vị trí ${positionLabels[selectedPosition]} đã được sử dụng. Vui lòng chọn vị trí khác.`);
      return;
    }

    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = () => {
      if (reader.readyState === 2) {
        const newLogo: Logo = {
          id: `logo-${Date.now()}`,
          file,
          position: selectedPosition,
          previewUrl: reader.result as string
        };
        
        onLogosChange([...logos, newLogo]);
        
        // Reset file input
        e.target.value = "";
        
        toast.success(`Đã tải lên logo vị trí ${positionLabels[selectedPosition]}`);
      }
    };
    
    reader.readAsDataURL(file);
  };
  
  const removeLogo = (id: string) => {
    const updatedLogos = logos.filter(logo => logo.id !== id);
    onLogosChange(updatedLogos);
  };
  
  const availablePositions = Object.keys(positionLabels).filter(
    position => !logos.some(logo => logo.position === position)
  ) as LogoPosition[];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Logo & Hình ảnh</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="logoPosition">Vị trí logo</Label>
          <Select
            value={selectedPosition}
            onValueChange={(value) => setSelectedPosition(value as LogoPosition)}
          >
            <SelectTrigger id="logoPosition">
              <SelectValue placeholder="Chọn vị trí" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(positionLabels).map(([key, label]) => {
                const isDisabled = logos.some(logo => logo.position === key);
                return (
                  <SelectItem 
                    key={key} 
                    value={key} 
                    disabled={isDisabled}
                  >
                    {label} {isDisabled && '(đã dùng)'}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          <div className="mt-2">
            <Label htmlFor="logoFile">Tải lên logo (PNG, SVG)</Label>
            <Input
              id="logoFile"
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={handleLogoUpload}
              disabled={availablePositions.length === 0}
            />
            {availablePositions.length === 0 && (
              <p className="text-xs text-yellow-600 mt-1">
                Đã sử dụng hết vị trí logo. Xóa logo hiện có để thêm mới.
              </p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Logo đã tải lên</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {logos.length > 0 ? (
              logos.map(logo => (
                <div key={logo.id} className="relative group border rounded-md p-2">
                  <div className="h-20 flex items-center justify-center">
                    <img
                      src={logo.previewUrl}
                      alt={`Logo ${positionLabels[logo.position]}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-center mt-1 text-muted-foreground">
                    {positionLabels[logo.position]}
                  </p>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeLogo(logo.id!)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground col-span-3">
                Chưa có logo nào được tải lên
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
