
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Player, Logo } from "@/types";
import { ADULT_SIZES, KID_SIZES, PRINT_TYPES } from "@/config/sizes";
import { PlusCircle, Trash2 } from "lucide-react";

interface PlayerFormProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  logos: Logo[];
  printStyle: string;
  printStyleOptions: string[];
  fontSize: string;
  fontNumber: string;
}

export function PlayerForm({
  players,
  onPlayersChange,
  logos,
  printStyle,
  printStyleOptions,
  fontSize,
  fontNumber
}: PlayerFormProps) {
  const [sizeCategory, setSizeCategory] = useState<'adult' | 'kid'>('adult');

  const addPlayer = () => {
    const newPlayer: Player = {
      id: `temp-${Date.now()}`,
      name: "",
      number: "",
      size: sizeCategory === 'adult' ? 'L' : '7',
      printImage: false,
      line_1: "",
      line_2: "",
      line_3: "",
      chest_text: "",
      chest_number: true,
      pants_number: true,
      logo_chest_left: true,
      logo_chest_right: true,
      logo_chest_center: true,
      logo_sleeve_left: true,
      logo_sleeve_right: true,
      logo_pants: true,
      note: ""
    };
    onPlayersChange([...players, newPlayer]);
  };

  const updatePlayer = (index: number, field: keyof Player, value: any) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = {
      ...updatedPlayers[index],
      [field]: value
    };
    onPlayersChange(updatedPlayers);
  };

  const removePlayer = (index: number) => {
    const updatedPlayers = players.filter((_, i) => i !== index);
    onPlayersChange(updatedPlayers);
  };

  return (
    <div className="space-y-4">
      {players.map((player, index) => (
        <Card key={player.id || index} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label>Tên cầu thủ</Label>
              <Input
                value={player.name}
                onChange={(e) => updatePlayer(index, "name", e.target.value)}
                placeholder="Nhập tên cầu thủ"
              />
            </div>

            <div>
              <Label>Số áo</Label>
              <Input
                type="number"
                value={player.number}
                onChange={(e) => updatePlayer(index, "number", e.target.value)}
                placeholder="Nhập số áo"
              />
            </div>

            <div className="space-y-2">
              <Label>Loại size</Label>
              <Select
                value={player.size.toString().match(/^\d+$/) ? 'kid' : 'adult'}
                onValueChange={(value) => {
                  setSizeCategory(value as 'adult' | 'kid');
                  updatePlayer(index, "size", value === 'adult' ? 'L' : '7');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adult">Size người lớn</SelectItem>
                  <SelectItem value="kid">Size trẻ em</SelectItem>
                </SelectContent>
              </Select>

              <Label>Kích cỡ</Label>
              <Select
                value={player.size}
                onValueChange={(value) => updatePlayer(index, "size", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kích cỡ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {player.size.toString().match(/^\d+$/) ? (
                      KID_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          Size {size}
                        </SelectItem>
                      ))
                    ) : (
                      ADULT_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          Size {size}
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Kiểu in</Label>
              <Select
                value={printStyle}
                onValueChange={(value) => updatePlayer(index, "printStyle", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kiểu in" />
                </SelectTrigger>
                <SelectContent>
                  {PRINT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="destructive"
                size="icon"
                onClick={() => removePlayer(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <Button onClick={addPlayer} variant="outline" className="w-full">
        <PlusCircle className="h-4 w-4 mr-2" />
        Thêm cầu thủ
      </Button>
    </div>
  );
}
