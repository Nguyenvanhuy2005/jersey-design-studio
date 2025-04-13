
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PrintConfig } from "@/types";
import { toast } from "sonner";
import { loadCustomFont } from "@/utils/font-utils";

interface PrintConfigFormProps {
  printConfig: PrintConfig;
  onPrintConfigChange: (config: PrintConfig) => void;
}

export function PrintConfigForm({ printConfig, onPrintConfigChange }: PrintConfigFormProps) {
  const [tempConfig, setTempConfig] = useState<PrintConfig>(printConfig);
  const [open, setOpen] = useState(false);
  const [customTextFonts, setCustomTextFonts] = useState<string[]>([]);
  const [customNumberFonts, setCustomNumberFonts] = useState<string[]>([]);

  useEffect(() => {
    if (tempConfig.fontText.customFontFile && !customTextFonts.includes(tempConfig.fontText.customFontFile.name.split('.')[0])) {
      setCustomTextFonts(prev => [...prev, tempConfig.fontText.customFontFile!.name.split('.')[0]]);

      // Load the custom font for immediate preview
      if (tempConfig.fontText.customFontUrl) {
        loadCustomFont(tempConfig.fontText.customFontUrl, tempConfig.fontText.customFontFile.name.split('.')[0])
          .then(font => {
            if (font) {
              toast.success(`Đã tải phông chữ văn bản: ${font.family}`);
            }
          })
          .catch(err => {
            console.error("Error loading text font:", err);
            toast.error("Không thể tải phông chữ văn bản tùy chỉnh");
          });
      }
    }
    
    if (tempConfig.fontNumber.customFontFile && !customNumberFonts.includes(tempConfig.fontNumber.customFontFile.name.split('.')[0])) {
      setCustomNumberFonts(prev => [...prev, tempConfig.fontNumber.customFontFile!.name.split('.')[0]]);

      // Load the custom font for immediate preview
      if (tempConfig.fontNumber.customFontUrl) {
        loadCustomFont(tempConfig.fontNumber.customFontUrl, tempConfig.fontNumber.customFontFile.name.split('.')[0])
          .then(font => {
            if (font) {
              toast.success(`Đã tải phông chữ số: ${font.family}`);
            }
          })
          .catch(err => {
            console.error("Error loading number font:", err);
            toast.error("Không thể tải phông chữ số tùy chỉnh");
          });
      }
    }
  }, [tempConfig.fontText.customFontFile, tempConfig.fontText.customFontUrl,
      tempConfig.fontNumber.customFontFile, tempConfig.fontNumber.customFontUrl]);

  useEffect(() => {
    if (printConfig.fontText.customFontFile && printConfig.fontText.customFontFile.name) {
      const fontName = printConfig.fontText.customFontFile.name.split('.')[0];
      if (!customTextFonts.includes(fontName)) {
        setCustomTextFonts(prev => [...prev, fontName]);
      }
    }
    
    if (printConfig.fontNumber.customFontFile && printConfig.fontNumber.customFontFile.name) {
      const fontName = printConfig.fontNumber.customFontFile.name.split('.')[0];
      if (!customNumberFonts.includes(fontName)) {
        setCustomNumberFonts(prev => [...prev, fontName]);
      }
    }
  }, []);

  const handleSave = () => {
    onPrintConfigChange(tempConfig);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempConfig(printConfig);
    setOpen(false);
  };

  const handleCustomTextFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['.ttf', '.otf'];
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!validTypes.includes(fileExtension)) {
      toast.error("Chỉ hỗ trợ định dạng phông chữ .ttf hoặc .otf");
      return;
    }

    // Create an object URL for the font file
    const fontUrl = URL.createObjectURL(file);
    const fontName = file.name.split('.')[0];
    
    setTempConfig(prev => ({
      ...prev,
      fontText: {
        ...prev.fontText,
        customFontFile: file,
        customFontUrl: fontUrl,
        font: fontName
      }
    }));
    
    if (!customTextFonts.includes(fontName)) {
      setCustomTextFonts(prev => [...prev, fontName]);
    }

    toast.info(`Đã tải lên phông chữ văn bản: ${fontName}`);
  };

  const handleCustomNumberFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['.ttf', '.otf'];
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!validTypes.includes(fileExtension)) {
      toast.error("Chỉ hỗ trợ định dạng phông chữ .ttf hoặc .otf");
      return;
    }

    // Create an object URL for the font file
    const fontUrl = URL.createObjectURL(file);
    const fontName = file.name.split('.')[0];
    
    setTempConfig(prev => ({
      ...prev,
      fontNumber: {
        ...prev.fontNumber,
        customFontFile: file,
        customFontUrl: fontUrl,
        font: fontName
      }
    }));
    
    if (!customNumberFonts.includes(fontName)) {
      setCustomNumberFonts(prev => [...prev, fontName]);
    }

    toast.info(`Đã tải lên phông chữ số: ${fontName}`);
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
        <Button variant="outline">Cấu hình màu sắc & chất liệu in mặc định</Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Cấu hình màu sắc và chất liệu in mặc định</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2 md:col-span-2">
            <h3 className="font-medium mb-2">Font chữ và số</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fontText">Font chữ mặc định</Label>
                <div className="flex flex-col space-y-2">
                  <Select
                    value={tempConfig.fontText.font}
                    onValueChange={(value) => setTempConfig(prev => ({ 
                      ...prev, 
                      fontText: {
                        ...prev.fontText,
                        font: value
                      }
                    }))}
                  >
                    <SelectTrigger id="fontText">
                      <SelectValue placeholder="Chọn font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      
                      {customTextFonts.length > 0 && (
                        <>
                          <SelectItem disabled value="divider">
                            --- Font tùy chỉnh ---
                          </SelectItem>
                          {customTextFonts.map(fontName => (
                            <SelectItem key={fontName} value={fontName}>
                              {fontName}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  
                  <div>
                    <Label htmlFor="customFontText" className="mb-2 block">Tải lên font chữ tùy chỉnh (.ttf/.otf)</Label>
                    <Input 
                      id="customFontText" 
                      type="file" 
                      accept=".ttf,.otf" 
                      onChange={handleCustomTextFontUpload}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fontNumber">Font số mặc định</Label>
                <div className="flex flex-col space-y-2">
                  <Select
                    value={tempConfig.fontNumber.font}
                    onValueChange={(value) => setTempConfig(prev => ({ 
                      ...prev, 
                      fontNumber: {
                        ...prev.fontNumber,
                        font: value
                      }
                    }))}
                  >
                    <SelectTrigger id="fontNumber">
                      <SelectValue placeholder="Chọn font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      
                      {customNumberFonts.length > 0 && (
                        <>
                          <SelectItem disabled value="divider">
                            --- Font tùy chỉnh ---
                          </SelectItem>
                          {customNumberFonts.map(fontName => (
                            <SelectItem key={fontName} value={fontName}>
                              {fontName}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  
                  <div>
                    <Label htmlFor="customFontNumber" className="mb-2 block">Tải lên font số tùy chỉnh (.ttf/.otf)</Label>
                    <Input 
                      id="customFontNumber" 
                      type="file" 
                      accept=".ttf,.otf" 
                      onChange={handleCustomNumberFontUpload}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {(tempConfig.fontText.customFontUrl || tempConfig.fontNumber.customFontUrl) && (
              <div className="mt-4 p-2 bg-green-50 border border-green-100 rounded text-sm">
                <p className="text-green-700 font-medium">Xem trước font tùy chỉnh:</p>
                
                {tempConfig.fontText.customFontUrl && (
                  <div className="mt-1">
                    <p className="text-xs text-green-600">Font chữ: {tempConfig.fontText.customFontFile?.name}</p>
                    <p style={{fontFamily: tempConfig.fontText.customFontFile?.name.split('.')[0]}} className="text-lg mt-1">
                      AaBbCcDd 123456789
                    </p>
                  </div>
                )}
                
                {tempConfig.fontNumber.customFontUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-green-600">Font số: {tempConfig.fontNumber.customFontFile?.name}</p>
                    <p style={{fontFamily: tempConfig.fontNumber.customFontFile?.name.split('.')[0]}} className="text-lg mt-1">
                      0123456789
                    </p>
                  </div>
                )}
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
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel}>Hủy</Button>
          <Button onClick={handleSave}>Lưu cấu hình</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
