import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { DesignData } from "@/types";

interface PrintInfoFormProps {
  designData: DesignData;
  onDesignDataChange: (data: DesignData) => void;
}

export function PrintInfoForm({ designData, onDesignDataChange }: PrintInfoFormProps) {
  const [activeTab, setActiveTab] = useState<string>("back");
  
  const materialOptions = [
    { value: "In chuyển nhiệt", label: "In chuyển nhiệt" },
    { value: "In decal", label: "In decal" },
    { value: "In ép plastic", label: "In ép plastic" },
    { value: "Thêu", label: "Thêu" }
  ];
  
  const colorOptions = [
    { value: "Đen", label: "Đen" },
    { value: "Trắng", label: "Trắng" },
    { value: "Đỏ", label: "Đỏ" },
    { value: "Vàng", label: "Vàng" },
    { value: "Xanh", label: "Xanh" },
    { value: "Cam", label: "Cam" },
    { value: "Xanh lá", label: "Xanh lá" },
    { value: "Tím", label: "Tím" },
    { value: "Hồng", label: "Hồng" }
  ];

  const updateTextPrintPosition = (position: keyof DesignData, field: keyof PrintInfoFormProps['designData'][keyof DesignData], value: any) => {
    onDesignDataChange({
      ...designData,
      [position]: {
        ...(designData[position] || {}),
        [field]: value
      }
    });
  };

  const togglePrintPosition = (position: keyof DesignData, enabled: boolean) => {
    if (!enabled) {
      // If disabling, keep the position data but mark as disabled
      onDesignDataChange({
        ...designData,
        [position]: {
          ...(designData[position] || {}),
          enabled: false
        }
      });
    } else {
      // If enabling, set default values
      const defaultMaterial = "In chuyển nhiệt";
      const defaultColor = "Đen";
      
      onDesignDataChange({
        ...designData,
        [position]: {
          ...(designData[position] || {}),
          enabled: true,
          material: (designData[position] as any)?.material || defaultMaterial,
          color: (designData[position] as any)?.color || defaultColor
        }
      });
    }
  };

  const isPrintPositionEnabled = (position: keyof DesignData): boolean => {
    return Boolean((designData[position] as any)?.enabled);
  };

  const updateFont = (type: 'font_text' | 'font_number', font: string) => {
    onDesignDataChange({
      ...designData,
      [type]: {
        ...designData[type],
        font
      }
    });
  };

  const handleCustomFontUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'font_text' | 'font_number') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['.ttf', '.otf'];
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!validTypes.includes(fileExtension)) {
      alert("Chỉ hỗ trợ định dạng phông chữ .ttf hoặc .otf");
      return;
    }

    const fontName = file.name.split('.')[0];
    
    // Create a blob URL for preview
    const fontUrl = URL.createObjectURL(file);
    
    // Update design data
    onDesignDataChange({
      ...designData,
      [type]: {
        ...designData[type],
        font: fontName,
        font_file: fontUrl
      }
    });

    // Clean up URL on component unmount
    return () => URL.revokeObjectURL(fontUrl);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Thông tin in ấn</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Font settings */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h3 className="font-medium">Font chữ và số</h3>
              
              <div>
                <Label htmlFor="fontText">Font chữ</Label>
                <Select 
                  value={designData.font_text.font}
                  onValueChange={(value) => updateFont('font_text', value)}
                >
                  <SelectTrigger id="fontText">
                    <SelectValue placeholder="Chọn font chữ" />
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
              
              <div>
                <Label htmlFor="fontTextCustom">Tải lên font chữ tùy chỉnh (.ttf, .otf)</Label>
                <Input 
                  id="fontTextCustom" 
                  type="file" 
                  accept=".ttf,.otf"
                  onChange={(e) => handleCustomFontUpload(e, 'font_text')}
                />
              </div>
              
              <div className="pt-3 border-t">
                <Label htmlFor="fontNumber">Font số</Label>
                <Select 
                  value={designData.font_number.font}
                  onValueChange={(value) => updateFont('font_number', value)}
                >
                  <SelectTrigger id="fontNumber">
                    <SelectValue placeholder="Chọn font số" />
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
              
              <div>
                <Label htmlFor="fontNumberCustom">Tải lên font số tùy chỉnh (.ttf, .otf)</Label>
                <Input 
                  id="fontNumberCustom" 
                  type="file" 
                  accept=".ttf,.otf"
                  onChange={(e) => handleCustomFontUpload(e, 'font_number')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Print positions */}
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="back" className="flex-1">Mặt sau</TabsTrigger>
              <TabsTrigger value="front" className="flex-1">Mặt trước</TabsTrigger>
              <TabsTrigger value="pants" className="flex-1">Quần</TabsTrigger>
            </TabsList>
            
            {/* Back side printing options */}
            <TabsContent value="back" className="space-y-4 mt-4">
              <div className="space-y-4">
                {/* Line 1 (above number) */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="line_1_enabled">IN DÒNG 1 (Trên số lưng)</Label>
                    <Switch 
                      id="line_1_enabled"
                      checked={isPrintPositionEnabled('line_1')}
                      onCheckedChange={(checked) => togglePrintPosition('line_1', checked)}
                    />
                  </div>
                  
                  {isPrintPositionEnabled('line_1') && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="line_1_content">Nội dung</Label>
                        <Input 
                          id="line_1_content"
                          value={(designData.line_1 as any)?.content || ''}
                          onChange={(e) => updateTextPrintPosition('line_1', 'content', e.target.value)}
                          placeholder="Nhập nội dung in"
                        />
                      </div>
                      <div>
                        <Label htmlFor="line_1_material">Chất liệu</Label>
                        <Select 
                          value={(designData.line_1 as any)?.material || 'In chuyển nhiệt'}
                          onValueChange={(value) => updateTextPrintPosition('line_1', 'material', value)}
                        >
                          <SelectTrigger id="line_1_material">
                            <SelectValue placeholder="Chất liệu" />
                          </SelectTrigger>
                          <SelectContent>
                            {materialOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="line_1_color">Màu sắc</Label>
                        <Select 
                          value={(designData.line_1 as any)?.color || 'Đen'}
                          onValueChange={(value) => updateTextPrintPosition('line_1', 'color', value)}
                        >
                          <SelectTrigger id="line_1_color">
                            <SelectValue placeholder="Màu sắc" />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Line 2 (number) */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="line_2_enabled">IN DÒNG 2 (Số lưng)</Label>
                    <Switch 
                      id="line_2_enabled"
                      checked={isPrintPositionEnabled('line_2')}
                      onCheckedChange={(checked) => togglePrintPosition('line_2', checked)}
                    />
                  </div>
                  
                  {isPrintPositionEnabled('line_2') && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="line_2_content">Nội dung</Label>
                        <Input 
                          id="line_2_content"
                          value={(designData.line_2 as any)?.content || ''}
                          onChange={(e) => updateTextPrintPosition('line_2', 'content', e.target.value)}
                          placeholder="Số áo từ danh sách cầu thủ"
                          disabled
                        />
                      </div>
                      <div>
                        <Label htmlFor="line_2_material">Chất liệu</Label>
                        <Select 
                          value={(designData.line_2 as any)?.material || 'In chuyển nhiệt'}
                          onValueChange={(value) => updateTextPrintPosition('line_2', 'material', value)}
                        >
                          <SelectTrigger id="line_2_material">
                            <SelectValue placeholder="Chất liệu" />
                          </SelectTrigger>
                          <SelectContent>
                            {materialOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="line_2_color">Màu sắc</Label>
                        <Select 
                          value={(designData.line_2 as any)?.color || 'Đen'}
                          onValueChange={(value) => updateTextPrintPosition('line_2', 'color', value)}
                        >
                          <SelectTrigger id="line_2_color">
                            <SelectValue placeholder="Màu sắc" />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Line 3 (team name) */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="line_3_enabled">IN DÒNG 3 (Dưới số lưng)</Label>
                    <Switch 
                      id="line_3_enabled"
                      checked={isPrintPositionEnabled('line_3')}
                      onCheckedChange={(checked) => togglePrintPosition('line_3', checked)}
                    />
                  </div>
                  
                  {isPrintPositionEnabled('line_3') && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="line_3_content">Nội dung</Label>
                        <Input 
                          id="line_3_content"
                          value={(designData.line_3 as any)?.content || ''}
                          onChange={(e) => updateTextPrintPosition('line_3', 'content', e.target.value)}
                          placeholder="Nhập nội dung in (VD: tên đội)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="line_3_material">Chất liệu</Label>
                        <Select 
                          value={(designData.line_3 as any)?.material || 'In chuyển nhiệt'}
                          onValueChange={(value) => updateTextPrintPosition('line_3', 'material', value)}
                        >
                          <SelectTrigger id="line_3_material">
                            <SelectValue placeholder="Chất liệu" />
                          </SelectTrigger>
                          <SelectContent>
                            {materialOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="line_3_color">Màu sắc</Label>
                        <Select 
                          value={(designData.line_3 as any)?.color || 'Đen'}
                          onValueChange={(value) => updateTextPrintPosition('line_3', 'color', value)}
                        >
                          <SelectTrigger id="line_3_color">
                            <SelectValue placeholder="Màu sắc" />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Front side printing options */}
            <TabsContent value="front" className="space-y-4 mt-4">
              <div className="space-y-4">
                {/* Chest text */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="chest_text_enabled">IN CHỮ NGỰC</Label>
                    <Switch 
                      id="chest_text_enabled"
                      checked={isPrintPositionEnabled('chest_text')}
                      onCheckedChange={(checked) => togglePrintPosition('chest_text', checked)}
                    />
                  </div>
                  
                  {isPrintPositionEnabled('chest_text') && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="chest_text_content">Nội dung</Label>
                        <Input 
                          id="chest_text_content"
                          value={(designData.chest_text as any)?.content || ''}
                          onChange={(e) => updateTextPrintPosition('chest_text', 'content', e.target.value)}
                          placeholder="Nhập nội dung in"
                        />
                      </div>
                      <div>
                        <Label htmlFor="chest_text_material">Chất liệu</Label>
                        <Select 
                          value={(designData.chest_text as any)?.material || 'In chuyển nhiệt'}
                          onValueChange={(value) => updateTextPrintPosition('chest_text', 'material', value)}
                        >
                          <SelectTrigger id="chest_text_material">
                            <SelectValue placeholder="Chất liệu" />
                          </SelectTrigger>
                          <SelectContent>
                            {materialOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="chest_text_color">Màu sắc</Label>
                        <Select 
                          value={(designData.chest_text as any)?.color || 'Đen'}
                          onValueChange={(value) => updateTextPrintPosition('chest_text', 'color', value)}
                        >
                          <SelectTrigger id="chest_text_color">
                            <SelectValue placeholder="Màu sắc" />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Chest number */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="chest_number_enabled">IN SỐ NGỰC</Label>
                    <Switch 
                      id="chest_number_enabled"
                      checked={isPrintPositionEnabled('chest_number')}
                      onCheckedChange={(checked) => togglePrintPosition('chest_number', checked)}
                    />
                  </div>
                  
                  {isPrintPositionEnabled('chest_number') && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="chest_number_material">Chất liệu</Label>
                        <Select 
                          value={(designData.chest_number as any)?.material || 'In chuyển nhiệt'}
                          onValueChange={(value) => updateTextPrintPosition('chest_number', 'material', value)}
                        >
                          <SelectTrigger id="chest_number_material">
                            <SelectValue placeholder="Chất liệu" />
                          </SelectTrigger>
                          <SelectContent>
                            {materialOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="chest_number_color">Màu sắc</Label>
                        <Select 
                          value={(designData.chest_number as any)?.color || 'Đen'}
                          onValueChange={(value) => updateTextPrintPosition('chest_number', 'color', value)}
                        >
                          <SelectTrigger id="chest_number_color">
                            <SelectValue placeholder="Màu sắc" />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* PET chest */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="pet_chest_enabled">IN PET NGỰC</Label>
                    <Switch 
                      id="pet_chest_enabled"
                      checked={isPrintPositionEnabled('pet_chest')}
                      onCheckedChange={(checked) => togglePrintPosition('pet_chest', checked)}
                    />
                  </div>
                  
                  {isPrintPositionEnabled('pet_chest') && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="pet_chest_content">Nội dung</Label>
                        <Input 
                          id="pet_chest_content"
                          value={(designData.pet_chest as any)?.content || ''}
                          onChange={(e) => updateTextPrintPosition('pet_chest', 'content', e.target.value)}
                          placeholder="Nhập nội dung in PET"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pet_chest_material">Chất liệu</Label>
                        <Select 
                          value={(designData.pet_chest as any)?.material || 'In chuyển nhiệt'}
                          onValueChange={(value) => updateTextPrintPosition('pet_chest', 'material', value)}
                        >
                          <SelectTrigger id="pet_chest_material">
                            <SelectValue placeholder="Chất liệu" />
                          </SelectTrigger>
                          <SelectContent>
                            {materialOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="pet_chest_color">Màu sắc</Label>
                        <Select 
                          value={(designData.pet_chest as any)?.color || 'Đen'}
                          onValueChange={(value) => updateTextPrintPosition('pet_chest', 'color', value)}
                        >
                          <SelectTrigger id="pet_chest_color">
                            <SelectValue placeholder="Màu sắc" />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Pants printing options */}
            <TabsContent value="pants" className="space-y-4 mt-4">
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="pants_number_enabled">IN SỐ QUẦN</Label>
                  <Switch 
                    id="pants_number_enabled"
                    checked={isPrintPositionEnabled('pants_number')}
                    onCheckedChange={(checked) => togglePrintPosition('pants_number', checked)}
                  />
                </div>
                
                {isPrintPositionEnabled('pants_number') && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="pants_number_material">Chất liệu</Label>
                      <Select 
                        value={(designData.pants_number as any)?.material || 'In chuyển nhiệt'}
                        onValueChange={(value) => updateTextPrintPosition('pants_number', 'material', value)}
                      >
                        <SelectTrigger id="pants_number_material">
                          <SelectValue placeholder="Chất liệu" />
                        </SelectTrigger>
                        <SelectContent>
                          {materialOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="pants_number_color">Màu sắc</Label>
                      <Select 
                        value={(designData.pants_number as any)?.color || 'Đen'}
                        onValueChange={(value) => updateTextPrintPosition('pants_number', 'color', value)}
                      >
                        <SelectTrigger id="pants_number_color">
                          <SelectValue placeholder="Màu sắc" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
