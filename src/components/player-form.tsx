
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Player } from "@/types";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Size {
  size_id: string;
  size_value: string;
  category: 'adult' | 'children';
}

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
    pantsSize: "M",
    printImage: true,
  });
  const [sizes, setSizes] = useState<Size[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSizes = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('sizes')
          .select('*')
          .order('size_value', { ascending: true });
        
        if (error) {
          console.error("Error fetching sizes:", error);
        } else {
          setSizes(data || []);
        }
      } catch (err) {
        console.error("Unexpected error fetching sizes:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSizes();
  }, []);

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
      pantsSize: "M",
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

  // Separate sizes into adult and children categories
  const adultSizes = sizes.filter(size => size.category === 'adult').map(size => size.size_value);
  const childrenSizes = sizes.filter(size => size.category === 'children').map(size => size.size_value);

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
                <th className="p-2 text-left">Kích thước áo</th>
                <th className="p-2 text-left">Kích thước quần</th>
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
                  <td className="p-2">{player.pantsSize || "-"}</td>
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
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
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
          <Label htmlFor="playerSize">Kích thước áo</Label>
          <Select 
            value={newPlayer.size}
            onValueChange={(value) => setNewPlayer(prev => ({ ...prev, size: value as Player['size'] }))}
          >
            <SelectTrigger id="playerSize">
              <SelectValue placeholder="Chọn kích thước áo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="header-adult" disabled className="font-semibold">
                Người lớn
              </SelectItem>
              {adultSizes.map((size) => (
                <SelectItem key={`adult-${size}`} value={size}>
                  {size}
                </SelectItem>
              ))}
              <SelectItem value="header-children" disabled className="font-semibold mt-2">
                Trẻ em
              </SelectItem>
              {childrenSizes.map((size) => (
                <SelectItem key={`children-${size}`} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="pantSize">Kích thước quần</Label>
          <Select 
            value={newPlayer.pantsSize}
            onValueChange={(value) => setNewPlayer(prev => ({ ...prev, pantsSize: value as Player['size'] }))}
          >
            <SelectTrigger id="pantSize">
              <SelectValue placeholder="Chọn kích thước quần" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="header-adult" disabled className="font-semibold">
                Người lớn
              </SelectItem>
              {adultSizes.map((size) => (
                <SelectItem key={`pants-adult-${size}`} value={size}>
                  {size}
                </SelectItem>
              ))}
              <SelectItem value="header-children" disabled className="font-semibold mt-2">
                Trẻ em
              </SelectItem>
              {childrenSizes.map((size) => (
                <SelectItem key={`pants-children-${size}`} value={size}>
                  {size}
                </SelectItem>
              ))}
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
          Format: Tên cầu thủ (không bắt buộc), Số áo, Kích thước áo, Kích thước quần, In hình (Yes/No)
        </p>
      </div>
    </div>
  );
}
