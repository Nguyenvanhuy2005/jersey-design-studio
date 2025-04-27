
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
  return number != null ? number : '';
}

export const ExcelExport = ({ players, teamName }: ExcelExportProps) => {
  const handleExport = () => {
    const data = players.map((player, index) => ({
      'STT': index + 1,
      'SỐ ÁO': formatPlayerNumber(player.number),
      'LOẠI QUẦN ÁO': player.uniform_type === 'goalkeeper' ? 'Thủ môn' : 'Cầu thủ',
      'KÍCH THƯỚC': player.size,
      'TÊN IN TRÊN SỐ': player.line_1 || '',
      'TÊN ĐỘI BÓNG': player.line_3 || '',
      'KIỂU IN': player.print_style || 'In chuyển nhiệt',
      'IN CHỮ NGỰC': player.chest_text || '',
      'IN SỐ NGỰC': player.chest_number ? 'Có' : 'Không',
      'IN SỐ QUẦN': player.pants_number ? 'Có' : 'Không',
      'LOGO NGỰC TRÁI': player.logo_chest_left ? 'Có' : 'Không',
      'LOGO NGỰC PHẢI': player.logo_chest_right ? 'Có' : 'Không',
      'LOGO NGỰC GIỮA': player.logo_chest_center ? 'Có' : 'Không',
      'LOGO TAY TRÁI': player.logo_sleeve_left ? 'Có' : 'Không',
      'LOGO TAY PHẢI': player.logo_sleeve_right ? 'Có' : 'Không',
      'LOGO QUẦN': player.logo_pants ? 'Có' : 'Không',
      'GHI CHÚ': player.note || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    
    // Force the column 'SỐ ÁO' to be text in the worksheet
    Object.keys(ws).forEach(cell => {
      if (cell.match(/^B[0-9]+$/)) {
        ws[cell].z = '@';
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
