
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DesignData, Logo, PrintPositionConfig } from "@/types";

interface PrintPositionsFormProps {
  designData: Partial<DesignData>;
  onDesignDataChange: (designData: Partial<DesignData>) => void;
  logos?: Logo[];
  teamName?: string;
}

export function PrintPositionsForm({ 
  designData, 
  onDesignDataChange,
  logos = [],
  teamName = ""
}: PrintPositionsFormProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "item-line-printing", 
    "item-chest-printing", 
    "item-pants-printing"
  ]);
  
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
  
  const fontOptions = [
    { value: "Arial", label: "Arial" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Helvetica", label: "Helvetica" },
    { value: "Roboto", label: "Roboto" },
    { value: "Open Sans", label: "Open Sans" }
  ];
  
  const handleAccordionChange = (value: string) => {
    setExpandedItems(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };
  
  const handlePrintPositionChange = (
    position: keyof DesignData, 
    field: string, 
    value: string | boolean | number
  ) => {
    const currentPosition = (designData[position] || {}) as any;
    const updatedPosition = { ...currentPosition, [field]: value };
    
    onDesignDataChange({
      ...designData,
      [position]: updatedPosition
    });
  };
  
  const handleTogglePosition = (position: keyof DesignData, enabled: boolean) => {
    const currentPosition = (designData[position] || {}) as any;
    
    if (enabled && !currentPosition.material) {
      onDesignDataChange({
        ...designData,
        [position]: {
          ...currentPosition,
          enabled,
          material: "In chuyển nhiệt",
          color: "Đen"
        }
      });
    } else {
      onDesignDataChange({
        ...designData,
        [position]: {
          ...currentPosition,
          enabled
        }
      });
    }
  };
  
  const getLogoByPosition = (position: string) => {
    const logoPosition = position.replace('logo_', '');
    return logos.find(logo => logo.position === logoPosition);
  };
  
  const setDefaultValues = () => {
    const defaultData: Partial<DesignData> = {
      ...designData,
      line_1: {
        enabled: true,
        material: "In chuyển nhiệt",
        color: "Đen",
        content: "",
        font: designData.font_text?.font || "Arial"
      },
      line_2: {
        enabled: true,
        material: "In chuyển nhiệt",
        color: "Đen",
        content: "",
        font: designData.font_number?.font || "Arial"
      },
      line_3: {
        enabled: true,
        material: "In chuyển nhiệt",
        color: "Đen",
        content: teamName,
        font: designData.font_text?.font || "Arial"
      },
      chest_number: {
        enabled: false,
        material: "In chuyển nhiệt",
        color: "Đen"
      },
      chest_text: {
        enabled: false,
        material: "In chuyển nhiệt",
        color: "Đen",
        content: "",
        font: designData.font_text?.font || "Arial"
      },
      pants_number: {
        enabled: true,
        material: "In chuyển nhiệt",
        color: "Đen"
      }
    };
    
    // Process logos and create logo position entries
    logos.forEach(logo => {
      const positionKey = `logo_${logo.position}` as keyof DesignData;
      
      if (isLogoPosition(positionKey)) {
        // Explicitly define the object type to match the PrintPositionConfig & logo properties
        const logoConfig: PrintPositionConfig & {
          logo_id?: string;
          x_position?: number;
          y_position?: number;
          scale?: number;
        } = {
          enabled: true,
          material: "In chuyển nhiệt",
          logo_id: logo.id,
          x_position: 0,
          y_position: 0,
          scale: 1.0
        };
        
        defaultData[positionKey] = logoConfig as any;
      }
    });
    
    onDesignDataChange(defaultData);
  };
  
  const isLogoPosition = (key: string): boolean => {
    const logoPositions = [
      'logo_chest_left', 'logo_chest_right', 'logo_chest_center',
      'logo_sleeve_left', 'logo_sleeve_right', 'logo_pants'
    ];
    return logoPositions.includes(key);
  };
  
  const hasEnabledProperty = (field: any): field is PrintPositionConfig => {
    return field && typeof field === 'object' && 'enabled' in field;
  };
  
  const getTextPrefix = (position: string): string => {
    switch(position) {
      case 'line_1': return 'IN DÒNG 1';
      case 'line_2': return 'IN DÒNG 2';
      case 'line_3': return 'IN DÒNG 3';
      case 'chest_text': return 'IN CHỮ NGỰC';
      case 'chest_number': return 'IN SỐ NGỰC';
      case 'pants_number': return 'IN SỐ QUẦN';
      case 'logo_chest_left': return 'LOGO NGỰC TRÁI';
      case 'logo_chest_right': return 'LOGO NGỰC PHẢI';
      case 'logo_chest_center': return 'LOGO NGỰC GIỮA';
      case 'logo_sleeve_left': return 'LOGO TAY TRÁI';
      case 'logo_sleeve_right': return 'LOGO TAY PHẢI';
      case 'pet_chest': return 'IN PET NGỰC';
      case 'logo_pants': return 'LOGO QUẦN';
      default: return position.toUpperCase().replace('_', ' ');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Cấu hình in ấn</CardTitle>
        <Button variant="outline" onClick={setDefaultValues}>
          Đặt giá trị mặc định
        </Button>
      </CardHeader>
      <CardContent>
        <Accordion
          type="multiple"
          value={expandedItems}
          onValueChange={setExpandedItems}
          className="w-full"
        >
          <AccordionItem value="item-line-printing">
            <AccordionTrigger onClick={() => handleAccordionChange("item-line-printing")}>
              In dòng chữ/số lưng
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="border p-4 rounded-md">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="line_1" 
                    checked={hasEnabledProperty(designData.line_1) ? designData.line_1.enabled : false}
                    onCheckedChange={(checked) => 
                      handleTogglePosition('line_1', checked === true)
                    }
                  />
                  <Label htmlFor="line_1" className="font-semibold">
                    {getTextPrefix('line_1')} (trên số lưng)
                  </Label>
                </div>
                
                {hasEnabledProperty(designData.line_1) && designData.line_1.enabled && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="line_1_material">Chất liệu</Label>
                      <Select 
                        value={designData.line_1.material || "In chuyển nhiệt"}
                        onValueChange={(value) => 
                          handlePrintPositionChange('line_1', 'material', value)
                        }
                      >
                        <SelectTrigger id="line_1_material">
                          <SelectValue placeholder="Chọn chất liệu" />
                        </SelectTrigger>
                        <SelectContent>
                          {materialOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="line_1_color">Màu sắc</Label>
                      <Select 
                        value={designData.line_1.color || "Đen"}
                        onValueChange={(value) => 
                          handlePrintPositionChange('line_1', 'color', value)
                        }
                      >
                        <SelectTrigger id="line_1_color">
                          <SelectValue placeholder="Chọn màu" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="sm:col-span-2">
                      <Label htmlFor="line_1_content">Nội dung</Label>
                      <Input 
                        id="line_1_content"
                        value={designData.line_1.content || ""}
                        onChange={(e) => 
                          handlePrintPositionChange('line_1', 'content', e.target.value)
                        }
                        placeholder="Nhập nội dung in dòng 1"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border p-4 rounded-md">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="line_2" 
                    checked={hasEnabledProperty(designData.line_2) ? designData.line_2.enabled : false}
                    onCheckedChange={(checked) => 
                      handleTogglePosition('line_2', checked === true)
                    }
                  />
                  <Label htmlFor="line_2" className="font-semibold">
                    {getTextPrefix('line_2')} (số lưng)
                  </Label>
                </div>
                
                {hasEnabledProperty(designData.line_2) && designData.line_2.enabled && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="line_2_material">Chất liệu</Label>
                      <Select 
                        value={designData.line_2.material || "In chuyển nhiệt"}
                        onValueChange={(value) => 
                          handlePrintPositionChange('line_2', 'material', value)
                        }
                      >
                        <SelectTrigger id="line_2_material">
                          <SelectValue placeholder="Chọn chất liệu" />
                        </SelectTrigger>
                        <SelectContent>
                          {materialOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="line_2_color">Màu sắc</Label>
                      <Select 
                        value={designData.line_2.color || "Đen"}
                        onValueChange={(value) => 
                          handlePrintPositionChange('line_2', 'color', value)
                        }
                      >
                        <SelectTrigger id="line_2_color">
                          <SelectValue placeholder="Chọn màu" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border p-4 rounded-md">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="line_3" 
                    checked={hasEnabledProperty(designData.line_3) ? designData.line_3.enabled : false}
                    onCheckedChange={(checked) => 
                      handleTogglePosition('line_3', checked === true)
                    }
                  />
                  <Label htmlFor="line_3" className="font-semibold">
                    {getTextPrefix('line_3')} (dưới số lưng)
                  </Label>
                </div>
                
                {hasEnabledProperty(designData.line_3) && designData.line_3.enabled && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="line_3_material">Chất liệu</Label>
                      <Select 
                        value={designData.line_3.material || "In chuyển nhiệt"}
                        onValueChange={(value) => 
                          handlePrintPositionChange('line_3', 'material', value)
                        }
                      >
                        <SelectTrigger id="line_3_material">
                          <SelectValue placeholder="Chọn chất liệu" />
                        </SelectTrigger>
                        <SelectContent>
                          {materialOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="line_3_color">Màu sắc</Label>
                      <Select 
                        value={designData.line_3.color || "Đen"}
                        onValueChange={(value) => 
                          handlePrintPositionChange('line_3', 'color', value)
                        }
                      >
                        <SelectTrigger id="line_3_color">
                          <SelectValue placeholder="Chọn màu" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="sm:col-span-2">
                      <Label htmlFor="line_3_content">Nội dung</Label>
                      <Input 
                        id="line_3_content"
                        value={designData.line_3.content || teamName}
                        onChange={(e) => 
                          handlePrintPositionChange('line_3', 'content', e.target.value)
                        }
                        placeholder="Nhập nội dung in dòng 3"
                      />
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-chest-printing">
            <AccordionTrigger onClick={() => handleAccordionChange("item-chest-printing")}>
              In mặt trước áo
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="border p-4 rounded-md">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="chest_text" 
                    checked={hasEnabledProperty(designData.chest_text) ? designData.chest_text.enabled : false}
                    onCheckedChange={(checked) => 
                      handleTogglePosition('chest_text', checked === true)
                    }
                  />
                  <Label htmlFor="chest_text" className="font-semibold">
                    {getTextPrefix('chest_text')}
                  </Label>
                </div>
                
                {hasEnabledProperty(designData.chest_text) && designData.chest_text.enabled && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="chest_text_material">Chất liệu</Label>
                      <Select 
                        value={designData.chest_text.material || "In chuyển nhiệt"}
                        onValueChange={(value) => 
                          handlePrintPositionChange('chest_text', 'material', value)
                        }
                      >
                        <SelectTrigger id="chest_text_material">
                          <SelectValue placeholder="Chọn chất liệu" />
                        </SelectTrigger>
                        <SelectContent>
                          {materialOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="chest_text_color">Màu sắc</Label>
                      <Select 
                        value={designData.chest_text.color || "Đen"}
                        onValueChange={(value) => 
                          handlePrintPositionChange('chest_text', 'color', value)
                        }
                      >
                        <SelectTrigger id="chest_text_color">
                          <SelectValue placeholder="Chọn màu" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="sm:col-span-2">
                      <Label htmlFor="chest_text_content">Nội dung</Label>
                      <Input 
                        id="chest_text_content"
                        value={designData.chest_text.content || ""}
                        onChange={(e) => 
                          handlePrintPositionChange('chest_text', 'content', e.target.value)
                        }
                        placeholder="Nhập nội dung in chữ ngực"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border p-4 rounded-md">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="chest_number" 
                    checked={hasEnabledProperty(designData.chest_number) ? designData.chest_number.enabled : false}
                    onCheckedChange={(checked) => 
                      handleTogglePosition('chest_number', checked === true)
                    }
                  />
                  <Label htmlFor="chest_number" className="font-semibold">
                    {getTextPrefix('chest_number')}
                  </Label>
                </div>
                
                {hasEnabledProperty(designData.chest_number) && designData.chest_number.enabled && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="chest_number_material">Chất liệu</Label>
                      <Select 
                        value={designData.chest_number.material || "In chuyển nhiệt"}
                        onValueChange={(value) => 
                          handlePrintPositionChange('chest_number', 'material', value)
                        }
                      >
                        <SelectTrigger id="chest_number_material">
                          <SelectValue placeholder="Chọn chất liệu" />
                        </SelectTrigger>
                        <SelectContent>
                          {materialOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="chest_number_color">Màu sắc</Label>
                      <Select 
                        value={designData.chest_number.color || "Đen"}
                        onValueChange={(value) => 
                          handlePrintPositionChange('chest_number', 'color', value)
                        }
                      >
                        <SelectTrigger id="chest_number_color">
                          <SelectValue placeholder="Chọn màu" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border p-4 rounded-md">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="pet_chest" 
                    checked={hasEnabledProperty(designData.pet_chest) ? designData.pet_chest.enabled : false}
                    onCheckedChange={(checked) => 
                      handleTogglePosition('pet_chest', checked === true)
                    }
                  />
                  <Label htmlFor="pet_chest" className="font-semibold">
                    {getTextPrefix('pet_chest')}
                  </Label>
                </div>
                
                {hasEnabledProperty(designData.pet_chest) && designData.pet_chest.enabled && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pet_chest_material">Chất liệu</Label>
                      <Select 
                        value={designData.pet_chest.material || "In chuyển nhiệt"}
                        onValueChange={(value) => 
                          handlePrintPositionChange('pet_chest', 'material', value)
                        }
                      >
                        <SelectTrigger id="pet_chest_material">
                          <SelectValue placeholder="Chọn chất liệu" />
                        </SelectTrigger>
                        <SelectContent>
                          {materialOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="pet_chest_color">Màu sắc</Label>
                      <Select 
                        value={designData.pet_chest.color || "Đen"}
                        onValueChange={(value) => 
                          handlePrintPositionChange('pet_chest', 'color', value)
                        }
                      >
                        <SelectTrigger id="pet_chest_color">
                          <SelectValue placeholder="Chọn màu" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="sm:col-span-2">
                      <Label htmlFor="pet_chest_content">Nội dung</Label>
                      <Input 
                        id="pet_chest_content"
                        value={designData.pet_chest.content || ""}
                        onChange={(e) => 
                          handlePrintPositionChange('pet_chest', 'content', e.target.value)
                        }
                        placeholder="Nhập nội dung in PET ngực"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {['logo_chest_left', 'logo_chest_right', 'logo_chest_center', 'logo_sleeve_left', 'logo_sleeve_right'].map(position => (
                <div key={position} className="border p-4 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={position} 
                      checked={hasEnabledProperty(designData[position as keyof DesignData]) ? 
                        (designData[position as keyof DesignData] as PrintPositionConfig).enabled : false}
                      onCheckedChange={(checked) => 
                        handleTogglePosition(position as keyof DesignData, checked === true)
                      }
                    />
                    <Label htmlFor={position} className="font-semibold">
                      {getTextPrefix(position)}
                    </Label>
                  </div>
                  
                  {hasEnabledProperty(designData[position as keyof DesignData]) && 
                    (designData[position as keyof DesignData] as PrintPositionConfig).enabled && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`${position}_material`}>Chất liệu</Label>
                        <Select 
                          value={(designData[position as keyof DesignData] as any)?.material || "In chuyển nhiệt"}
                          onValueChange={(value) => 
                            handlePrintPositionChange(position as keyof DesignData, 'material', value)
                          }
                        >
                          <SelectTrigger id={`${position}_material`}>
                            <SelectValue placeholder="Chọn chất liệu" />
                          </SelectTrigger>
                          <SelectContent>
                            {materialOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Logo đã tải lên</Label>
                        <p className="text-sm border rounded p-2">
                          {getLogoByPosition(position) ? 
                            getLogoByPosition(position)?.file.name.split('/').pop()?.split('.')[0] : 
                            "Chưa tải lên logo"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-pants-printing">
            <AccordionTrigger onClick={() => handleAccordionChange("item-pants-printing")}>
              In quần
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="border p-4 rounded-md">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="pants_number" 
                    checked={hasEnabledProperty(designData.pants_number) ? designData.pants_number.enabled : false}
                    onCheckedChange={(checked) => 
                      handleTogglePosition('pants_number', checked === true)
                    }
                  />
                  <Label htmlFor="pants_number" className="font-semibold">
                    {getTextPrefix('pants_number')}
                  </Label>
                </div>
                
                {hasEnabledProperty(designData.pants_number) && designData.pants_number.enabled && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pants_number_material">Chất liệu</Label>
                      <Select 
                        value={designData.pants_number.material || "In chuyển nhiệt"}
                        onValueChange={(value) => 
                          handlePrintPositionChange('pants_number', 'material', value)
                        }
                      >
                        <SelectTrigger id="pants_number_material">
                          <SelectValue placeholder="Chọn chất liệu" />
                        </SelectTrigger>
                        <SelectContent>
                          {materialOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="pants_number_color">Màu sắc</Label>
                      <Select 
                        value={designData.pants_number.color || "Đen"}
                        onValueChange={(value) => 
                          handlePrintPositionChange('pants_number', 'color', value)
                        }
                      >
                        <SelectTrigger id="pants_number_color">
                          <SelectValue placeholder="Chọn màu" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border p-4 rounded-md">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="logo_pants" 
                    checked={hasEnabledProperty(designData.logo_pants) ? designData.logo_pants.enabled : false}
                    onCheckedChange={(checked) => 
                      handleTogglePosition('logo_pants', checked === true)
                    }
                  />
                  <Label htmlFor="logo_pants" className="font-semibold">
                    {getTextPrefix('logo_pants')}
                  </Label>
                </div>
                
                {hasEnabledProperty(designData.logo_pants) && designData.logo_pants.enabled && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="logo_pants_material">Chất liệu</Label>
                      <Select 
                        value={designData.logo_pants.material || "In chuyển nhiệt"}
                        onValueChange={(value) => 
                          handlePrintPositionChange('logo_pants', 'material', value)
                        }
                      >
                        <SelectTrigger id="logo_pants_material">
                          <SelectValue placeholder="Chọn chất liệu" />
                        </SelectTrigger>
                        <SelectContent>
                          {materialOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Logo đã tải lên</Label>
                      <p className="text-sm border rounded p-2">
                        {getLogoByPosition('logo_pants') ? 
                          getLogoByPosition('logo_pants')?.file.name.split('/').pop()?.split('.')[0] : 
                          "Chưa tải lên logo"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-font-selection">
            <AccordionTrigger onClick={() => handleAccordionChange("item-font-selection")}>
              Phông chữ & số
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="font_text">Phông chữ</Label>
                  <Select 
                    value={designData.font_text?.font || "Arial"}
                    onValueChange={(value) => 
                      onDesignDataChange({
                        ...designData,
                        font_text: {
                          ...designData.font_text,
                          font: value
                        }
                      })
                    }
                  >
                    <SelectTrigger id="font_text">
                      <SelectValue placeholder="Chọn phông chữ" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="font_number">Phông số</Label>
                  <Select 
                    value={designData.font_number?.font || "Arial"}
                    onValueChange={(value) => 
                      onDesignDataChange({
                        ...designData,
                        font_number: {
                          ...designData.font_number,
                          font: value
                        }
                      })
                    }
                  >
                    <SelectTrigger id="font_number">
                      <SelectValue placeholder="Chọn phông số" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="sm:col-span-2">
                  <Label htmlFor="customFont">Tải lên phông tùy chỉnh</Label>
                  <Input 
                    id="customFont" 
                    type="file" 
                    accept=".ttf,.otf" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const fontUrl = URL.createObjectURL(file);
                      const fontName = file.name.split('.')[0];
                      
                      onDesignDataChange({
                        ...designData,
                        font_text: {
                          font: fontName,
                          font_file: fontUrl
                        },
                        font_number: {
                          font: fontName,
                          font_file: fontUrl
                        }
                      });
                    }}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Chỉ hỗ trợ định dạng .ttf và .otf
                  </p>
                </div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-md">
                <h4 className="font-semibold mb-2">Xem trước phông chữ</h4>
                <p className="text-xl" style={{fontFamily: designData.font_text?.font || "Arial"}}>
                  AaBbCcDd 123456789
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
