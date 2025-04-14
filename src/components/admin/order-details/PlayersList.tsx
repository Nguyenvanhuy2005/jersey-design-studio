
import { Player } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckIcon, XIcon } from "lucide-react";

interface PlayersListProps {
  players: Player[];
}

export const PlayersList = ({ players }: PlayersListProps) => {
  return (
    <div>
      <h3 className="font-semibold mb-2">Danh sách cầu thủ</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Tên in trên số</TableHead>
              <TableHead>Số</TableHead>
              <TableHead>Tên in dưới số</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Màu áo</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Ghi chú</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player, index) => (
              <TableRow key={player.id || index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{player.line_1 || player.name || "—"}</TableCell>
                <TableCell>{player.number}</TableCell>
                <TableCell>{player.line_3 || "—"}</TableCell>
                <TableCell>{player.size}</TableCell>
                <TableCell>{player.jersey_color || "—"}</TableCell>
                <TableCell>{player.uniform_type === 'goalkeeper' ? 'Thủ môn' : 'Cầu thủ'}</TableCell>
                <TableCell>{player.note || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <h3 className="font-semibold mt-6 mb-2">Chi tiết in cho từng cầu thủ</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Số</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>In chữ ngực</TableHead>
              <TableHead>In số ngực</TableHead>
              <TableHead>Logo ngực trái</TableHead>
              <TableHead>Logo ngực phải</TableHead>
              <TableHead>Logo ngực giữa</TableHead>
              <TableHead>Logo tay trái</TableHead>
              <TableHead>Logo tay phải</TableHead>
              <TableHead>In Pet ngực</TableHead>
              <TableHead>Logo quần</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player, index) => (
              <TableRow key={player.id || index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{player.number}</TableCell>
                <TableCell>{player.name}</TableCell>
                <TableCell>{player.chest_text || <XIcon className="h-4 w-4 opacity-50" />}</TableCell>
                <TableCell>{player.chest_number ? <CheckIcon className="h-4 w-4 text-green-500" /> : <XIcon className="h-4 w-4 opacity-50" />}</TableCell>
                <TableCell>{player.logo_chest_left ? <CheckIcon className="h-4 w-4 text-green-500" /> : <XIcon className="h-4 w-4 opacity-50" />}</TableCell>
                <TableCell>{player.logo_chest_right ? <CheckIcon className="h-4 w-4 text-green-500" /> : <XIcon className="h-4 w-4 opacity-50" />}</TableCell>
                <TableCell>{player.logo_chest_center ? <CheckIcon className="h-4 w-4 text-green-500" /> : <XIcon className="h-4 w-4 opacity-50" />}</TableCell>
                <TableCell>{player.logo_sleeve_left ? <CheckIcon className="h-4 w-4 text-green-500" /> : <XIcon className="h-4 w-4 opacity-50" />}</TableCell>
                <TableCell>{player.logo_sleeve_right ? <CheckIcon className="h-4 w-4 text-green-500" /> : <XIcon className="h-4 w-4 opacity-50" />}</TableCell>
                <TableCell>{player.pet_chest || <XIcon className="h-4 w-4 opacity-50" />}</TableCell>
                <TableCell>{player.logo_pants ? <CheckIcon className="h-4 w-4 text-green-500" /> : <XIcon className="h-4 w-4 opacity-50" />}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
