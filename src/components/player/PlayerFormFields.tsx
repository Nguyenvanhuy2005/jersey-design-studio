
import { Player, Logo } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectSeparator } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PlayerFormFieldsProps {
  newPlayer: Player;
  isEditing: boolean;
  printStyleOptions: string[];
  onInputChange: (field: keyof Player, value: any) => void;
  onAddOrUpdate: () => void;
  onCancel?: () => void;
}

export const PlayerFormFields = ({
  newPlayer,
  isEditing,
  printStyleOptions,
  onInputChange,
  onAddOrUpdate,
  onCancel
}: PlayerFormFieldsProps) => {
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, '');
    const maxLength = 2;
    const truncatedValue = numericValue.slice(0, maxLength);
    onInputChange('number', truncatedValue);
  };

  return (
    <div className="space-y-2">
      {/* Số áo và In số */}
      <div className="space-y-2">
        <div>
          <Label htmlFor="number" className="text-xs">Số áo</Label>
          <Input
            id="number"
            placeholder="Số áo"
            value={newPlayer.number}
            onChange={handleNumberChange}
            className="h-7 text-sm"
          />
        </div>
        
        <div className="space-y-1">
          <Label className="text-xs">In số áo & quần</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="chest_number"
                checked={newPlayer.chest_number}
                onCheckedChange={(checked) => onInputChange('chest_number', checked)}
              />
              <Label htmlFor="chest_number" className="text-xs">In số ngực</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pants_number"
                checked={newPlayer.pants_number}
                onCheckedChange={(checked) => onInputChange('pants_number', checked)}
              />
              <Label htmlFor="pants_number" className="text-xs">In số quần</Label>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Tên cầu thủ và In chữ ngực */}
      <div className="space-y-2">
        <div>
          <Label htmlFor="name" className="text-xs">Tên cầu thủ</Label>
          <Input
            id="name"
            placeholder="Tên cầu thủ"
            value={newPlayer.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            className="h-7 text-sm"
          />
        </div>

        <div>
          <Label className="text-xs">In chữ ngực</Label>
          <Input
            placeholder="Nhập chữ in ngực"
            value={newPlayer.chest_text || ''}
            onChange={(e) => onInputChange('chest_text', e.target.value)}
            className="h-7 text-sm"
          />
        </div>
        
        <div>
          <Label htmlFor="line_3" className="text-xs">Tên đội bóng (in dòng 3)</Label>
          <Input
            id="line_3"
            placeholder="Tên đội bóng"
            value={newPlayer.line_3 || ''}
            onChange={(e) => onInputChange('line_3', e.target.value)}
            className="h-7 text-sm"
          />
        </div>
      </div>

      <Separator className="my-2" />

      {/* Loại quần áo và Kích cỡ */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="uniform_type" className="text-xs">Loại quần áo</Label>
          <Select 
            value={newPlayer.uniform_type}
            onValueChange={(value) => onInputChange('uniform_type', value)}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="Chọn loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="player">Cầu thủ</SelectItem>
              <SelectItem value="goalkeeper">Thủ môn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="size" className="text-xs">Kích cỡ</Label>
          <Select 
            value={newPlayer.size}
            onValueChange={(value) => onInputChange('size', value)}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="Chọn kích cỡ" />
            </SelectTrigger>
            <SelectContent>
              <SelectLabel>Trẻ em</SelectLabel>
              <SelectItem value="3">Size 3</SelectItem>
              <SelectItem value="5">Size 5</SelectItem>
              <SelectItem value="7">Size 7</SelectItem>
              <SelectItem value="9">Size 9</SelectItem>
              <SelectItem value="11">Size 11</SelectItem>
              <SelectItem value="13">Size 13</SelectItem>
              <SelectItem value="15">Size 15</SelectItem>
              <SelectSeparator />
              <SelectLabel>Người lớn</SelectLabel>
              <SelectItem value="S">Size S</SelectItem>
              <SelectItem value="M">Size M</SelectItem>
              <SelectItem value="L">Size L</SelectItem>
              <SelectItem value="XL">Size XL</SelectItem>
              <SelectItem value="2XL">Size 2XL</SelectItem>
              <SelectItem value="3XL">Size 3XL</SelectItem>
              <SelectItem value="4XL">Size 4XL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Vị trí logo */}
      <div className="space-y-1">
        <Label className="text-xs">Vị trí logo</Label>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="logo_chest_left"
              checked={newPlayer.logo_chest_left}
              onCheckedChange={(checked) => onInputChange('logo_chest_left', checked)}
            />
            <Label htmlFor="logo_chest_left" className="text-xs">Ngực trái</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="logo_sleeve_left"
              checked={newPlayer.logo_sleeve_left}
              onCheckedChange={(checked) => onInputChange('logo_sleeve_left', checked)}
            />
            <Label htmlFor="logo_sleeve_left" className="text-xs">Tay trái</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="logo_chest_right"
              checked={newPlayer.logo_chest_right}
              onCheckedChange={(checked) => onInputChange('logo_chest_right', checked)}
            />
            <Label htmlFor="logo_chest_right" className="text-xs">Ngực phải</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="logo_sleeve_right"
              checked={newPlayer.logo_sleeve_right}
              onCheckedChange={(checked) => onInputChange('logo_sleeve_right', checked)}
            />
            <Label htmlFor="logo_sleeve_right" className="text-xs">Tay phải</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="logo_chest_center"
              checked={newPlayer.logo_chest_center}
              onCheckedChange={(checked) => onInputChange('logo_chest_center', checked)}
            />
            <Label htmlFor="logo_chest_center" className="text-xs">Ngực giữa</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="logo_pants"
              checked={newPlayer.logo_pants}
              onCheckedChange={(checked) => onInputChange('logo_pants', checked)}
            />
            <Label htmlFor="logo_pants" className="text-xs">Quần</Label>
          </div>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Kiểu in */}
      <div>
        <Label htmlFor="print_style" className="text-xs">Kiểu in</Label>
        <Select 
          value={newPlayer.print_style}
          onValueChange={(value) => onInputChange('print_style', value)}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="Chọn kiểu in" />
          </SelectTrigger>
          <SelectContent>
            {printStyleOptions.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-2 pt-2">
        {isEditing && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="h-7 text-xs px-2">
            Hủy
          </Button>
        )}
        <Button type="button" size="sm" onClick={onAddOrUpdate} className="h-7 text-xs px-3">
          {isEditing ? 'Cập nhật' : 'Thêm'}
        </Button>
      </div>
    </div>
  );
};
