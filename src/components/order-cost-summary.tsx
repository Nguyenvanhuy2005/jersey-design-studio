
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BreakdownItem {
  label: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface OrderCostSummaryProps {
  breakdown: BreakdownItem[];
  totalCost: number;
}

export function OrderCostSummary({
  breakdown,
  totalCost
}: OrderCostSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chi phí in ấn chi tiết</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <table className="w-full text-sm">
            <tbody>
              {breakdown.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1">{item.label}</td>
                  <td className="text-center py-1">{item.quantity}</td>
                  <td className="text-center py-1">{item.unitPrice.toLocaleString()}đ</td>
                  <td className="text-right py-1">{item.total.toLocaleString()}đ</td>
                </tr>
              ))}
              <tr className="font-semibold border-t">
                <td colSpan={3} className="text-right py-2">Tổng chi phí in ấn:</td>
                <td className="text-right py-2 text-primary">{totalCost.toLocaleString()}đ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
