
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Player } from "@/types";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerFormProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  className?: string;
}

export function PlayerForm({ players, onPlayersChange, className }: PlayerFormProps) {
  const [newPlayer, setNewPlayer] = useState<Player>({
    name: "",
    number: 0,
    size: "M",
    printImage: true,
  });

  const addPlayer = () => {
    if (newPlayer.number <= 0) {
      alert("Vui lòng nhập số áo lớn hơn 0");
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
    alert("Excel import functionality will be implemented after Supabase integration");
    
    // Reset file input
    e.target.value = "";
  };

  return (
    <div className={cn("space-y-4", className)}>
      <h2 className="text-xl font-semibold">Danh sách cầu thủ</h2>
      
      {/* Player list table */}
      {players.length > 0 && (
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
        
        <Button onClick={addPlayer}>Thêm cầu thủ</Button>
      </div>
      
      {/* Excel upload */}
      <div className="bg-muted p-4 rounded-md">
        <p className="text-sm mb-2">Hoặc nhập danh sách cầu thủ từ Excel:</p>
        <Input 
          type="file" 
          accept=".xlsx,.xls" 
          onChange={handleExcelUpload}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Format: Tên cầu thủ (không bắt buộc), Số áo, Kích thước, In hình (Yes/No)
        </p>
      </div>
    </div>
  );
}
