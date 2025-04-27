
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { Player } from "@/types";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

interface ExcelExportProps {
  players: Player[];
  teamName: string;
}

// Helper to ensure player numbers exported as text with leading zeros
function formatPlayerNumber(number: string) {
  if (!number) return '';
  return number.padStart(2, '0');
}

// Helper to convert boolean to Vietnamese Yes/No
function booleanToVietnamese(value: boolean | undefined): string {
  return value ? 'Có' : 'Không';
}

export const ExcelExport = ({ players, teamName }: ExcelExportProps) => {
  const handleExport = () => {
    try {
      const data = players.map((player, index) => ({
        'STT': index + 1,
        'SỐ ÁO': formatPlayerNumber(player.number),
        'LOẠI QUẦN ÁO': player.uniform_type === 'goalkeeper' ? 'Thủ môn' : 'Cầu thủ',
        'KÍCH THƯỚC': player.size,
        'TÊN IN TRÊN SỐ': player.line_1 || '',
        'TÊN ĐỘI BÓNG': player.line_3 || '',
        'KIỂU IN': player.print_style || 'In chuyển nhiệt',
        'IN CHỮ NGỰC': player.chest_text || '',
        'IN SỐ NGỰC': booleanToVietnamese(player.chest_number),
        'IN SỐ QUẦN': booleanToVietnamese(player.pants_number),
        'LOGO NGỰC TRÁI': booleanToVietnamese(player.logo_chest_left),
        'LOGO NGỰC PHẢI': booleanToVietnamese(player.logo_chest_right),
        'LOGO NGỰC GIỮA': booleanToVietnamese(player.logo_chest_center),
        'LOGO TAY TRÁI': booleanToVietnamese(player.logo_sleeve_left),
        'LOGO TAY PHẢI': booleanToVietnamese(player.logo_sleeve_right),
        'LOGO QUẦN': booleanToVietnamese(player.logo_pants),
        'GHI CHÚ': player.note || ''
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      
      // Format all player number cells as text
      Object.keys(ws).forEach(cell => {
        if (cell.match(/^B[0-9]+$/)) {
          ws[cell].z = '@';
        }
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Players");
      XLSX.writeFile(wb, `danh-sach-cau-thu-${teamName.toLowerCase().replace(/\s+/g, '-')}.xlsx`);
      
      toast.success("Xuất Excel thành công");
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error("Có lỗi khi xuất file Excel");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      className="flex items-center gap-2"
    >
      <FileSpreadsheet className="h-4 w-4" />
      Xuất danh sách Excel
    </Button>
  );
};
