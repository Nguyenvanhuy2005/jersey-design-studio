
import { Order } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Type, Shirt } from "lucide-react";

interface PlayersListProps {
  players: Order['players'];
}

export const PlayersList = ({ players }: PlayersListProps) => {
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
                <TableHead>Tên cầu thủ</TableHead>
                <TableHead>Số áo</TableHead>
                <TableHead>Kích thước</TableHead>
                <TableHead>In lưng</TableHead>
                <TableHead>In số ngực</TableHead>
                <TableHead>In số quần</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player, index) => (
                <TableRow key={player.id || index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div>
                      <p>{player.name || "(Không có tên)"}</p>
                      {player.line_1 && (
                        <p className="text-xs text-muted-foreground">
                          Tên in: {player.line_1}
                        </p>
                      )}
                      {player.line_3 && (
                        <p className="text-xs text-muted-foreground">
                          Tên đội: {player.line_3}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{player.number}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Shirt className="h-4 w-4" />
                      {player.size}
                    </div>
                  </TableCell>
                  <TableCell>{player.printImage ? "Có" : "Không"}</TableCell>
                  <TableCell>{player.chest_number ? "Có" : "Không"}</TableCell>
                  <TableCell>{player.pants_number ? "Có" : "Không"}</TableCell>
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
