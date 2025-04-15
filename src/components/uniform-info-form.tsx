
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DesignData } from "@/types";

interface UniformInfoFormProps {
  teamName: string;
  onTeamNameChange: (name: string) => void;
  uniformType: "player" | "goalkeeper";
  onUniformTypeChange: (type: "player" | "goalkeeper") => void;
  designData: Partial<DesignData>;
  onDesignDataChange: (data: Partial<DesignData>) => void;
}

export function UniformInfoForm({
  teamName,
  onTeamNameChange,
  uniformType,
  onUniformTypeChange,
  designData,
  onDesignDataChange
}: UniformInfoFormProps) {
  const [playerCount, setPlayerCount] = useState<number>(designData.quantity || 0);
  
  useEffect(() => {
    // Update design data when player count changes
    const updatedData = {
      ...designData,
      uniform_type: uniformType,
      quantity: playerCount // This is now a valid property
    };
    onDesignDataChange(updatedData);
  }, [uniformType, playerCount, onDesignDataChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin chung</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="teamName">Tên đội bóng</Label>
          <Input
            id="teamName"
            value={teamName}
            onChange={(e) => onTeamNameChange(e.target.value)}
            placeholder="Nhập tên đội bóng"
          />
        </div>
        <div>
          <Label htmlFor="playerCount">Số lượng cầu thủ</Label>
          <Input
            id="playerCount"
            type="number"
            value={playerCount}
            onChange={(e) => setPlayerCount(Number(e.target.value))}
            placeholder="Nhập số lượng cầu thủ"
          />
        </div>
        <div>
          <Label htmlFor="uniformType">Loại quần áo</Label>
          <Select value={uniformType} onValueChange={onUniformTypeChange}>
            <SelectTrigger id="uniformType">
              <SelectValue placeholder="Chọn loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="player">Cầu thủ</SelectItem>
              <SelectItem value="goalkeeper">Thủ môn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
