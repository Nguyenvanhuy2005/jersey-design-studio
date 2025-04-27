import { Player, Logo } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="number">Số áo</Label>
          <Input
            id="number"
            placeholder="Số áo"
            value={newPlayer.number}
            onChange={handleNumberChange}
          />
        </div>
        <div>
          <Label htmlFor="name">Tên cầu thủ</Label>
          <Input
            id="name"
            placeholder="Tên cầu thủ"
            value={newPlayer.name}
            onChange={(e) => onInputChange('name', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="size">Kích cỡ</Label>
          <Select onValueChange={(value) => onInputChange('size', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn kích cỡ" defaultValue={newPlayer.size} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="XS">XS</SelectItem>
              <SelectItem value="S">S</SelectItem>
              <SelectItem value="M">M</SelectItem>
              <SelectItem value="L">L</SelectItem>
              <SelectItem value="XL">XL</SelectItem>
              <SelectItem value="2XL">2XL</SelectItem>
              <SelectItem value="3XL">3XL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="uniform_type">Loại quần áo</Label>
          <Select onValueChange={(value) => onInputChange('uniform_type', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn loại" defaultValue={newPlayer.uniform_type} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="player">Cầu thủ</SelectItem>
              <SelectItem value="goalkeeper">Thủ môn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-4 pt-4">
        <Label>In số & chữ ngực</Label>
        <div className="flex flex-col gap-4">
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label>In chữ ngực</Label>
              <Input
                placeholder="Nhập chữ in ngực"
                value={newPlayer.chest_text || ''}
                onChange={(e) => onInputChange('chest_text', e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="chest_number"
                checked={newPlayer.chest_number}
                onCheckedChange={(checked) => onInputChange('chest_number', checked)}
              />
              <Label htmlFor="chest_number">In số ngực</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="pants_number"
                checked={newPlayer.pants_number}
                onCheckedChange={(checked) => onInputChange('pants_number', checked)}
              />
              <Label htmlFor="pants_number">In số quần</Label>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="print_style">Kiểu in</Label>
          <Select onValueChange={(value) => onInputChange('print_style', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn kiểu in" defaultValue={newPlayer.print_style} />
            </SelectTrigger>
            <SelectContent>
              {printStyleOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 pt-4">
        <Label>Vị trí logo</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="logo_chest_left"
              checked={newPlayer.logo_chest_left}
              onCheckedChange={(checked) => onInputChange('logo_chest_left', checked)}
            />
            <Label htmlFor="logo_chest_left">Ngực trái</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="logo_chest_right"
              checked={newPlayer.logo_chest_right}
              onCheckedChange={(checked) => onInputChange('logo_chest_right', checked)}
            />
            <Label htmlFor="logo_chest_right">Ngực phải</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="logo_chest_center"
              checked={newPlayer.logo_chest_center}
              onCheckedChange={(checked) => onInputChange('logo_chest_center', checked)}
            />
            <Label htmlFor="logo_chest_center">Ngực giữa</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="logo_sleeve_left"
              checked={newPlayer.logo_sleeve_left}
              onCheckedChange={(checked) => onInputChange('logo_sleeve_left', checked)}
            />
            <Label htmlFor="logo_sleeve_left">Tay trái</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="logo_sleeve_right"
              checked={newPlayer.logo_sleeve_right}
              onCheckedChange={(checked) => onInputChange('logo_sleeve_right', checked)}
            />
            <Label htmlFor="logo_sleeve_right">Tay phải</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="logo_pants"
              checked={newPlayer.logo_pants}
              onCheckedChange={(checked) => onInputChange('logo_pants', checked)}
            />
            <Label htmlFor="logo_pants">Quần</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        {isEditing && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Hủy
          </Button>
        )}
        <Button type="button" onClick={onAddOrUpdate}>
          {isEditing ? 'Cập nhật' : 'Thêm'}
        </Button>
      </div>
    </div>
  );
};
