
import { Order } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PlayersListProps {
  players: Order['players'];
}

export const PlayersList = ({ players }: PlayersListProps) => {
  return (
    <div>
      <h3 className="font-semibold mb-2">Danh sách cầu thủ</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Số áo</TableHead>
              <TableHead>Kích thước áo</TableHead>
              <TableHead>Kích thước quần</TableHead>
              <TableHead>In hình</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player, index) => (
              <TableRow key={player.id || index}>
                <TableCell>{player.name}</TableCell>
                <TableCell>{player.number}</TableCell>
                <TableCell>{player.size}</TableCell>
                <TableCell>{player.pantsSize || "-"}</TableCell>
                <TableCell>{player.printImage ? "Có" : "Không"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
