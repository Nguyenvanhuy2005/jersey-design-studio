
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { Player } from "@/types";
import * as XLSX from 'xlsx';

interface ExcelExportProps {
  players: Player[];
  teamName: string;
}

// Helper to ensure player numbers exported as text with leading zeros
function formatPlayerNumber(number: string) {
  // Always output as string for Excel
  return number != null ? number : '';
}

export const ExcelExport = ({ players, teamName }: ExcelExportProps) => {
  const handleExport = () => {
    const data = players.map((player, index) => ({
      'STT': index + 1,
      'Số áo': formatPlayerNumber(player.number),
      'Loại quần áo': player.uniform_type === 'goalkeeper' ? 'Thủ môn' : 'Cầu thủ',
      'Kích thước': player.size,
      'Chữ trên số ngực': player.upper_text || '',
      'In dòng trên số lưng': player.line_1 || '',
      'In dòng dưới số lưng': player.line_3 || '',
      'Chi tiết in ấn': [
        player.upper_text_enabled ? 'Chữ trên số ngực' : '',
        player.chest_number ? 'In số ngực' : '',
        player.lower_text_enabled ? 'Chữ dưới số ngực' : '',
        player.pants_number ? 'In số quần' : '',
        player.logo_chest_left ? 'Logo ngực trái' : '',
        player.logo_chest_right ? 'Logo ngực phải' : '',
        player.logo_chest_center ? 'Logo ngực giữa' : '',
        player.logo_sleeve_left ? 'Logo tay trái' : '',
        player.logo_sleeve_right ? 'Logo tay phải' : '',
        player.logo_pants ? 'Logo quần' : '',
      ].filter(Boolean).join(', '),
      'Kiểu in': player.print_style || 'In chuyển nhiệt',
      'Ghi chú': player.note || ''
    }));

    // Set cell format to text for player numbers (important for leading zeros)
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Force the column 'Số áo' to be text in the worksheet
    Object.keys(ws).forEach(cell => {
      if (cell.match(/^B[0-9]+$/)) {
        ws[cell].z = '@'; // set text format
      }
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Players");
    XLSX.writeFile(wb, `danh-sach-cau-thu-${teamName.toLowerCase().replace(/\s+/g, '-')}.xlsx`);
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
