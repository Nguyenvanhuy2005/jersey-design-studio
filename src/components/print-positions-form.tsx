import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DesignData } from "@/types";

interface PrintPositionsFormProps {
  designData?: Partial<DesignData>;
  onDesignDataChange: (data: Partial<DesignData>) => void;
  logos?: any[];
  printStyle: string;
  printColor: string;
  fontText: string;
  fontNumber: string;
}

export function PrintPositionsForm({
  designData = {},
  onDesignDataChange,
  logos = [],
  printStyle,
  printColor,
  fontText,
  fontNumber
}: PrintPositionsFormProps) {
  const [isChestNumberEnabled, setIsChestNumberEnabled] = useState(designData.chest_number?.enabled || false);
  const [isPantsNumberEnabled, setIsPantsNumberEnabled] = useState(designData.pants_number?.enabled || false);
  const [chestText, setChestText] = useState(designData.chest_text?.content || "");
  const [line1Text, setLine1Text] = useState(designData.line_1?.content || "");
  const [line3Text, setLine3Text] = useState(designData.line_3?.content || "");
  const [petChestText, setPetChestText] = useState(designData.pet_chest?.content || "");
  
  useEffect(() => {
    setIsChestNumberEnabled(designData.chest_number?.enabled || false);
    setIsPantsNumberEnabled(designData.pants_number?.enabled || false);
    setChestText(designData.chest_text?.content || "");
    setLine1Text(designData.line_1?.content || "");
    setLine3Text(designData.line_3?.content || "");
    setPetChestText(designData.pet_chest?.content || "");
  }, [designData]);
  
  const handleLogoChange = (position: string, checked: boolean) => {
    const updatedDesignData = { ...designData };
    const logoKey = `logo_${position}` as keyof DesignData;
    
    if (checked) {
      updatedDesignData[logoKey] = {
        enabled: checked,
        material: printStyle,
        logo_id: undefined,
        x_position: undefined,
        y_position: undefined,
        scale: undefined
      };
    } else {
      updatedDesignData[logoKey] = {
        enabled: checked,
        material: printStyle
      };
    }
    
    onDesignDataChange(updatedDesignData);
  };
  
  const handleLineChange = (line: 'line_1' | 'line_3' | 'chest_text' | 'pet_chest', field: string, value: any) => {
    const updatedDesignData = { ...designData };
    
    if (!updatedDesignData[line]) {
      updatedDesignData[line] = {
        enabled: true,
        content: '',
        color: printColor as 'Đen' | 'Trắng' | 'Đỏ' | 'Xanh',
        material: printStyle
      };
    }
    
    if (updatedDesignData[line]) {
      (updatedDesignData[line] as any)[field] = value;
    }
    
    onDesignDataChange(updatedDesignData);
  };

  const handleChestNumberChange = (checked: boolean) => {
    setIsChestNumberEnabled(checked);
    const updatedDesignData = {
      ...designData,
      chest_number: {
        enabled: checked,
        color: printColor as 'Đen' | 'Trắng' | 'Đỏ' | 'Xanh',
        material: printStyle
      }
    };
    onDesignDataChange(updatedDesignData);
  };

  const handlePantsNumberChange = (checked: boolean) => {
    setIsPantsNumberEnabled(checked);
    const updatedDesignData = {
      ...designData,
      pants_number: {
        enabled: checked,
        color: printColor as 'Đen' | 'Trắng' | 'Đỏ' | 'Xanh',
        material: printStyle
      }
    };
    onDesignDataChange(updatedDesignData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vị trí in</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Logo ngực trái</Label>
            <Checkbox
              checked={designData.logo_chest_left?.enabled || false}
              onCheckedChange={(checked) => handleLogoChange('chest_left', checked as boolean)}
            />
          </div>
          <div>
            <Label>Logo ngực phải</Label>
            <Checkbox
              checked={designData.logo_chest_right?.enabled || false}
              onCheckedChange={(checked) => handleLogoChange('chest_right', checked as boolean)}
            />
          </div>
          <div>
            <Label>Logo ngực giữa</Label>
            <Checkbox
              checked={designData.logo_chest_center?.enabled || false}
              onCheckedChange={(checked) => handleLogoChange('chest_center', checked as boolean)}
            />
          </div>
          <div>
            <Label>Logo tay trái</Label>
            <Checkbox
              checked={designData.logo_sleeve_left?.enabled || false}
              onCheckedChange={(checked) => handleLogoChange('sleeve_left', checked as boolean)}
            />
          </div>
          <div>
            <Label>Logo tay phải</Label>
            <Checkbox
              checked={designData.logo_sleeve_right?.enabled || false}
              onCheckedChange={(checked) => handleLogoChange('sleeve_right', checked as boolean)}
            />
          </div>
          <div>
            <Label>Logo quần</Label>
            <Checkbox
              checked={designData.logo_pants?.enabled || false}
              onCheckedChange={(checked) => handleLogoChange('pants', checked as boolean)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="line1">Tên cầu thủ</Label>
            <Input
              id="line1"
              type="text"
              placeholder="Nhập tên"
              value={line1Text}
              onChange={(e) => {
                setLine1Text(e.target.value);
                handleLineChange('line_1', 'content', e.target.value);
              }}
            />
          </div>
          <div>
            <Label htmlFor="line3">Tên đội</Label>
            <Input
              id="line3"
              type="text"
              placeholder="Nhập tên đội"
              value={line3Text}
              onChange={(e) => {
                setLine3Text(e.target.value);
                handleLineChange('line_3', 'content', e.target.value);
              }}
            />
          </div>
          <div>
            <Label htmlFor="chestText">Chữ ngực</Label>
            <Input
              id="chestText"
              type="text"
              placeholder="Nhập chữ ngực"
              value={chestText}
              onChange={(e) => {
                setChestText(e.target.value);
                handleLineChange('chest_text', 'content', e.target.value);
              }}
            />
          </div>
          <div>
            <Label htmlFor="petChest">PET ngực</Label>
            <Input
              id="petChest"
              type="text"
              placeholder="Nhập PET ngực"
              value={petChestText}
              onChange={(e) => {
                setPetChestText(e.target.value);
                handleLineChange('pet_chest', 'content', e.target.value);
              }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Số ngực</Label>
            <Checkbox
              checked={isChestNumberEnabled}
              onCheckedChange={(checked) => handleChestNumberChange(checked as boolean)}
            />
          </div>
          <div>
            <Label>Số quần</Label>
            <Checkbox
              checked={isPantsNumberEnabled}
              onCheckedChange={(checked) => handlePantsNumberChange(checked as boolean)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
