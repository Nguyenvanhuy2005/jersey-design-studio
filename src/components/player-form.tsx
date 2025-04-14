
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Player, Logo, UniformSize } from "@/types";
import { X, Plus, Upload, Download, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { formatNumberWithCommas } from "@/utils/format-utils";

interface PlayerFormProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  className?: string;
  fontSize?: string;
  fontNumber?: string;
  printStyleOptions: string[];
  printStyle: string;
  printColorOptions: string[];
  printColor: string;
  logos?: Logo[];
}

// Size configuration
const SIZES = {
  adult: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'] as const,
  kids: ['1', '3', '5', '7', '9', '11', '13', '15'] as const
};

interface ExtendedPlayer extends Player {
  uniform_type?: 'player' | 'goalkeeper';
  line_1?: string;
  line_2?: string;
  line_3?: string;
  chest_text?: string;
  chest_number?: boolean;
  pants_number?: boolean;
  logo_chest_left?: boolean;
  logo_chest_right?: boolean;
  logo_chest_center?: boolean;
  logo_sleeve_left?: boolean;
  logo_sleeve_right?: boolean;
  logo_pants?: boolean;
  pet_chest?: string;
  note?: string;
  print_style?: string;
}

export function PlayerForm({ 
  players, 
  onPlayersChange, 
  className, 
  fontSize = "Arial", 
  fontNumber = "Arial",
  printStyleOptions,
  printStyle,
  printColorOptions,
  printColor,
  logos
}: PlayerFormProps) {
  const [newPlayer, setNewPlayer] = useState<ExtendedPlayer>({
    name: "",
    number: "",
    size: "M",
    printImage: true,
    uniform_type: "player",
    line_1: "",
    line_3: "",
    chest_number: false,
    pants_number: false,
    logo_chest_left: false,
    logo_chest_right: false,
    logo_chest_center: false,
    logo_sleeve_left: false,
    logo_sleeve_right: false,
    logo_pants: false,
    print_style: printStyle
  });
  
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingPlayerIndex, setEditingPlayerIndex] = useState<number | null>(null);

  const addOrUpdatePlayer = () => {
    if (!newPlayer.number || newPlayer.number === "0") {
      toast.error("Vui lòng nhập số áo hợp lệ");
      return;
    }
    
    const updatedPlayers = [...players];
    
    if (isEditing && editingPlayerIndex !== null) {
      // Check if number is used by another player (excluding the one being edited)
      const isDuplicateNumber = players.some((p, idx) => 
        idx !== editingPlayerIndex && p.number === newPlayer.number
      );
      
      if (isDuplicateNumber) {
        toast.error(`Số áo ${newPlayer.number} đã được sử dụng bởi cầu thủ khác`);
        return;
      }
      
      // Update existing player
      updatedPlayers[editingPlayerIndex] = { 
        ...newPlayer, 
        id: players[editingPlayerIndex].id 
      };
      
      onPlayersChange(updatedPlayers);
      toast.success("Cập nhật thông tin cầu thủ thành công");
      
      // Reset edit state
      setIsEditing(false);
      setEditingPlayerIndex(null);
    } else {
      // Add new player
      // Check if number is already used
      if (players.some(p => p.number === newPlayer.number)) {
        toast.error(`Số áo ${newPlayer.number} đã được sử dụng`);
        return;
      }
      
      updatedPlayers.push({ ...newPlayer, id: `player-${Date.now()}` });
      onPlayersChange(updatedPlayers);
      toast.success("Thêm cầu thủ thành công");
    }
    
    // Reset form
    setNewPlayer({
      name: "",
      number: "",
      size: "M",
      printImage: true,
      uniform_type: "player",
      line_1: "",
      line_3: "",
      chest_number: false,
      pants_number: false,
      logo_chest_left: false,
      logo_chest_right: false,
      logo_chest_center: false,
      logo_sleeve_left: false,
      logo_sleeve_right: false,
      logo_pants: false,
      print_style: printStyle
    });
  };

  const removePlayer = (index: number) => {
    const updatedPlayers = [...players];
    updatedPlayers.splice(index, 1);
    onPlayersChange(updatedPlayers);
    
    // If removing the player that's currently being edited, reset editing state
    if (isEditing && editingPlayerIndex === index) {
      setIsEditing(false);
      setEditingPlayerIndex(null);
      
      // Reset form
      setNewPlayer({
        name: "",
        number: "",
        size: "M",
        printImage: true,
        uniform_type: "player",
        line_1: "",
        line_3: "",
        chest_number: false,
        pants_number: false,
        logo_chest_left: false,
        logo_chest_right: false,
        logo_chest_center: false,
        logo_sleeve_left: false,
        logo_sleeve_right: false,
        logo_pants: false,
        print_style: printStyle
      });
    }
  };
  
  const editPlayer = (index: number) => {
    const playerToEdit = players[index] as ExtendedPlayer;
    setNewPlayer({
      ...playerToEdit,
      line_1: playerToEdit.line_1 || playerToEdit.name || "",
      line_3: playerToEdit.line_3 || "",
    });
    setIsEditing(true);
    setEditingPlayerIndex(index);
  };
  
  const cancelEdit = () => {
    setIsEditing(false);
    setEditingPlayerIndex(null);
    
    // Reset form
    setNewPlayer({
      name: "",
      number: "",
      size: "M",
      printImage: true,
      uniform_type: "player",
      line_1: "",
      line_3: "",
      chest_number: false,
      pants_number: false,
      logo_chest_left: false,
      logo_chest_right: false,
      logo_chest_center: false,
      logo_sleeve_left: false,
      logo_sleeve_right: false,
      logo_pants: false,
      print_style: printStyle
    });
  };

  const downloadExcelTemplate = () => {
    const template = [
      {
        "STT": 1,
        "TÊN IN TRÊN SỐ": "Tên trên số",
        "SỐ": "01",
        "TÊN IN DƯỚI SỐ": "Tên đội",
        "SIZE": "M",
        "KIỂU IN": "decal",
        "GHI CHÚ": "",
        "LOẠI QUẦN ÁO": "player",
        "IN CHỮ NGỰC": "",
        "IN SỐ NGỰC": false,
        "IN SỐ QUẦN": false,
        "LOGO NGỰC TRÁI": false,
        "LOGO NGỰC PHẢI": false,
        "LOGO NGỰC GIỮA": false,
        "LOGO TAY TRÁI": false,
        "LOGO TAY PHẢI": false,
        "LOGO QUẦN": false
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    
    XLSX.writeFile(wb, "danh_sach_cau_thu_template.xlsx");
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert the worksheet to JSON
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
        
        // Map Excel data to player objects
        const newPlayers: ExtendedPlayer[] = jsonData.map((row, index) => {
          // Get the player number as a string to preserve leading zeros
          let playerNumber = row["SỐ"] !== undefined ? String(row["SỐ"]) : 
                             row["SỐ ÁO"] !== undefined ? String(row["SỐ ÁO"]) : "";
          
          // Convert the fields to match our Player type
          return {
            id: `player-${Date.now()}-${index}`,
            name: row["TÊN CẦU THỦ"] || "",
            number: playerNumber,
            size: row["KÍCH THƯỚC"] || "M",
            printImage: row["IN HÌNH"] === "YES" || row["IN HÌNH"] === true,
            uniform_type: (row["LOẠI QUẦN ÁO"]?.toLowerCase() === "thủ môn" || 
                          row["LOẠI QUẦN ÁO"]?.toLowerCase() === "thu mon") ? 
                          "goalkeeper" : "player",
            line_1: row["TÊN IN TRÊN SỐ"] || "",
            line_2: playerNumber || "",
            line_3: row["TÊN IN DƯỚI SỐ"] || "",
            chest_text: row["IN CHỮ NGỰC"] || "",
            chest_number: row["IN SỐ NGỰC"] === "YES" || row["IN SỐ NGỰC"] === true,
            pants_number: row["IN SỐ QUẦN"] === "YES" || row["IN SỐ QUẦN"] === true,
            logo_chest_left: row["LOGO NGỰC TRÁI"] === "YES" || row["LOGO NGỰC TRÁI"] === true,
            logo_chest_right: row["LOGO NGỰC PHẢI"] === "YES" || row["LOGO NGỰC PHẢI"] === true,
            logo_chest_center: row["LOGO NGỰC GIỮA"] === "YES" || row["LOGO NGỰC GIỮA"] === true,
            logo_sleeve_left: row["LOGO TAY TRÁI"] === "YES" || row["LOGO TAY TRÁI"] === true,
            logo_sleeve_right: row["LOGO TAY PHẢI"] === "YES" || row["LOGO TAY PHẢI"] === true,
            pet_chest: row["IN PET NGỰC"] || "",
            logo_pants: row["LOGO QUẦN"] === "YES" || row["LOGO QUẦN"] === true,
            note: row["GHI CHÚ"] || "",
            print_style: row["KIỂU IN"] || printStyle
          };
        });
        
        // Filter out invalid players (e.g., those without numbers)
        const validPlayers = newPlayers.filter(p => p.number && p.number !== "");
        
        if (validPlayers.length === 0) {
          toast.error("Không tìm thấy dữ liệu cầu thủ hợp lệ trong file Excel");
          return;
        }
        
        // Check for duplicate numbers
        const numbers = validPlayers.map(p => p.number);
        const duplicateNumbers = numbers.filter((num, idx) => numbers.indexOf(num) !== idx);
        
        if (duplicateNumbers.length > 0) {
          toast.warning(`Các số áo ${duplicateNumbers.join(', ')} bị trùng lặp trong file. Vui lòng kiểm tra lại.`);
        }
        
        // Add the players from the Excel file
        const updatedPlayers = [...players, ...validPlayers];
        onPlayersChange(updatedPlayers);
        
        toast.success(`Đã nhập ${validPlayers.length} cầu thủ từ file Excel`);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        toast.error("Có lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.");
      }
    };
    
    reader.readAsArrayBuffer(file);
    
    // Reset file input
    e.target.value = "";
  };

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Danh sách cầu thủ</CardTitle>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {players.length > 0 ? `${players.length} cầu thủ` : "Chưa có cầu thủ"}
          </div>
          {players.length > 0 && (
            <div className="flex items-center gap-2">
              <Select
                value={printStyle}
                onValueChange={(value) => {
                  const updatedPlayers = players.map(player => ({
                    ...player,
                    print_style: value
                  }));
                  onPlayersChange(updatedPlayers);
                  toast.success("Đã cập nhật kiểu in cho tất cả cầu thủ");
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn kiểu in" />
                </SelectTrigger>
                <SelectContent>
                  {printStyleOptions.map(style => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {players.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">Số</th>
                  <th className="p-2 text-left">Tên trên số</th>
                  <th className="p-2 text-left">Tên dưới số</th>
                  <th className="p-2 text-left">Size</th>
                  <th className="p-2 text-left">Loại</th>
                  <th className="p-2 text-left">Kiểu in</th>
                  <th className="p-2 text-center">Số ngực</th>
                  <th className="p-2 text-center">Số quần</th>
                  <th className="p-2 text-center">Logo ngực</th>
                  <th className="p-2 text-center">Logo tay</th>
                  <th className="p-2 text-left">Ghi chú</th>
                  <th className="p-2 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => {
                  const extendedPlayer = player as ExtendedPlayer;
                  return (
                    <tr key={player.id || index} className={`border-b border-muted ${editingPlayerIndex === index ? 'bg-blue-50' : ''}`}>
                      <td className="p-2">{player.number}</td>
                      <td className="p-2">{extendedPlayer.line_1 || "-"}</td>
                      <td className="p-2">{extendedPlayer.line_3 || "-"}</td>
                      <td className="p-2">{player.size}</td>
                      <td className="p-2">{extendedPlayer.uniform_type === 'goalkeeper' ? 'Thủ môn' : 'Cầu thủ'}</td>
                      <td className="p-2">
                        <Select
                          value={player.print_style}
                          onValueChange={(value) => {
                            const updatedPlayers = [...players];
                            updatedPlayers[index] = {
                              ...player,
                              print_style: value
                            };
                            onPlayersChange(updatedPlayers);
                          }}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Chọn kiểu in" />
                          </SelectTrigger>
                          <SelectContent>
                            {printStyleOptions.map(style => (
                              <SelectItem key={style} value={style}>{style}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2 text-center">{extendedPlayer.chest_number ? '✓' : '-'}</td>
                      <td className="p-2 text-center">{extendedPlayer.pants_number ? '✓' : '-'}</td>
                      <td className="p-2 text-center">
                        {(extendedPlayer.logo_chest_left || extendedPlayer.logo_chest_right || extendedPlayer.logo_chest_center) ? '✓' : '-'}
                      </td>
                      <td className="p-2 text-center">
                        {(extendedPlayer.logo_sleeve_left || extendedPlayer.logo_sleeve_right) ? '✓' : '-'}
                      </td>
                      <td className="p-2">{extendedPlayer.note || "-"}</td>
                      <td className="p-2">
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => editPlayer(index)}
                            title="Sửa thông tin cầu thủ"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removePlayer(index)}
                            title="Xóa cầu thủ"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-4 bg-muted/30 rounded-md">
            <p className="text-muted-foreground">Chưa có cầu thủ nào trong danh sách</p>
          </div>
        )}
        
        {/* Add player form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-4 items-end">
          <div>
            <Label htmlFor="playerNumber">Số áo</Label>
            <Input 
              id="playerNumber"
              type="text"
              value={newPlayer.number || ""}
              onChange={(e) => setNewPlayer(prev => ({ ...prev, number: e.target.value }))}
              placeholder="Số áo"
            />
          </div>
          
          <div>
            <Label htmlFor="line1">Tên trên số</Label>
            <Input 
              id="line1"
              value={newPlayer.line_1 || ""}
              onChange={(e) => setNewPlayer(prev => ({ ...prev, line_1: e.target.value }))}
              placeholder="Tên trên số lưng"
            />
          </div>
          
          <div>
            <Label htmlFor="line3">Tên dưới số</Label>
            <Input 
              id="line3"
              value={newPlayer.line_3 || ""}
              onChange={(e) => setNewPlayer(prev => ({ ...prev, line_3: e.target.value }))}
              placeholder="Tên đội bóng"
            />
          </div>

          <div>
            <Label htmlFor="playerSize">Kích thước</Label>
            <Select 
              value={newPlayer.size}
              onValueChange={(value) => setNewPlayer(prev => ({ ...prev, size: value as UniformSize }))}
            >
              <SelectTrigger id="playerSize">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Người lớn</SelectLabel>
                  {SIZES.adult.map((size) => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Trẻ em</SelectLabel>
                  {SIZES.kids.map((size) => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="uniformType">Loại quần áo</Label>
            <Select 
              value={newPlayer.uniform_type || "player"}
              onValueChange={(value) => setNewPlayer(prev => ({ 
                ...prev, 
                uniform_type: value as 'player' | 'goalkeeper' 
              }))}
            >
              <SelectTrigger id="uniformType">
                <SelectValue placeholder="Loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player">Cầu thủ</SelectItem>
                <SelectItem value="goalkeeper">Thủ môn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="printStyle">Kiểu in</Label>
            <Select 
              value={newPlayer.print_style}
              onValueChange={(value) => setNewPlayer(prev => ({ ...prev, print_style: value }))}
            >
              <SelectTrigger id="printStyle">
                <SelectValue placeholder="Chọn kiểu in" />
              </SelectTrigger>
              <SelectContent>
                {printStyleOptions.map(style => (
                  <SelectItem key={style} value={style}>{style}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="chestNumber"
                checked={newPlayer.chest_number || false}
                onCheckedChange={(checked) => 
                  setNewPlayer(prev => ({ ...prev, chest_number: checked === true }))
                }
              />
              <Label htmlFor="chestNumber">In số ngực</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="pantsNumber"
                checked={newPlayer.pants_number || false}
                onCheckedChange={(checked) => 
                  setNewPlayer(prev => ({ ...prev, pants_number: checked === true }))
                }
              />
              <Label htmlFor="pantsNumber">In số quần</Label>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-1 md:col-span-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="logoChestLeft"
                checked={newPlayer.logo_chest_left || false}
                onCheckedChange={(checked) => 
                  setNewPlayer(prev => ({ ...prev, logo_chest_left: checked === true }))
                }
              />
              <Label htmlFor="logoChestLeft" className="text-xs">Logo ngực trái</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="logoChestRight"
                checked={newPlayer.logo_chest_right || false}
                onCheckedChange={(checked) => 
                  setNewPlayer(prev => ({ ...prev, logo_chest_right: checked === true }))
                }
              />
              <Label htmlFor="logoChestRight" className="text-xs">Logo ngực phải</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="logoChestCenter"
                checked={newPlayer.logo_chest_center || false}
                onCheckedChange={(checked) => 
                  setNewPlayer(prev => ({ ...prev, logo_chest_center: checked === true }))
                }
              />
              <Label htmlFor="logoChestCenter" className="text-xs">Logo ngực giữa</Label>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-1 md:col-span-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="logoSleeveLeft"
                checked={newPlayer.logo_sleeve_left || false}
                onCheckedChange={(checked) => 
                  setNewPlayer(prev => ({ ...prev, logo_sleeve_left: checked === true }))
                }
              />
              <Label htmlFor="logoSleeveLeft" className="text-xs">Logo tay trái</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="logoSleeveRight"
                checked={newPlayer.logo_sleeve_right || false}
                onCheckedChange={(checked) => 
                  setNewPlayer(prev => ({ ...prev, logo_sleeve_right: checked === true }))
                }
              />
              <Label htmlFor="logoSleeveRight" className="text-xs">Logo tay phải</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="logoPants"
                checked={newPlayer.logo_pants || false}
                onCheckedChange={(checked) => 
                  setNewPlayer(prev => ({ ...prev, logo_pants: checked === true }))
                }
              />
              <Label htmlFor="logoPants" className="text-xs">Logo quần</Label>
            </div>
          </div>
          
          <div>
            <Label htmlFor="printStyle">Kiểu in</Label>
            <Select 
              value={newPlayer.print_style}
              onValueChange={(value) => setNewPlayer(prev => ({ ...prev, print_style: value }))}
            >
              <SelectTrigger id="printStyle">
                <SelectValue placeholder="Chọn kiểu in" />
              </SelectTrigger>
              <SelectContent>
                {printStyleOptions.map(style => (
                  <SelectItem key={style} value={style}>{style}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-6">
            <Label htmlFor="playerNote">Ghi chú</Label>
            <Input 
              id="playerNote"
              value={newPlayer.note || ""}
              onChange={(e) => setNewPlayer(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Ghi chú đặc biệt cho cầu thủ"
            />
          </div>
          
          <div className="md:col-span-2 flex space-x-2">
            {isEditing ? (
              <>
                <Button onClick={addOrUpdatePlayer} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Cập nhật cầu thủ
                </Button>
                <Button variant="outline" onClick={cancelEdit} className="flex-1">
                  Hủy
                </Button>
              </>
            ) : (
              <Button onClick={addOrUpdatePlayer} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Thêm cầu thủ
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/30 p-4 rounded-md">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-2">Nhập danh sách cầu thủ từ Excel:</p>
            <div className="flex items-center gap-2">
              <Input 
                type="file" 
                accept=".xlsx,.xls" 
                onChange={handleExcelUpload}
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={downloadExcelTemplate}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            <p className="mb-1">Format file Excel bao gồm các cột:</p>
            <p>STT, TÊN IN TRÊN SỐ, SỐ, TÊN IN DƯỚI SỐ, SIZE, GHI CHÚ, LOẠI QUẦN ÁO (CẦU THỦ/THỦ MÔN), 
              IN SỐ NGỰC (YES/NO), IN SỐ QUẦN (YES/NO), LOGO NGỰC TRÁI (YES/NO), LOGO NGỰC PHẢI (YES/NO), 
              LOGO NGỰC GIỮA (YES/NO), LOGO TAY TRÁI (YES/NO), LOGO TAY PHẢI (YES/NO), LOGO QUẦN (YES/NO), KIỂU IN</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
