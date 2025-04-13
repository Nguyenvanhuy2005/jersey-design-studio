
import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DesignData } from "@/types";

export interface PrintInfoFormProps {
  designData: DesignData;
  onDesignDataChange: (designData: DesignData) => void;
  onExcelUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PrintInfoForm({ designData, onDesignDataChange, onExcelUpload }: PrintInfoFormProps) {
  const handleCheckboxChange = (field: keyof DesignData, checked: boolean) => {
    const updatedDesignData = { ...designData };
    
    // Special handling for fields that need different structure
    if (field === 'line_1' || field === 'line_2' || field === 'line_3' || 
        field === 'chest_text' || field === 'chest_number' || field === 'pants_number' || field === 'pet_chest') {
      // Ensure we maintain the proper structure or create it if it doesn't exist
      updatedDesignData[field] = {
        ...(updatedDesignData[field] as object || {}),
        enabled: checked,
        material: "In chuyển nhiệt",
        color: "Đen"
      };
    }
    
    onDesignDataChange(updatedDesignData);
  };

  const handleContentChange = (field: keyof DesignData, content: string) => {
    const updatedDesignData = { ...designData };
    
    // Special handling for fields that need different structure
    if (field === 'line_1' || field === 'line_2' || field === 'line_3' || 
        field === 'chest_text' || field === 'chest_number' || field === 'pants_number' || field === 'pet_chest') {
      // Ensure we maintain the proper structure or create it if it doesn't exist
      updatedDesignData[field] = {
        ...(updatedDesignData[field] as object || {}),
        content,
        enabled: true,
        material: "In chuyển nhiệt",
        color: "Đen"
      };
    }
    
    onDesignDataChange(updatedDesignData);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Thông tin in</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-base">Mặt lưng</Label>
          <div className="space-y-3 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="back-number" 
                checked={designData.line_2?.enabled || false}
                onCheckedChange={(checked) => handleCheckboxChange('line_2', checked === true)}
              />
              <Label htmlFor="back-number">In số áo</Label>
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="above-number-text" 
                  checked={designData.line_1?.enabled || false}
                  onCheckedChange={(checked) => handleCheckboxChange('line_1', checked === true)}
                />
                <Label htmlFor="above-number-text">Dòng chữ trên số áo</Label>
              </div>
              
              <Input 
                value={designData.line_1?.content || ''}
                onChange={(e) => handleContentChange('line_1', e.target.value)}
                placeholder="Nội dung dòng chữ trên số áo"
                disabled={!designData.line_1?.enabled}
                className="ml-6"
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="below-number-text" 
                  checked={designData.line_3?.enabled || false}
                  onCheckedChange={(checked) => handleCheckboxChange('line_3', checked === true)}
                />
                <Label htmlFor="below-number-text">Dòng chữ dưới số áo</Label>
              </div>
              
              <Input 
                value={designData.line_3?.content || ''}
                onChange={(e) => handleContentChange('line_3', e.target.value)}
                placeholder="Nội dung dòng chữ dưới số áo"
                disabled={!designData.line_3?.enabled}
                className="ml-6"
              />
            </div>
          </div>
        </div>
        
        <div>
          <Label className="text-base">Mặt trước</Label>
          <div className="space-y-3 mt-2">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="chest-text" 
                  checked={designData.chest_text?.enabled || false}
                  onCheckedChange={(checked) => handleCheckboxChange('chest_text', checked === true)}
                />
                <Label htmlFor="chest-text">Chữ ở ngực</Label>
              </div>
              
              <Input 
                value={designData.chest_text?.content || ''}
                onChange={(e) => handleContentChange('chest_text', e.target.value)}
                placeholder="Nội dung chữ ở ngực"
                disabled={!designData.chest_text?.enabled}
                className="ml-6"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="chest-number" 
                checked={designData.chest_number?.enabled || false}
                onCheckedChange={(checked) => handleCheckboxChange('chest_number', checked === true)}
              />
              <Label htmlFor="chest-number">In số ở giữa bụng</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="pants-number" 
                checked={designData.pants_number?.enabled || false}
                onCheckedChange={(checked) => handleCheckboxChange('pants_number', checked === true)}
              />
              <Label htmlFor="pants-number">In số trên quần</Label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-muted/20 p-4 rounded-md">
        <Label htmlFor="excel-upload" className="block mb-2">
          Tải lên thông tin in từ Excel
        </Label>
        <Input
          id="excel-upload"
          type="file"
          accept=".xlsx,.xls"
          onChange={onExcelUpload}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Format: Tên cầu thủ, số áo, dòng chữ trên/dưới số áo, chữ ở ngực, loại font chữ...
        </p>
      </div>
    </div>
  );
}
