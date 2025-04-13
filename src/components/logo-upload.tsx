
import React, { useState, useEffect } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Logo, LogoPosition } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface LogoUploadProps {
  logos: Logo[];
  onLogosChange: (logos: Logo[]) => void;
}

export function LogoUpload({ logos, onLogosChange }: LogoUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [position, setPosition] = useState<LogoPosition>('chest_left');
  
  useEffect(() => {
    // Clean up any object URLs to avoid memory leaks
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setUploadedFile(null);
      setPreviewUrl('');
      return;
    }
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng tải lên tệp hình ảnh.');
      return;
    }
    
    setUploadedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };
  
  const handlePositionChange = (value: string) => {
    setPosition(value as LogoPosition);
  };
  
  const handleAddLogo = () => {
    if (!uploadedFile) {
      alert('Vui lòng chọn tệp hình ảnh trước.');
      return;
    }
    
    // Check if a logo with the same position already exists
    const logoWithSamePosition = logos.find(logo => logo.position === position);
    if (logoWithSamePosition) {
      const confirmReplace = window.confirm(
        `Đã có logo tại vị trí ${getPositionLabel(position)}. Bạn có muốn thay thế không?`
      );
      
      if (!confirmReplace) {
        return;
      }
      
      // Remove the existing logo with the same position
      const updatedLogos = logos.filter(logo => logo.position !== position);
      
      // Add the new logo
      onLogosChange([
        ...updatedLogos,
        {
          id: uuidv4(), // Generate proper UUID for the logo
          file: uploadedFile,
          position,
          previewUrl
        }
      ]);
    } else {
      // Add the new logo
      onLogosChange([
        ...logos,
        {
          id: uuidv4(), // Generate proper UUID for the logo
          file: uploadedFile,
          position,
          previewUrl
        }
      ]);
    }
    
    // Reset the form
    setUploadedFile(null);
    setPreviewUrl('');
    setPosition('chest_left');
    
    // Reset the file input
    const fileInput = document.getElementById('logo-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  const handleDeleteLogo = (logoIndex: number) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa logo này không?');
    
    if (confirmDelete) {
      const updatedLogos = [...logos];
      
      // If the logo has a preview URL, revoke it
      if (updatedLogos[logoIndex].previewUrl && updatedLogos[logoIndex].previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(updatedLogos[logoIndex].previewUrl);
      }
      
      updatedLogos.splice(logoIndex, 1);
      onLogosChange(updatedLogos);
    }
  };
  
  const getPositionLabel = (pos: string): string => {
    switch (pos) {
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
      <div>
        <Label htmlFor="logo-file" className="block text-gray-700">Tải lên logo</Label>
        <div className="flex items-start space-x-4 mt-2">
          <div className="flex-grow space-y-4">
            <Input 
              id="logo-file" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
            />
            
            <Select value={position} onValueChange={handlePositionChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn vị trí in logo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chest_left">Ngực trái</SelectItem>
                <SelectItem value="chest_right">Ngực phải</SelectItem>
                <SelectItem value="chest_center">Giữa ngực</SelectItem>
                <SelectItem value="sleeve_left">Tay trái</SelectItem>
                <SelectItem value="sleeve_right">Tay phải</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleAddLogo}
              disabled={!uploadedFile}
              className="w-full"
            >
              Thêm logo
            </Button>
          </div>
          
          {previewUrl && (
            <div className="w-24 h-24 border rounded flex items-center justify-center bg-white p-2">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
        </div>
      </div>
      
      {logos.length > 0 && (
        <div>
          <Label className="block text-gray-700 mb-2">Logo đã tải lên</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {logos.map((logo, index) => (
              <div key={index} className="border rounded p-2 flex flex-col items-center">
                <div className="h-16 flex items-center justify-center mb-1">
                  <img 
                    src={logo.previewUrl} 
                    alt={`Logo ${index + 1}`} 
                    className="max-h-full object-contain"
                  />
                </div>
                <p className="text-sm text-center">{getPositionLabel(logo.position)}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-1 w-full"
                  onClick={() => handleDeleteLogo(index)}
                >
                  Xóa
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
