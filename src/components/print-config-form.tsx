
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PrintConfig } from "@/types";

interface PrintConfigFormProps {
  printConfig: PrintConfig;
  onPrintConfigChange: (config: PrintConfig) => void;
}

export function PrintConfigForm({ printConfig, onPrintConfigChange }: PrintConfigFormProps) {
  const [tempConfig, setTempConfig] = useState<PrintConfig>(printConfig);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onPrintConfigChange(tempConfig);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempConfig(printConfig);
    setOpen(false);
  };

  const handleCustomFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fontUrl = URL.createObjectURL(file);
    setTempConfig(prev => ({
      ...prev,
      customFontFile: file,
      customFontUrl: fontUrl
    }));
  };

  const materialOptions = [
    { value: "In chuyển nhiệt", label: "In chuyển nhiệt" },
    { value: "In decal", label: "In decal" }
  ];

  const colorOptions = [
    { value: "Đen", label: "Đen" },
    { value: "Trắng", label: "Trắng" },
    { value: "Đỏ", label: "Đỏ" },
    { value: "Vàng", label: "Vàng" },
    { value: "Xanh", label: "Xanh" }
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
          {/* Font selection */}
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
                />
              </div>
            </div>
            
            {tempConfig.customFontUrl && (
              <p className="text-sm text-muted-foreground">
                Đã tải font tùy chỉnh: {tempConfig.customFontFile?.name}
              </p>
            )}
          </div>
          
          {/* Back material */}
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
          
          {/* Back color */}
          <div className="space-y-2">
            <Label htmlFor="backColor">Màu in lưng áo</Label>
            <Select
              value={tempConfig.backColor}
              onValueChange={(value) => setTempConfig(prev => ({ ...prev, backColor: value }))}
            >
              <SelectTrigger id="backColor">
                <SelectValue placeholder="Chọn màu" />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Front material */}
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
          
          {/* Front color */}
          <div className="space-y-2">
            <Label htmlFor="frontColor">Màu in mặt trước áo</Label>
            <Select
              value={tempConfig.frontColor}
              onValueChange={(value) => setTempConfig(prev => ({ ...prev, frontColor: value }))}
            >
              <SelectTrigger id="frontColor">
                <SelectValue placeholder="Chọn màu" />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Sleeve material */}
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
          
          {/* Sleeve color */}
          <div className="space-y-2">
            <Label htmlFor="sleeveColor">Màu in tay áo</Label>
            <Select
              value={tempConfig.sleeveColor}
              onValueChange={(value) => setTempConfig(prev => ({ ...prev, sleeveColor: value }))}
            >
              <SelectTrigger id="sleeveColor">
                <SelectValue placeholder="Chọn màu" />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Leg material */}
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
          
          {/* Leg color */}
          <div className="space-y-2">
            <Label htmlFor="legColor">Màu in ống quần</Label>
            <Select
              value={tempConfig.legColor}
              onValueChange={(value) => setTempConfig(prev => ({ ...prev, legColor: value }))}
            >
              <SelectTrigger id="legColor">
                <SelectValue placeholder="Chọn màu" />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel}>Hủy</Button>
          <Button onClick={handleSave}>Lưu cấu hình</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
