import React from "react";
import { Player } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlayerFormFieldsProps {
  player: Player;
  onChange: (player: Player) => void;
}

export function PlayerFormFields({ player, onChange }: PlayerFormFieldsProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({
      ...player,
      [name]: value,
    });
  };

  // When handling number input, keep the number as entered without padding
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Pass the number directly without any formatting
    onChange({
      ...player,
      number: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    onChange({
      ...player,
      [name]: value,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Tên cầu thủ</Label>
        <Input id="name" name="name" value={player.name} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="number">Số áo</Label>
        <Input id="number" name="number" value={player.number} onChange={handleNumberChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="size">Kích thước</Label>
        <Select
          value={player.size}
          onValueChange={(value) => handleSelectChange("size", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn kích thước" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="S">S</SelectItem>
            <SelectItem value="M">M</SelectItem>
            <SelectItem value="L">L</SelectItem>
            <SelectItem value="XL">XL</SelectItem>
            <SelectItem value="XXL">XXL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="uniform_type">Loại áo</Label>
        <Select
          value={player.uniform_type}
          onValueChange={(value) => handleSelectChange("uniform_type", value as "player" | "goalkeeper")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn loại áo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="player">Cầu thủ</SelectItem>
            <SelectItem value="goalkeeper">Thủ môn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="note">Ghi chú</Label>
        <Textarea
          id="note"
          name="note"
          value={player.note}
          onChange={handleChange}
          placeholder="Ghi chú thêm (nếu có)"
        />
      </div>
    </div>
  );
}
