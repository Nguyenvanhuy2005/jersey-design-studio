import { Order } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List, Printer } from "lucide-react";
interface ProductLinesListProps {
  productLines: Order['productLines'];
}
export const ProductLinesList = ({
  productLines
}: ProductLinesListProps) => {
  if (!productLines?.length) return null;
  return <Card>
      
      
    </Card>;
};