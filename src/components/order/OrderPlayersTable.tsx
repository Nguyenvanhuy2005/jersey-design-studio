
import { Player } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface OrderPlayersTableProps {
  players: Player[];
}

export const OrderPlayersTable = ({ players }: OrderPlayersTableProps) => {
  if (!players?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Danh sách cầu thủ ({players.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Số áo</TableHead>
                <TableHead>Tên trên số</TableHead>
                <TableHead>Tên dưới số</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Chi tiết in</TableHead>
                <TableHead>Kiểu in</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player, index) => (
                <TableRow key={player.id || index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{player.number}</TableCell>
                  <TableCell>{player.line_1 || "-"}</TableCell>
                  <TableCell>{player.line_3 || "-"}</TableCell>
                  <TableCell>
                    {player.uniform_type === 'goalkeeper' ? 'Thủ môn' : 'Cầu thủ'}
                  </TableCell>
                  <TableCell>{player.size}</TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      {player.chest_number && <div>• Số ngực</div>}
                      {player.pants_number && <div>• Số quần</div>}
                      {player.logo_chest_left && <div>• Logo ngực trái</div>}
                      {player.logo_chest_right && <div>• Logo ngực phải</div>}
                      {player.logo_chest_center && <div>• Logo ngực giữa</div>}
                      {player.logo_sleeve_left && <div>• Logo tay trái</div>}
                      {player.logo_sleeve_right && <div>• Logo tay phải</div>}
                      {player.logo_pants && <div>• Logo quần</div>}
                    </div>
                  </TableCell>
                  <TableCell>{player.print_style || "In chuyển nhiệt"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {player.note || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
