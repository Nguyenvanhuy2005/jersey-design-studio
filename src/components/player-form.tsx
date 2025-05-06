import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Player, Logo } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlayerCard } from "./player-card";
import { usePlayerForm } from "@/hooks/usePlayerForm";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { PlayerFormFields } from "./player/PlayerFormFields";
import { BatchUpdateDialog } from "./player/BatchUpdateDialog";
import { ExcelTemplateDownload } from "./excel/ExcelTemplateDownload";

interface PlayerFormProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  logos?: Logo[];
  fontSize?: string;
  fontNumber?: string;
  printStyleOptions: string[];
  printColorOptions?: string[];
  printStyle: string;
  printColor?: string;
  className?: string;
}

export const PlayerForm = memo(({
  players,
  onPlayersChange,
  logos = [],
  fontSize,
  fontNumber,
  printStyleOptions,
  printColorOptions,
  printStyle,
  printColor,
  className
}: PlayerFormProps) => {
  const {
    newPlayer,
    isEditing,
    editingPlayerIndex,
    handleInputChange,
    addOrUpdatePlayer,
    editPlayer,
    removePlayer,
    cancelEdit
  } = usePlayerForm({
    onPlayersChange,
    players,
    printStyle
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const isMobile = useIsMobile();

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
          let playerNumber: string = "";
          if (row["SỐ ÁO"] !== undefined) {
            playerNumber = String(row["SỐ ÁO"]).padStart(2, '0');
          } else if (row["SỐ"] !== undefined) {
            playerNumber = String(row["SỐ"]).padStart(2, '0');
          }

          const convertToBoolean = (value: any): boolean => {
            if (typeof value === 'boolean') return value;
            if (typeof value === 'string') {
              const normalized = value.toLowerCase().trim();
              return normalized === 'có' || normalized === 'yes' || normalized === 'true';
            }
            return false;
          };

          return {
            id: `player-${Date.now()}-${index}`,
            name: row["TÊN CẦU THỦ"] || "",
            number: playerNumber,
            size: row["KÍCH THƯỚC"] || "M",
            printImage: convertToBoolean(row["IN HÌNH"]),
            uniform_type: (row["LOẠI QUẦN ÁO"]?.toLowerCase() === "thủ môn" || 
                         row["LOẠI QUẦN ÁO"]?.toLowerCase() === "thu mon") ? "goalkeeper" : "player",
            line_1: row["TÊN IN TRÊN SỐ"] || "",
            line_2: playerNumber,
            line_3: row["TÊN ĐỘI BÓNG"] || "",
            chest_text: row["IN CHỮ NGỰC"] || "",
            chest_number: convertToBoolean(row["IN SỐ NGỰC"]),
            pants_number: convertToBoolean(row["IN SỐ QUẦN"]),
            logo_chest_left: convertToBoolean(row["LOGO NGỰC TRÁI"]),
            logo_chest_right: convertToBoolean(row["LOGO NGỰC PHẢI"]),
            logo_chest_center: convertToBoolean(row["LOGO NGỰC GIỮA"]),
            logo_sleeve_left: convertToBoolean(row["LOGO TAY TRÁI"]),
            logo_sleeve_right: convertToBoolean(row["LOGO TAY PHẢI"]),
            logo_pants: convertToBoolean(row["LOGO QUẦN"]),
            note: row["GHI CHÚ"] || "",
            print_style: row["KIỂU IN"] || printStyle
          };
        });

        const updatedPlayers = [...players, ...newPlayers];
        onPlayersChange(updatedPlayers);
        toast.success(`Đã nhập ${newPlayers.length} cầu thủ từ file Excel`);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        toast.error("Có lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  return <Card className={className}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle>Danh sách cầu thủ ({players.length})</CardTitle>
          <div className="flex flex-wrap gap-2">
            {players.length > 0 && <Button variant="outline" onClick={() => setIsBatchDialogOpen(true)} className="flex-1 md:flex-none">
                <Edit className="h-4 w-4 mr-1" /> Cập nhật hàng loạt
              </Button>}
            {isMobile && <Button onClick={() => setIsFormOpen(true)} className="flex-1 md:flex-none">
                <Plus className="h-4 w-4 mr-1" /> Thêm cầu thủ
              </Button>}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {players.length > 0 ? <div className="grid gap-3">
            {players.map((player, index) => <PlayerCard key={player.id || index} player={player} onEdit={() => {
          if (isMobile) {
            setIsFormOpen(true);
          }
          editPlayer(index);
        }} onRemove={() => removePlayer(index)} />)}
          </div> : <div className="text-center p-4 bg-muted/30 rounded-md">
            <p className="text-muted-foreground">Chưa có cầu thủ nào trong danh sách</p>
          </div>}
        
        {!isMobile && <PlayerFormFields newPlayer={newPlayer} isEditing={isEditing} printStyleOptions={printStyleOptions} onInputChange={handleInputChange} onAddOrUpdate={addOrUpdatePlayer} onCancel={cancelEdit} />}
      </CardContent>
      
      <CardFooter className="flex flex-col p-4 space-y-4 bg-muted/30 rounded-md">
        <div className="w-full grid grid-cols-1 gap-4">
          <div>
            <p className="text-sm font-medium mb-2">Nhập danh sách cầu thủ từ Excel:</p>
            <div className="flex items-center gap-2">
              <Input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} className="flex-1" />
              <ExcelTemplateDownload printStyleOptions={printStyleOptions} />
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            <p>File Excel bắt buộc phải có cột STT. Các cột khác như TÊN IN TRÊN SỐ, SỐ ÁO, TÊN ĐỘI BÓNG... là tùy chọn. Các trường không có sẽ được đặt giá trị mặc định.</p>
          </div>
        </div>
      </CardFooter>

      {isMobile && <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
          <SheetContent side="bottom" className="h-[90vh] px-0">
            <SheetHeader className="px-4 mb-4">
              <SheetTitle>{isEditing ? 'Sửa thông tin cầu thủ' : 'Thêm cầu thủ mới'}</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto h-full pb-20 px-4">
              <PlayerFormFields newPlayer={newPlayer} isEditing={isEditing} printStyleOptions={printStyleOptions} onInputChange={handleInputChange} onAddOrUpdate={() => {
            addOrUpdatePlayer();
            setIsFormOpen(false);
          }} onCancel={() => {
            cancelEdit();
            setIsFormOpen(false);
          }} />
            </div>
          </SheetContent>
        </Sheet>}

      {isBatchDialogOpen && <BatchUpdateDialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen} players={players} onPlayersChange={onPlayersChange} printStyleOptions={printStyleOptions} printStyle={printStyle} />}
    </Card>;
});

PlayerForm.displayName = "PlayerForm";
