import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Player, Logo } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { PlayerCard } from "./player-card";
import { Download } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import PlayerFormFields from "./player-form/PlayerFormFields";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { UniformSize } from "@/types";

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

export function PlayerForm({
  players,
  onPlayersChange,
  className,
  printStyleOptions,
  printStyle,
}: PlayerFormProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingPlayerIndex, setEditingPlayerIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();
  
  const emptyPlayer: Player = {
    id: `temp-${Date.now()}`,
    name: "",
    number: "",
    size: "M",
    printImage: true,
    uniform_type: "player",
    print_style: printStyle
  };
  
  const [currentPlayer, setCurrentPlayer] = useState<Player>(emptyPlayer);

  const handlePlayerChange = (updates: Partial<Player>) => {
    setCurrentPlayer(prev => ({ ...prev, ...updates }));
  };

  const addOrUpdatePlayer = () => {
    if (!currentPlayer.number || currentPlayer.number === "0") {
      toast.error("Vui lòng nhập số áo hợp lệ");
      return;
    }

    const updatedPlayers = [...players];
    if (isEditing && editingPlayerIndex !== null) {
      updatedPlayers[editingPlayerIndex] = {
        ...currentPlayer,
        id: players[editingPlayerIndex].id
      };
      onPlayersChange(updatedPlayers);
      toast.success("Cập nhật thông tin cầu thủ thành công");
      setIsEditing(false);
      setEditingPlayerIndex(null);
    } else {
      updatedPlayers.push({
        ...currentPlayer,
        id: `player-${Date.now()}`
      });
      onPlayersChange(updatedPlayers);
      toast.success("Thêm cầu thủ thành công");
    }

    setCurrentPlayer(emptyPlayer);
    if (isMobile) {
      setIsFormOpen(false);
    }
  };

  const removePlayer = (index: number) => {
    const updatedPlayers = [...players];
    updatedPlayers.splice(index, 1);
    onPlayersChange(updatedPlayers);
    if (isEditing && editingPlayerIndex === index) {
      cancelEdit();
    }
  };

  const editPlayer = (index: number) => {
    const playerToEdit = players[index];
    setCurrentPlayer(playerToEdit);
    setIsEditing(true);
    setEditingPlayerIndex(index);
    if (isMobile) {
      setIsFormOpen(true);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingPlayerIndex(null);
    setCurrentPlayer(emptyPlayer);
    if (isMobile) {
      setIsFormOpen(false);
    }
  };

  const downloadExcelTemplate = () => {
    const template = [{
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
    }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "danh_sach_cau_thu_template.xlsx");
  };
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, {
          type: 'array'
        });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
        const newPlayers: Player[] = jsonData.map((row, index) => {
          let playerNumber = row["SỐ"] !== undefined ? String(row["SỐ"]) : row["SỐ ÁO"] !== undefined ? String(row["SỐ ÁO"]) : "";
          return {
            id: `player-${Date.now()}-${index}`,
            name: row["TÊN CẦU THỦ"] || "",
            number: playerNumber,
            size: row["KÍCH THƯỚC"] || "M",
            printImage: row["IN HÌNH"] === "YES" || row["IN HÌNH"] === true,
            uniform_type: row["LOẠI QUẦN ÁO"]?.toLowerCase() === "thủ môn" || row["LOẠI QUẦN ÁO"]?.toLowerCase() === "thu mon" ? "goalkeeper" : "player",
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

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Danh sách cầu thủ ({players.length})</CardTitle>
          {isMobile && (
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Thêm cầu thủ
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
                onEdit={() => editPlayer(index)}
                onRemove={() => removePlayer(index)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-4 bg-muted/30 rounded-md">
            <p className="text-muted-foreground">Chưa có cầu thủ nào trong danh sách</p>
          </div>
        )}
        
        {!isMobile && (
          <PlayerFormFields
            player={currentPlayer}
            onPlayerChange={handlePlayerChange}
            onSubmit={addOrUpdatePlayer}
            onCancel={cancelEdit}
            isEditing={isEditing}
            printStyleOptions={printStyleOptions}
          />
        )}
      </CardContent>
      
      <CardFooter className="bg-muted/30 p-4 rounded-md">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-2">Nhập danh sách cầu thủ từ Excel:</p>
            <div className="flex items-center gap-2">
              <Input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} className="flex-1" />
              <Button variant="outline" size="icon" onClick={downloadExcelTemplate}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            
            
          </div>
        </div>
      </CardFooter>

      {isMobile && (
        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader>
              <SheetTitle>
                {isEditing ? 'Sửa thông tin cầu thủ' : 'Thêm cầu thủ mới'}
              </SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto h-full pb-20">
              <PlayerFormFields
                player={currentPlayer}
                onPlayerChange={handlePlayerChange}
                onSubmit={addOrUpdatePlayer}
                onCancel={cancelEdit}
                isEditing={isEditing}
                printStyleOptions={printStyleOptions}
                isMobile={true}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </Card>
  );
}
