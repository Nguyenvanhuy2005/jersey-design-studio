
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Player } from "@/types";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

export interface PlayerFormProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  onNext?: () => void;
  onPrev?: () => void;
  className?: string;
}

export function PlayerForm({ players, onPlayersChange, onNext, onPrev, className }: PlayerFormProps) {
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
    
    // Check for duplicated player number
    const duplicateNumber = players.find(p => p.number === newPlayer.number);
    if (duplicateNumber) {
      toast.error(`Số áo ${newPlayer.number} đã tồn tại. Vui lòng chọn số khác.`);
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

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const binaryStr = evt.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

        // Find header row and determine column indices
        const headerRow = data.find(row => 
          Array.isArray(row) && row.some(cell => 
            typeof cell === 'string' && (cell.includes('TÊN') || cell.includes('SỐ') || cell.includes('KÍCH THƯỚC'))
          )
        );

        if (!headerRow) {
          toast.error("Không tìm thấy dòng tiêu đề trong file Excel. Vui lòng kiểm tra định dạng file.");
          return;
        }

        // Find column indices
        const nameIdx = headerRow.findIndex((col: any) => typeof col === 'string' && col.includes('TÊN'));
        const numberIdx = headerRow.findIndex((col: any) => typeof col === 'string' && col.includes('SỐ'));
        const sizeIdx = headerRow.findIndex((col: any) => typeof col === 'string' && 
          (col.includes('KÍCH THƯỚC') || col.includes('SIZE') || col.includes('CỠ'))
        );

        if (numberIdx === -1 || sizeIdx === -1) {
          toast.error("Thiếu cột số áo hoặc kích thước trong file Excel.");
          return;
        }

        // Process data rows
        const importedPlayers: Player[] = [];
        for (let i = headerRow.length > 0 ? 1 : 0; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;

          const number = parseInt(row[numberIdx], 10);
          const size = String(row[sizeIdx] || 'M').toUpperCase();
          
          // Skip invalid rows
          if (isNaN(number) || number <= 0) continue;

          // Validate size
          const validSizes = ['S', 'M', 'L', 'XL', '1', '2', '3', '4', '5'];
          const normalizedSize = validSizes.includes(size) ? size : 'M';

          const name = nameIdx !== -1 ? String(row[nameIdx] || '') : '';

          // Add player
          importedPlayers.push({
            id: `player-excel-${Date.now()}-${i}`,
            name,
            number,
            size: normalizedSize as any,
            printImage: true
          });
        }

        if (importedPlayers.length === 0) {
          toast.error("Không có dữ liệu cầu thủ hợp lệ trong file Excel.");
          return;
        }

        // Check for duplicate numbers
        const existingNumbers = new Set(players.map(p => p.number));
        const duplicateNumbers: number[] = [];
        const uniqueImportedPlayers = importedPlayers.filter(p => {
          if (existingNumbers.has(p.number)) {
            duplicateNumbers.push(p.number);
            return false;
          }
          existingNumbers.add(p.number);
          return true;
        });

        if (duplicateNumbers.length > 0) {
          toast.warning(`Bỏ qua ${duplicateNumbers.length} cầu thủ có số áo trùng lặp: ${duplicateNumbers.join(', ')}`);
        }

        // Update players list
        onPlayersChange([...players, ...uniqueImportedPlayers]);
        toast.success(`Đã nhập ${uniqueImportedPlayers.length} cầu thủ từ file Excel`);
      } catch (error) {
        console.error("Excel import error:", error);
        toast.error("Lỗi khi xử lý file Excel. Vui lòng kiểm tra định dạng file.");
      }
    };

    reader.readAsBinaryString(file);
    
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
            onValueChange={(value) => setNewPlayer(prev => ({ ...prev, size: value as "S" | "M" | "L" | "XL" | "1" | "2" | "3" | "4" | "5" }))}
          >
            <SelectTrigger id="playerSize">
              <SelectValue placeholder="Chọn kích thước" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="S">S</SelectItem>
              <SelectItem value="M">M</SelectItem>
              <SelectItem value="L">L</SelectItem>
              <SelectItem value="XL">XL</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
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
          Format: Tên cầu thủ (không bắt buộc), Số áo (bắt buộc), Kích thước (bắt buộc)
        </p>
      </div>

      {(onPrev || onNext) && (
        <div className="flex justify-between mt-4">
          {onPrev && (
            <Button variant="outline" onClick={onPrev}>
              Trở lại: Thông tin
            </Button>
          )}
          {onNext && (
            <Button onClick={onNext}>
              Tiếp theo: Logo
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
