
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo, LogoPosition } from "@/types";
import { Trash2 } from "lucide-react";

interface LogoUploadProps {
  logos: Logo[];
  onLogosChange: (logos: Logo[]) => void;
}

export function LogoUpload({ logos, onLogosChange }: LogoUploadProps) {
  const [currentPosition, setCurrentPosition] = useState<LogoPosition>('chest_center');
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if we've reached the maximum of 5 logos
    if (logos.length + files.length > 5) {
      alert("Bạn chỉ có thể tải tối đa 5 logo");
      return;
    }

    // Process each file
    Array.from(files).forEach(file => {
      const previewUrl = URL.createObjectURL(file);
      const newLogo: Logo = {
        id: `logo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        position: currentPosition,
        previewUrl
      };
      onLogosChange([...logos, newLogo]);
    });

    // Reset the input
    e.target.value = '';
  };

  const removeLogo = (logoId: string) => {
    const updatedLogos = logos.filter(logo => logo.id !== logoId);
    onLogosChange(updatedLogos);
  };

  const updateLogoPosition = (logoId: string, position: LogoPosition) => {
    const updatedLogos = logos.map(logo => 
      logo.id === logoId ? { ...logo, position } : logo
    );
    onLogosChange(updatedLogos);
  };

  const getPositionLabel = (position: LogoPosition): string => {
    switch (position) {
      case 'chest_left': return 'Ngực trái';
      case 'chest_right': return 'Ngực phải';
      case 'chest_center': return 'Giữa ngực';
      case 'sleeve_left': return 'Tay trái';
      case 'sleeve_right': return 'Tay phải';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-end sm:space-x-2 sm:space-y-0">
        <div className="flex-1">
          <Label htmlFor="logoPosition">Vị trí logo</Label>
          <Select 
            value={currentPosition} 
            onValueChange={(value) => setCurrentPosition(value as LogoPosition)}
          >
            <SelectTrigger id="logoPosition">
              <SelectValue placeholder="Chọn vị trí" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chest_left">Ngực trái</SelectItem>
              <SelectItem value="chest_right">Ngực phải</SelectItem>
              <SelectItem value="chest_center">Giữa ngực</SelectItem>
              <SelectItem value="sleeve_left">Tay trái</SelectItem>
              <SelectItem value="sleeve_right">Tay phải</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <Label htmlFor="logoUpload">Tải lên logo ({logos.length}/5)</Label>
          <Input 
            id="logoUpload"
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleLogoUpload}
            disabled={logos.length >= 5}
          />
        </div>
      </div>

      {logos.length > 0 && (
        <div className="border rounded-md p-4 space-y-3">
          <h4 className="text-sm font-medium mb-2">Danh sách logo đã tải lên</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {logos.map((logo) => (
              <div key={logo.id} className="flex items-center space-x-2 border rounded-md p-2">
                <img 
                  src={logo.previewUrl} 
                  alt="Logo preview" 
                  className="h-10 w-10 object-contain border rounded"
                />
                
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{logo.file.name}</p>
                  <Select 
                    value={logo.position} 
                    onValueChange={(value) => updateLogoPosition(logo.id!, value as LogoPosition)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={getPositionLabel(logo.position)} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chest_left">Ngực trái</SelectItem>
                      <SelectItem value="chest_right">Ngực phải</SelectItem>
                      <SelectItem value="chest_center">Giữa ngực</SelectItem>
                      <SelectItem value="sleeve_left">Tay trái</SelectItem>
                      <SelectItem value="sleeve_right">Tay phải</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeLogo(logo.id!)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
