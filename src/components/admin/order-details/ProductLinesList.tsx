
import { Order } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List, Calculator } from "lucide-react";

interface ProductLinesListProps {
  productLines: Order['productLines'];
}

export const ProductLinesList = ({
  productLines
}: ProductLinesListProps) => {
  if (!productLines?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Danh sách sản phẩm in
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Không có sản phẩm in nào được tạo.</p>
        </CardContent>
      </Card>
    );
  }

  // Group product lines by position and material for summary
  const groupedLines = productLines.reduce((acc, line) => {
    const key = `${line.position} - ${line.material}`;
    if (!acc[key]) {
      acc[key] = {
        position: line.position,
        material: line.material,
        product: line.product,
        size: line.size,
        quantity: 0,
        content: line.content
      };
    }
    acc[key].quantity += line.points;
    return acc;
  }, {} as Record<string, any>);

  const groupedArray = Object.values(groupedLines);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5" />
          Danh sách sản phẩm in ({productLines.length} dòng)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Chất liệu</TableHead>
                  <TableHead>Kích thước</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead>Nội dung</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedArray.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.product}</TableCell>
                    <TableCell>{item.position}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.material === 'In decal' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {item.material}
                      </span>
                    </TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell className="text-right font-semibold">{item.quantity}</TableCell>
                    <TableCell className="text-muted-foreground">{item.content}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-4">
            <Calculator className="h-4 w-4" />
            <span>Tổng số dòng sản phẩm: {productLines.length}</span>
            <span>•</span>
            <span>Tổng số lượng: {productLines.reduce((sum, line) => sum + line.points, 0)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
