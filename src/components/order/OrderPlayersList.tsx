
import { Player } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shirt, Printer } from "lucide-react";

interface OrderPlayersListProps {
  players: Player[];
}

export function OrderPlayersList({ players }: OrderPlayersListProps) {
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
                <TableHead>In dòng trên số lưng</TableHead>
                <TableHead>In dòng dưới số lưng</TableHead>
                <TableHead>Số áo</TableHead>
                <TableHead>Kích thước</TableHead>
                <TableHead>Chi tiết in ấn</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player, index) => (
                <TableRow key={player.id || index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{player.line_1 || "-"}</TableCell>
                  <TableCell>{player.line_3 || "-"}</TableCell>
                  <TableCell className="font-semibold">{player.number}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Shirt className="h-4 w-4" />
                      {player.size}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      {player.chest_number && (
                        <p>- In số ngực</p>
                      )}
                      {player.pants_number && (
                        <p>- In số quần</p>
                      )}
                      {(player.logo_chest_left || 
                        player.logo_chest_right || 
                        player.logo_chest_center || 
                        player.logo_sleeve_left || 
                        player.logo_sleeve_right || 
                        player.logo_pants) && (
                        <p className="font-medium mt-1">Vị trí logo:</p>
                      )}
                      {player.logo_chest_left && (<p>- Logo ngực trái</p>)}
                      {player.logo_chest_right && (<p>- Logo ngực phải</p>)}
                      {player.logo_chest_center && (<p>- Logo ngực giữa</p>)}
                      {player.logo_sleeve_left && (<p>- Logo tay trái</p>)}
                      {player.logo_sleeve_right && (<p>- Logo tay phải</p>)}
                      {player.logo_pants && (<p>- Logo quần</p>)}
                      <p className="font-medium mt-1">
                        <span className="inline-flex items-center gap-1">
                          <Printer className="h-4 w-4" />
                          Kiểu in: {player.print_style || "In chuyển nhiệt"}
                        </span>
                      </p>
                      {player.note && (
                        <p className="text-muted-foreground mt-1">Ghi chú: {player.note}</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
