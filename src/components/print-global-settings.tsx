
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Globe, Lock, Upload } from "lucide-react";
import { useFonts } from "@/hooks/useFonts";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface FontWithMetadata {
  name: string;
  isPublic: boolean;
  isOwner: boolean;
}

interface PrintGlobalSettingsProps {
  fontTextOptions: string[];
  fontText: string;
  onFontTextChange: (value: string) => void;
  fontNumberOptions: string[];
  fontNumber: string;
  onFontNumberChange: (value: string) => void;
}

export function PrintGlobalSettings({
  fontTextOptions,
  fontText,
  onFontTextChange,
  fontNumberOptions,
  fontNumber,
  onFontNumberChange,
}: PrintGlobalSettingsProps) {
  const { 
    customFonts, 
    fontsWithMetadata,
    uploadFont, 
    isUploading, 
    toggleFontPublic 
  } = useFonts();
  
  const [uploadType, setUploadType] = useState<'text' | 'number'>('text');
  const { user } = useAuth();
  
  const allTextFonts = [...new Set([...fontTextOptions, ...customFonts])];
  const allNumberFonts = [...new Set([...fontNumberOptions, ...customFonts])];

  const handleToggleFontVisibility = async (fontName: string) => {
    // Find font in metadata
    const fontData = fontsWithMetadata.find(f => f.name === fontName);
    if (!fontData || !fontData.user_id || fontData.user_id !== user?.id) return;
    
    const newIsPublic = !(fontData.is_public ?? false);
    await toggleFontPublic(fontName, newIsPublic);
  };

  // Fix: Use a direct approach for file upload rather than relying on the label+input combo
  const handleUploadFont = (type: 'text' | 'number') => {
    setUploadType(type);
    
    // Create a temporary file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.ttf,.otf,.woff,.woff2';
    
    // Add change handler
    fileInput.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) return;
      
      try {
        toast.info(`Đang tải lên font "${file.name}"`);
        const { success, fontName } = await uploadFont(file);
        
        if (success) {
          // Update the selected font based on type
          if (type === 'text') {
            onFontTextChange(fontName);
          } else {
            onFontNumberChange(fontName);
          }
          toast.success(`Đã tải lên thành công font "${fontName}"`);
        } else {
          toast.error("Không thể tải lên font chữ");
        }
      } catch (error) {
        console.error("Lỗi khi tải font:", error);
        toast.error("Có lỗi xảy ra khi tải font chữ");
      }
    });
    
    // Trigger the file dialog
    fileInput.click();
  };

  // Function to render font item with visibility toggle if user is owner
  const renderFontItem = (font: string) => {
    const fontData = fontsWithMetadata.find(f => f.name === font);
    const isCustomFont = fontData !== undefined;
    const isOwner = fontData?.user_id === user?.id;
    const isPublic = fontData?.is_public ?? true;
    
    return (
      <SelectItem key={font} value={font} className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: font }}>{font}</span>
          {isCustomFont && (
            <span className="ml-2">
              {isPublic 
                ? <Globe className="h-3 w-3 text-blue-500" /> 
                : <Lock className="h-3 w-3 text-gray-500" />}
            </span>
          )}
        </div>
        {isOwner && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-2 h-6 px-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleToggleFontVisibility(font);
            }}
          >
            {isPublic ? "Đặt riêng tư" : "Đặt công khai"}
          </Button>
        )}
      </SelectItem>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cấu hình in ấn chung</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label htmlFor="fontText">Font chữ</Label>
            <Select value={fontText} onValueChange={onFontTextChange}>
              <SelectTrigger id="fontText">
                <SelectValue placeholder="Chọn font chữ" />
              </SelectTrigger>
              <SelectContent>
                {allTextFonts.map(font => renderFontItem(font))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isUploading}
              onClick={() => handleUploadFont('text')}
            >
              <Upload className="w-4 h-4 mr-2" />
              Tải lên font chữ mới
            </Button>
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="fontNumber">Font số</Label>
            <Select value={fontNumber} onValueChange={onFontNumberChange}>
              <SelectTrigger id="fontNumber">
                <SelectValue placeholder="Chọn font số" />
              </SelectTrigger>
              <SelectContent>
                {allNumberFonts.map(font => renderFontItem(font))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isUploading}
              onClick={() => handleUploadFont('number')}
            >
              <Upload className="w-4 h-4 mr-2" />
              Tải lên font số mới
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
