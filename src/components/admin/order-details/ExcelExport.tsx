
import { Order, Player } from "@/types";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

interface ExcelExportProps {
  order?: Order;
  players?: Player[];
  teamName?: string;
}

export const ExcelExport = ({ order, players: providedPlayers, teamName: providedTeamName }: ExcelExportProps) => {
  const formatPlayerNumber = (number: string): string => {
    // Return the number as-is without zero-padding
    return number;
  };

  const handleExport = () => {
    // Use provided players or get from order
    const players = providedPlayers || order?.players || [];
    // Use provided teamName or get from order
    const teamName = providedTeamName || order?.teamName || "team";
    
    // Prepare data for Excel export
    const playerData = players.map((player, index) => {
      return {
        "#": index + 1,
        "Tên": player.name || "",
        "Số áo": formatPlayerNumber(player.number) || "",
        "Kích thước": player.size || "",
        "Vị trí": getPlayerPosition(player.uniform_type),
        "Ghi chú": player.note || ""
      };
    });
    
    const ws = XLSX.utils.json_to_sheet(playerData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Players");
    
    // Add more styling information
    const colWidths = [
      { wch: 5 },   // #
      { wch: 25 },  // Tên
      { wch: 8 },   // Số áo
      { wch: 12 },  // Kích thước
      { wch: 15 },  // Vị trí
      { wch: 25 },  // Ghi chú
    ];
    
    ws["!cols"] = colWidths;
    
    // Generate filename
    const fileName = `${teamName}_players.xlsx`;
    
    // Save the Excel file
    XLSX.writeFile(wb, fileName);
  };
  
  const getPlayerPosition = (uniformType: string): string => {
    switch (uniformType) {
      case 'goalkeeper':
        return 'Thủ môn';
      case 'player':
        return 'Cầu thủ';
      default:
        return uniformType || '';
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant="secondary"
      size="sm"
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Xuất Excel
    </Button>
  );
};
