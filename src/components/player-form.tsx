
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Player } from "@/types";
import { X, Plus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

interface PlayerFormProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  className?: string;
  uniformQuantity?: number;
}

export function PlayerForm({ players, onPlayersChange, className, uniformQuantity = 0 }: PlayerFormProps) {
  const [newPlayer, setNewPlayer] = useState<Player>({
    name: "",
    number: 0,
    size: "M",
    printImage: true,
  });

  const addPlayer = () => {
    if (newPlayer.number <= 0) {
      toast.error("Vui lòng nhập số áo lớn hơn 0");
      return;
    }
    
    // Check if we've reached the uniform quantity limit
    if (uniformQuantity > 0 && players.length >= uniformQuantity) {
      toast.error(`Số lượng cầu thủ không được vượt quá số lượng quần áo (${uniformQuantity})`);
      return;
    }
    
    // Check if number is already used
    if (players.some(p => p.number === newPlayer.number)) {
      toast.error(`Số áo ${newPlayer.number} đã được sử dụng`);
      return;
    }
    
    const updatedPlayers = [...players, { ...newPlayer, id: `player-${Date.now()}` }];
    onPlayersChange(updatedPlayers);
    setNewPlayer({
      name: "",
      number: 0,
      size: "M",
      printImage: true,
    });
  };

  const removePlayer = (index: number) => {
    const updatedPlayers = [...players];
    updatedPlayers.splice(index, 1);
    onPlayersChange(updatedPlayers);
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real implementation, we would use a library like xlsx to parse Excel files
    // For now, we'll just show a toast message
    toast.info("Excel import functionality will be implemented after Supabase integration");
    
    // Reset file input
    e.target.value = "";
  };

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Danh sách cầu thủ</CardTitle>
        <div className="text-sm text-muted-foreground">
          {uniformQuantity > 0 ? `${players.length}/${uniformQuantity}` : `${players.length} cầu thủ`}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Player list table */}
        {players.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">Tên cầu thủ</th>
                  <th className="p-2 text-left">Số áo</th>
                  <th className="p-2 text-left">Kích thước</th>
                  <th className="p-2 text-left">In hình</th>
                  <th className="p-2 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr key={player.id || index} className="border-b border-muted">
                    <td className="p-2">{player.name || "(Không tên)"}</td>
                    <td className="p-2">{player.number}</td>
                    <td className="p-2">{player.size}</td>
                    <td className="p-2">{player.printImage ? "Có" : "Không"}</td>
                    <td className="p-2">
                      <Button variant="ghost" size="icon" onClick={() => removePlayer(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-4 bg-muted/30 rounded-md">
            <p className="text-muted-foreground">Chưa có cầu thủ nào trong danh sách</p>
          </div>
        )}
        
        {/* Add player form */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <Label htmlFor="playerName">Tên cầu thủ</Label>
            <Input 
              id="playerName"
              value={newPlayer.name}
              onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Tên cầu thủ (không bắt buộc)"
            />
          </div>
          
          <div>
            <Label htmlFor="playerNumber">Số áo</Label>
            <Input 
              id="playerNumber"
              type="number"
              value={newPlayer.number || ""}
              onChange={(e) => setNewPlayer(prev => ({ ...prev, number: parseInt(e.target.value) || 0 }))}
              placeholder="Số áo"
              min={1}
            />
          </div>
          
          <div>
            <Label htmlFor="playerSize">Kích thước</Label>
            <Select 
              value={newPlayer.size}
              onValueChange={(value) => setNewPlayer(prev => ({ ...prev, size: value as "S" | "M" | "L" | "XL" }))}
            >
              <SelectTrigger id="playerSize">
                <SelectValue placeholder="Chọn kích thước" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="S">S</SelectItem>
                <SelectItem value="M">M</SelectItem>
                <SelectItem value="L">L</SelectItem>
                <SelectItem value="XL">XL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="printImage"
              checked={newPlayer.printImage}
              onCheckedChange={(checked) => 
                setNewPlayer(prev => ({ ...prev, printImage: checked === true }))
              }
            />
            <Label htmlFor="printImage">In hình</Label>
          </div>
          
          <Button onClick={addPlayer} disabled={uniformQuantity > 0 && players.length >= uniformQuantity}>
            <Plus className="h-4 w-4 mr-1" /> Thêm cầu thủ
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/30 p-4 rounded-md">
        <div className="w-full">
          <p className="text-sm font-medium mb-2">Hoặc nhập danh sách cầu thủ từ Excel:</p>
          <div className="flex items-center gap-2">
            <Input 
              type="file" 
              accept=".xlsx,.xls" 
              onChange={handleExcelUpload}
              className="flex-1"
            />
            <Button variant="outline" size="icon">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Format: TÊN CẦU THỦ, SỐ ÁO, KÍCH THƯỚC, IN HÌNH (YES/NO), IN DÒNG 1, IN DÒNG 2, IN DÒNG 3,
            IN CHỮ NGỰC, IN SỐ NGỰC, IN SỐ QUẦN, LOGO NGỰC TRÁI, LOGO NGỰC PHẢI, LOGO NGỰC GIỮA, LOGO TAY TRÁI,
            LOGO TAY PHẢI, IN PET NGỰC, LOGO QUẦN, FONT CHỮ, FONT SỐ
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
