import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PrintConfig } from "@/types";
import { toast } from "sonner";
import { loadCustomFont } from "@/utils/font-utils";
import { supabase } from "@/integrations/supabase/client";

interface PrintConfigFormProps {
  printConfig: PrintConfig;
  onPrintConfigChange: (config: PrintConfig) => void;
}

export function PrintConfigForm({ printConfig, onPrintConfigChange }: PrintConfigFormProps) {
  const [tempConfig, setTempConfig] = useState<PrintConfig>(printConfig);
  const [open, setOpen] = useState(false);
  const [customFonts, setCustomFonts] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const loadSavedFonts = async () => {
      const { data: fonts, error } = await supabase
        .from('fonts')
        .select('name, file_path');

      if (error) {
        console.error('Error loading fonts:', error);
        toast.error('Không thể tải danh sách font chữ');
        return;
      }

      if (fonts) {
        setCustomFonts(fonts.map(font => font.name));
        
        fonts.forEach(async (font) => {
          const { data: fontUrl } = supabase.storage
            .from('fonts')
            .getPublicUrl(font.file_path);

          if (fontUrl) {
            await loadCustomFont(fontUrl.publicUrl, font.name);
          }
        });
      }
    };

    loadSavedFonts();
  }, []);

  const handleCustomFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['.ttf', '.otf'];
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!validTypes.includes(fileExtension)) {
      toast.error("Chỉ hỗ trợ định dạng phông chữ .ttf hoặc .otf");
      return;
    }

    setIsUploading(true);
    try {
      const fontName = file.name.split('.')[0];
      const filePath = `${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('fonts')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Error uploading font: ${uploadError.message}`);
      }

      const { data: fontUrl } = supabase.storage
        .from('fonts')
        .getPublicUrl(filePath);

      if (!fontUrl) {
        throw new Error('Could not get font URL');
      }

      const { error: dbError } = await supabase
        .from('fonts')
        .insert({
          name: fontName,
          file_path: filePath,
          file_type: fileExtension.replace('.', '')
        });

      if (dbError) {
        throw new Error(`Error saving font metadata: ${dbError.message}`);
      }

      await loadCustomFont(fontUrl.publicUrl, fontName);
      
      setTempConfig(prev => ({
        ...prev,
        customFontFile: file,
        customFontUrl: fontUrl.publicUrl,
        font: fontName
      }));
      
      if (!customFonts.includes(fontName)) {
        setCustomFonts(prev => [...prev, fontName]);
      }

      toast.success(`Đã tải lên phông chữ: ${fontName}`);
    } catch (error) {
      console.error('Error handling font upload:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể tải lên phông chữ');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    onPrintConfigChange(tempConfig);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempConfig(printConfig);
    setOpen(false);
  };

  const materialOptions = [
    { value: "In chuyển nhiệt", label: "In chuyển nhiệt" },
    { value: "In decal", label: "In decal" }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Cấu hình thông tin in tên số</Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Cấu hình thông tin in tên số</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="font">Font chữ/số mặc định</Label>
            <div className="flex flex-col md:flex-row md:items-end space-y-2 md:space-y-0 md:space-x-2">
              <div className="flex-1">
                <Select
                  value={tempConfig.font}
                  onValueChange={(value) => setTempConfig(prev => ({ ...prev, font: value }))}
                >
                  <SelectTrigger id="font">
                    <SelectValue placeholder="Chọn font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    
                    {customFonts.length > 0 && (
                      <>
                        <SelectItem disabled value="divider">
                          --- Font tùy chỉnh ---
                        </SelectItem>
                        {customFonts.map(fontName => (
                          <SelectItem key={fontName} value={fontName}>
                            {fontName}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Label htmlFor="customFont" className="mb-2 block">Tải lên font tùy chỉnh (.ttf/.otf)</Label>
                <Input 
                  id="customFont" 
                  type="file" 
                  accept=".ttf,.otf" 
                  onChange={handleCustomFontUpload}
                  disabled={isUploading}
                />
              </div>
            </div>
            
            {tempConfig.customFontUrl && (
              <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded text-sm">
                <p className="text-green-700">
                  Đã tải font tùy chỉnh: {tempConfig.customFontFile?.name}
                </p>
                <div className="mt-2">
                  <p className="font-medium mb-1">Xem trước:</p>
                  <p style={{fontFamily: tempConfig.customFontFile?.name.split('.')[0]}} className="text-xl">
                    AaBbCcDd 123456789
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="backMaterial">Chất liệu in lưng áo</Label>
            <Select
              value={tempConfig.backMaterial}
              onValueChange={(value) => setTempConfig(prev => ({ ...prev, backMaterial: value }))}
            >
              <SelectTrigger id="backMaterial">
                <SelectValue placeholder="Chọn chất liệu" />
              </SelectTrigger>
              <SelectContent>
                {materialOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="frontMaterial">Chất liệu in mặt trước áo</Label>
            <Select
              value={tempConfig.frontMaterial}
              onValueChange={(value) => setTempConfig(prev => ({ ...prev, frontMaterial: value }))}
            >
              <SelectTrigger id="frontMaterial">
                <SelectValue placeholder="Chọn chất liệu" />
              </SelectTrigger>
              <SelectContent>
                {materialOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sleeveMaterial">Chất liệu in tay áo</Label>
            <Select
              value={tempConfig.sleeveMaterial}
              onValueChange={(value) => setTempConfig(prev => ({ ...prev, sleeveMaterial: value }))}
            >
              <SelectTrigger id="sleeveMaterial">
                <SelectValue placeholder="Chọn chất liệu" />
              </SelectTrigger>
              <SelectContent>
                {materialOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="legMaterial">Chất liệu in ống quần</Label>
            <Select
              value={tempConfig.legMaterial}
              onValueChange={(value) => setTempConfig(prev => ({ ...prev, legMaterial: value }))}
            >
              <SelectTrigger id="legMaterial">
                <SelectValue placeholder="Chọn chất liệu" />
              </SelectTrigger>
              <SelectContent>
                {materialOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel}>Hủy</Button>
          <Button onClick={handleSave}>Lưu cấu hình</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
