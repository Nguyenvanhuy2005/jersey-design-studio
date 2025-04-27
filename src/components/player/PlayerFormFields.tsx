import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Player } from "@/types";
import { Plus } from "lucide-react";
const SIZES = {
  kids: ['3', '5', '7', '9', '11', '13', '15'] as const,
  adult: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'] as const
};
interface PlayerFormFieldsProps {
  newPlayer: Player;
  isEditing: boolean;
  printStyleOptions: string[];
  onInputChange: (field: keyof Player, value: any) => void;
  onAddOrUpdate: () => void;
  onCancel: () => void;
}
export const PlayerFormFields = memo(({
  newPlayer,
  isEditing,
  printStyleOptions,
  onInputChange,
  onAddOrUpdate,
  onCancel
}: PlayerFormFieldsProps) => {
  const hasChestText = newPlayer.chest_text && newPlayer.chest_text.length > 0;
  return <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      <div className="md:col-span-2">
        <Label htmlFor="playerNumber">Số áo</Label>
        <Input id="playerNumber" type="text" value={newPlayer.number} onChange={e => onInputChange("number", e.target.value)} placeholder="Số áo" />
      </div>
      
      <div className="md:col-span-2">
        <Label htmlFor="line1">Tên trên số</Label>
        <Input id="line1" value={newPlayer.line_1 || ""} onChange={e => onInputChange("line_1", e.target.value)} placeholder="Tên trên số lưng" />
      </div>
      
      <div className="md:col-span-2">
        <Label htmlFor="line3">Tên đội bóng</Label>
        <Input id="line3" value={newPlayer.line_3 || ""} onChange={e => onInputChange("line_3", e.target.value)} placeholder="Tên đội bóng" />
      </div>

      <div>
        <Label htmlFor="playerSize">Size</Label>
        <Select value={newPlayer.size} onValueChange={value => onInputChange("size", value)}>
          <SelectTrigger id="playerSize">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <Label className="px-2 text-xs font-semibold">Người lớn</Label>
              {SIZES.adult.map(size => <SelectItem key={size} value={size}>{size}</SelectItem>)}
            </SelectGroup>
            <div className="h-px my-2 bg-muted" />
            <SelectGroup>
              <Label className="px-2 text-xs font-semibold">Trẻ em</Label>
              {SIZES.kids.map(size => <SelectItem key={size} value={size}>{size}</SelectItem>)}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="uniformType">Loại quần áo</Label>
        <Select value={newPlayer.uniform_type || "player"} onValueChange={value => onInputChange("uniform_type", value as 'player' | 'goalkeeper')}>
          <SelectTrigger id="uniformType">
            <SelectValue placeholder="Loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="player">Cầu thủ</SelectItem>
            <SelectItem value="goalkeeper">Thủ môn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="printStyle">Kiểu in</Label>
        <Select value={newPlayer.print_style} onValueChange={value => onInputChange("print_style", value)}>
          <SelectTrigger id="printStyle">
            <SelectValue placeholder="Chọn kiểu in" />
          </SelectTrigger>
          <SelectContent>
            {printStyleOptions.map(style => <SelectItem key={style} value={style}>{style}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-4 space-y-4">
        <div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="chestText">In chữ ngực</Label>
              <Input id="chestText" placeholder="Nhập chữ in ngực" value={newPlayer.chest_text || ""} onChange={e => onInputChange("chest_text", e.target.value)} />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="chestNumber" disabled={hasChestText} checked={!hasChestText && (newPlayer.chest_number || false)} onCheckedChange={checked => onInputChange("chest_number", checked === true)} />
                <Label htmlFor="chestNumber" className={hasChestText ? "text-muted-foreground" : ""}>
                  In số ngực
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="pantsNumber" checked={newPlayer.pants_number || false} onCheckedChange={checked => onInputChange("pants_number", checked === true)} />
                <Label htmlFor="pantsNumber">
                  In số quần
                </Label>
              </div>
            </div>
            {hasChestText && <p className="text-sm text-destructive">
                Vui lòng xóa nội dung trong ô "In chữ ngực" để có thể chọn in số ngực.
              </p>}
          </div>
        </div>

        <div>
          <Label className="mb-2 inline-block">Logo áo</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="logoChestLeft" checked={newPlayer.logo_chest_left || false} onCheckedChange={checked => onInputChange("logo_chest_left", checked === true)} />
              <Label htmlFor="logoChestLeft">Logo ngực trái</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="logoChestRight" checked={newPlayer.logo_chest_right || false} onCheckedChange={checked => onInputChange("logo_chest_right", checked === true)} />
              <Label htmlFor="logoChestRight">Logo ngực phải</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="logoChestCenter" checked={newPlayer.logo_chest_center || false} onCheckedChange={checked => onInputChange("logo_chest_center", checked === true)} />
              <Label htmlFor="logoChestCenter">Logo ngực giữa</Label>
            </div>
          </div>
        </div>

        <div>
          <Label className="mb-2 inline-block">Logo tay & quần</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="logoSleeveLeft" checked={newPlayer.logo_sleeve_left || false} onCheckedChange={checked => onInputChange("logo_sleeve_left", checked === true)} />
              <Label htmlFor="logoSleeveLeft">Logo tay trái</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="logoSleeveRight" checked={newPlayer.logo_sleeve_right || false} onCheckedChange={checked => onInputChange("logo_sleeve_right", checked === true)} />
              <Label htmlFor="logoSleeveRight">Logo tay phải</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="logoPants" checked={newPlayer.logo_pants || false} onCheckedChange={checked => onInputChange("logo_pants", checked === true)} />
              <Label htmlFor="logoPants">Logo quần</Label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="md:col-span-3">
        <Label htmlFor="playerNote">Ghi chú</Label>
        <Input id="playerNote" value={newPlayer.note || ""} onChange={e => onInputChange("note", e.target.value)} placeholder="Ghi chú đặc biệt cho cầu thủ" />
      </div>
      
      <div className="md:col-span-2 flex space-x-2">
        {isEditing ? <>
            <Button onClick={onAddOrUpdate} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Cập nhật
            </Button>
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Hủy
            </Button>
          </> : <Button onClick={onAddOrUpdate} className="w-full">
            <Plus className="h-4 w-4 mr-1" /> Thêm cầu thủ
          </Button>}
      </div>
    </div>;
});
PlayerFormFields.displayName = "PlayerFormFields";