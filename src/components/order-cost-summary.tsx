
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumberWithCommas } from "@/utils/format-utils";

interface OrderCostSummaryProps {
  uniformCount: number;
  jerseyUnitPrice: number;
  goalkeeperUnitPrice: number;
  playerCount: number;
  goalkeeperCount: number;
  printPositionsCount: number;
  printUnitPrice: number;
  totalCost: number;
}

export function OrderCostSummary({
  printPositionsCount,
  printUnitPrice,
  totalCost
}: OrderCostSummaryProps) {
  const printingCost = printPositionsCount * printUnitPrice;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chi phí đơn hàng</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Only show printing cost */}
          <div className="flex justify-between items-center py-2 border-b">
            <div>
              <p>Chi phí in ấn: {printPositionsCount} vị trí</p>
              <p className="text-sm text-muted-foreground">
                {formatNumberWithCommas(printUnitPrice)} × {printPositionsCount}
              </p>
            </div>
            <div className="font-medium">{formatCurrency(printingCost)}</div>
          </div>

          <div className="flex justify-between items-center py-2 font-semibold text-lg">
            <p>Tổng chi phí:</p>
            <div className="text-primary">{formatCurrency(totalCost)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
