
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Logo, LogoPosition } from "@/types";
import { X, UploadCloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface LogoUploadProps {
  logos: Logo[];
  onLogosChange: (logos: Logo[]) => void;
}

export function LogoUpload({ logos, onLogosChange }: LogoUploadProps) {
  const [position, setPosition] = useState<LogoPosition>('chest_left');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setIsUploading(true);
    
    try {
      // Check if a logo already exists in this position
      if (logos.some(logo => logo.position === position)) {
        toast.error(`Đã có logo ở vị trí ${getPositionLabel(position)}. Vui lòng xóa logo cũ trước khi tải lên logo mới.`);
        setIsUploading(false);
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF, WEBP)");
        setIsUploading(false);
        return;
      }
      
      // Check file size
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSizeInBytes) {
        toast.error("Kích thước file không được vượt quá 5MB");
        setIsUploading(false);
        return;
      }
      
      console.log(`Processing logo upload for position ${position}: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // Add new logo
      const newLogo: Logo = {
        id: `logo-${Date.now()}-${position}`,
        file,
        position,
        previewUrl
      };
      
      onLogosChange([...logos, newLogo]);
      
      // Reset file input
      e.target.value = "";
      
      // Show success message
      toast.success(`Đã tải lên logo cho vị trí ${getPositionLabel(position)}`);
      
      console.log(`Successfully added logo for position ${position} with preview URL: ${previewUrl}`);
    } catch (err) {
      console.error(`Error uploading logo for position ${position}:`, err);
      toast.error(`Có lỗi khi tải lên logo: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const removeLogo = (id: string | undefined) => {
    if (!id) return;
    
    try {
      // Find the logo to remove
      const logoToRemove = logos.find(logo => logo.id === id);
      if (logoToRemove && logoToRemove.previewUrl && logoToRemove.previewUrl.startsWith('blob:')) {
        // Revoke the object URL to free memory
        URL.revokeObjectURL(logoToRemove.previewUrl);
        console.log(`Revoked object URL for logo: ${logoToRemove.position}`);
      }
      
      // Remove the logo
      const updatedLogos = logos.filter(logo => logo.id !== id);
      onLogosChange(updatedLogos);
      
      // Show success message
      toast.success("Đã xóa logo");
      
      console.log(`Successfully removed logo with ID: ${id}`);
    } catch (err) {
      console.error(`Error removing logo with ID ${id}:`, err);
      toast.error("Có lỗi khi xóa logo");
    }
  };
  
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      logos.forEach(logo => {
        if (logo.previewUrl && logo.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(logo.previewUrl);
          console.log(`Cleanup: Revoked object URL for logo: ${logo.position}`);
        }
      });
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo đội bóng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="logoPosition">Vị trí</Label>
            <Select 
              value={position} 
              onValueChange={(value: LogoPosition) => setPosition(value)}
              disabled={isUploading}
            >
              <SelectTrigger id="logoPosition">
                <SelectValue placeholder="Chọn vị trí logo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chest_left">Ngực trái</SelectItem>
                <SelectItem value="chest_right">Ngực phải</SelectItem>
                <SelectItem value="chest_center">Giữa ngực</SelectItem>
                <SelectItem value="sleeve_left">Tay trái</SelectItem>
                <SelectItem value="sleeve_right">Tay phải</SelectItem>
                <SelectItem value="pants">Quần</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Label htmlFor="logoFile">Tải lên logo</Label>
            <div className="flex gap-2">
              <Input 
                id="logoFile" 
                type="file" 
                accept="image/*" 
                onChange={handleLogoUpload}
                className="flex-1"
                disabled={isUploading}
              />
              <Button variant="outline" size="icon" asChild disabled={isUploading}>
                <label htmlFor="logoFile" className={`cursor-pointer ${isUploading ? 'opacity-50' : ''}`}>
                  {isUploading ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <UploadCloud className="h-4 w-4" />
                  )}
                </label>
              </Button>
            </div>
          </div>
        </div>
        
        {logos.length > 0 && (
          <div>
            <Label>Logo đã tải lên</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-2">
              {logos.map((logo, index) => (
                <div 
                  key={logo.id || index} 
                  className="relative group border rounded-md p-2"
                >
                  <div className="h-16 flex items-center justify-center">
                    {logo.previewUrl ? (
                      <img 
                        src={logo.previewUrl} 
                        alt={`Logo ${getPositionLabel(logo.position)}`}
                        className="max-h-full max-w-full object-contain"
                        onError={() => {
                          console.error(`Error loading logo preview: ${logo.position}`);
                          toast.error(`Không thể hiển thị logo ${getPositionLabel(logo.position)}`);
                        }}
                      />
                    ) : (
                      <div className="text-muted-foreground flex flex-col items-center justify-center">
                        <AlertCircle className="h-6 w-6 mb-1" />
                        <span className="text-xs">Lỗi hiển thị</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-center mt-2 truncate">
                    {getPositionLabel(logo.position)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeLogo(logo.id)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove logo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground">
          Tải lên logo ở các vị trí khác nhau để in lên áo. Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF, WEBP) và kích thước không quá 5MB.
        </p>
      </CardContent>
    </Card>
  );
}

function getPositionLabel(position: LogoPosition): string {
  switch (position) {
    case 'chest_left': return 'Ngực trái';
    case 'chest_right': return 'Ngực phải';
    case 'chest_center': return 'Giữa ngực';
    case 'sleeve_left': return 'Tay trái';
    case 'sleeve_right': return 'Tay phải';
    case 'pants': return 'Quần';
    default: return position;
  }
}
