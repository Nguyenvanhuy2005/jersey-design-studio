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
    return <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Danh sách sản phẩm in
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Không có sản phẩm in nào được tạo.</p>
        </CardContent>
      </Card>;
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
  return <Card>
      
      
    </Card>;
};