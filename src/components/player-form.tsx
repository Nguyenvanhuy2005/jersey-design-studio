import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Player, Logo, UniformSize } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { PlayerCard } from "./player-card";
import { Plus, Download } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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
    id: `temp-${Date.now()}`,
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const isMobile = useIsMobile();

  const addOrUpdatePlayer = () => {
    if (!newPlayer.number || newPlayer.number === "0") {
      toast.error("Vui lòng nhập số áo hợp lệ");
      return;
    }
    
    const updatedPlayers = [...players];
    
    if (isEditing && editingPlayerIndex !== null) {
      updatedPlayers[editingPlayerIndex] = { 
        ...newPlayer, 
        id: players[editingPlayerIndex].id 
      };
      
      onPlayersChange(updatedPlayers);
      toast.success("Cập nhật thông tin cầu thủ thành công");
      
      setIsEditing(false);
      setEditingPlayerIndex(null);
    } else {
      updatedPlayers.push({ ...newPlayer, id: `player-${Date.now()}` });
      onPlayersChange(updatedPlayers);
      toast.success("Thêm cầu thủ thành công");
    }
    
    setNewPlayer({
      id: `temp-${Date.now()}`,
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
    
    if (isEditing && editingPlayerIndex === index) {
      setIsEditing(false);
      setEditingPlayerIndex(null);
      
      setNewPlayer({
        id: `temp-${Date.now()}`,
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
    
    setNewPlayer({
      id: `temp-${Date.now()}`,
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
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
        
        const newPlayers: ExtendedPlayer[] = jsonData.map((row, index) => {
          let playerNumber = row["SỐ"] !== undefined ? String(row["SỐ"]) : 
                             row["SỐ ÁO"] !== undefined ? String(row["SỐ ÁO"]) : "";
          
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
        
        const validPlayers = newPlayers.filter(p => p.number && p.number !== "");
        
        if (validPlayers.length === 0) {
          toast.error("Không tìm thấy dữ liệu cầu thủ hợp lệ trong file Excel");
          return;
        }
        
        const numbers = validPlayers.map(p => p.number);
        const duplicateNumbers = numbers.filter((num, idx) => numbers.indexOf(num) !== idx);
        
        if (duplicateNumbers.length > 0) {
          toast.warning(`Các số áo ${duplicateNumbers.join(', ')} bị trùng lặp trong file. Vui lòng kiểm tra lại.`);
        }
        
        const updatedPlayers = [...players, ...validPlayers];
        onPlayersChange(updatedPlayers);
        
        toast.success(`Đã nhập ${validPlayers.length} cầu thủ từ file Excel`);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        toast.error("Có lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.");
      }
    };
    
    reader.readAsArrayBuffer(file);
    
    e.target.value = "";
  };

  const PlayerFormFields = () => (
    <div className={cn("grid grid-cols-1 md:grid-cols-7 gap-4", isMobile ? "p-4" : "")}>
      <div className="md:col-span-2">
        <Label htmlFor="playerNumber">Số áo</Label>
        <Input 
          id="playerNumber"
          type="text"
          value={newPlayer.number || ""}
          onChange={(e) => setNewPlayer(prev => ({ ...prev, number: e.target.value }))}
          placeholder="Số áo"
        />
      </div>
      
      <div className="md:col-span-2">
        <Label htmlFor="line1">Tên trên số</Label>
        <Input 
          id="line1"
          value={newPlayer.line_1 || ""}
          onChange={(e) => setNewPlayer(prev => ({ ...prev, line_1: e.target.value }))}
          placeholder="Tên trên số lưng"
        />
      </div>
      
      <div className="md:col-span-2">
        <Label htmlFor="line3">Tên dưới số</Label>
        <Input 
          id="line3"
          value={newPlayer.line_3 || ""}
          onChange={(e) => setNewPlayer(prev => ({ ...prev, line_3: e.target.value }))}
          placeholder="Tên đội bóng"
        />
      </div>

      <div>
        <Label htmlFor="playerSize">Size</Label>
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
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-2">
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

      <div className="md:col-span-2">
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

      <div className="md:col-span-4 space-y-4">
        <div>
          <Label className="mb-2 inline-block">In số</Label>
          <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div>
          <Label className="mb-2 inline-block">Logo áo</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="logoChestLeft"
                checked={newPlayer.logo_chest_left || false}
                onCheckedChange={(checked) => 
                  setNewPlayer(prev => ({ ...prev, logo_chest_left: checked === true }))
                }
              />
              <Label htmlFor="logoChestLeft">Logo ngực trái</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="logoChestRight"
                checked={newPlayer.logo_chest_right || false}
                onCheckedChange={(checked) => 
                  setNewPlayer(prev => ({ ...prev, logo_chest_right: checked === true }))
                }
              />
              <Label htmlFor="logoChestRight">Logo ngực phải</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="logoChestCenter"
                checked={newPlayer.logo_chest_center || false}
                onCheckedChange={(checked) => 
                  setNewPlayer(prev => ({ ...prev, logo_chest_center: checked === true }))
                }
              />
              <Label htmlFor="logoChestCenter">Logo ngực giữa</Label>
            </div>
          </div>
        </div>

        <div>
          <Label className="mb-2 inline-block">Logo tay & quần</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="logoSleeveLeft"
                checked={newPlayer.logo_sleeve_left || false}
                onCheckedChange={(checked) => 
                  setNewPlayer(prev => ({ ...prev, logo_sleeve_left: checked === true }))
                }
              />
              <Label htmlFor="logoSleeveLeft">Logo tay trái</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="logoSleeveRight"
                checked={newPlayer.logo_sleeve_right || false}
                onCheckedChange={(checked) => 
                  setNewPlayer(prev => ({ ...prev, logo_sleeve_right: checked === true }))
                }
              />
              <Label htmlFor="logoSleeveRight">Logo tay phải</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="logoPants"
                checked={newPlayer.logo_pants || false}
                onCheckedChange={(checked) => 
                  setNewPlayer(prev => ({ ...prev, logo_pants: checked === true }))
                }
              />
              <Label htmlFor="logoPants">Logo quần</Label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="md:col-span-3">
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
              Cập nhật
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
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Danh sách cầu thủ ({players.length})</CardTitle>
          {isMobile && (
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Thêm cầu thủ
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {players.length > 0 ? (
          <div className="grid gap-4">
            {players.map((player, index) => (
              <PlayerCard
                key={player.id || index}
                player={player}
                onEdit={() => {
                  if (isMobile) {
                    setIsFormOpen(true);
                  }
                  editPlayer(index);
                }}
                onRemove={() => removePlayer(index)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-4 bg-muted/30 rounded-md">
            <p className="text-muted-foreground">Chưa có cầu thủ nào trong danh sách</p>
          </div>
        )}
        
        {!isMobile && <PlayerFormFields />}
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

      {isMobile && (
        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader>
              <SheetTitle>{isEditing ? 'Sửa thông tin cầu thủ' : 'Thêm cầu thủ mới'}</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto h-full pb-20">
              <PlayerFormFields />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </Card>
  );
}
