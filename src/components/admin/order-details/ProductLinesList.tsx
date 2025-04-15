
import { Order } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List, Printer } from "lucide-react";

interface ProductLinesListProps {
  productLines: Order['productLines'];
}

export const ProductLinesList = ({ productLines }: ProductLinesListProps) => {
  if (!productLines?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5" />
          Danh sách in ấn ({productLines.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Chất liệu</TableHead>
                <TableHead>Kích thước</TableHead>
                <TableHead>Điểm</TableHead>
                <TableHead>Nội dung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productLines.map((line, index) => (
                <TableRow key={line.id || index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{line.product}</TableCell>
                  <TableCell>{line.position}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Printer className="h-4 w-4" />
                      {line.material}
                    </div>
                  </TableCell>
                  <TableCell>{line.size}</TableCell>
                  <TableCell>{line.points || 0}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {line.content || "-"}
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
