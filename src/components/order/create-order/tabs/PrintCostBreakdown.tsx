
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PrintCostBreakdownProps {
  breakdown: {
    label: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalCost: number;
}

export function PrintCostBreakdown({ breakdown, totalCost }: PrintCostBreakdownProps) {
  if (!breakdown || !breakdown.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chi tiết chi phí in ấn</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2">Hạng mục</th>
                <th className="text-center py-2">Số lượng</th>
                <th className="text-center py-2">Đơn giá</th>
                <th className="text-right py-2">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2">{item.label}</td>
                  <td className="text-center py-2">{item.quantity}</td>
                  <td className="text-center py-2">{item.unitPrice.toLocaleString()}đ</td>
                  <td className="text-right py-2">{item.total.toLocaleString()}đ</td>
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
