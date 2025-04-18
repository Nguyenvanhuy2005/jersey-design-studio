import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PrintConfig } from "@/types";
import { useFonts } from "@/hooks/useFonts";
import { toast } from "sonner";

interface PrintConfigFormProps {
  printConfig: PrintConfig;
  onPrintConfigChange: (config: PrintConfig) => void;
}

export function PrintConfigForm({ printConfig, onPrintConfigChange }: PrintConfigFormProps) {
  const [tempConfig, setTempConfig] = useState<PrintConfig>(printConfig);
  const [open, setOpen] = useState(false);
  const { customFonts, isUploading, uploadFont } = useFonts();

  const handleCustomFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['.ttf', '.otf'];
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!validTypes.includes(fileExtension)) {
      toast.error("Chỉ hỗ trợ định dạng phông chữ .ttf hoặc .otf");
      return;
    }

    const { success, fontName } = await uploadFont(file);
    if (success && fontName) {
      setTempConfig(prev => ({
        ...prev,
        font: fontName
      }));
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
                <Label htmlFor="customFont" className="mb-2 block">
                  Tải lên font tùy chỉnh (.ttf/.otf)
                </Label>
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
