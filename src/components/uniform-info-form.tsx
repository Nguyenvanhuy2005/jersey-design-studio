
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DesignData } from "@/types";

interface UniformInfoFormProps {
  teamName: string;
  onTeamNameChange: (name: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  uniformType: 'player' | 'goalkeeper';
  onUniformTypeChange: (type: 'player' | 'goalkeeper') => void;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  designData: Partial<DesignData>;
  onDesignDataChange: (data: Partial<DesignData>) => void;
}

export function UniformInfoForm({ 
  teamName, 
  onTeamNameChange, 
  notes, 
  onNotesChange,
  uniformType,
  onUniformTypeChange,
  quantity,
  onQuantityChange,
  designData,
  onDesignDataChange
}: UniformInfoFormProps) {
  
  // Update designData when uniformType or quantity changes
  useEffect(() => {
    onDesignDataChange({
      ...designData,
      uniform_type: uniformType,
      quantity: quantity
    });
  }, [uniformType, quantity]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin đội bóng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="teamName">Tên đội bóng</Label>
          <Input 
            id="teamName"
            value={teamName}
            onChange={(e) => onTeamNameChange(e.target.value)}
            placeholder="Nhập tên đội bóng (không bắt buộc)"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="uniformType">Loại quần áo</Label>
            <Select
              value={uniformType}
              onValueChange={(value: 'player' | 'goalkeeper') => onUniformTypeChange(value)}
            >
              <SelectTrigger id="uniformType">
                <SelectValue placeholder="Chọn loại quần áo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player">Cầu thủ</SelectItem>
                <SelectItem value="goalkeeper">Thủ môn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="quantity">Số lượng quần áo</Label>
            <Input 
              id="quantity"
              type="number"
              value={quantity || ""}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
              placeholder="Nhập số lượng quần áo"
              min={1}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="notes">Ghi chú</Label>
          <Textarea 
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Nhập ghi chú hoặc yêu cầu đặc biệt (nếu có)"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
