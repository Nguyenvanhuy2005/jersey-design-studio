
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/order-summary";
import { OrderCostSummary } from "@/components/order-cost-summary";
import { ProductLineTable } from "@/components/product-line-table";
import { Player, Logo, ProductLine, Customer } from "@/types";

interface OrderSummaryTabProps {
  isDemoApproved: boolean;
  players: Player[];
  logos: Logo[];
  productLines: ProductLine[];
  customerInfo: Customer;
  calculateTotalCost: () => number;
  getPlayerAndGoalkeeperCounts: () => { playerCount: number; goalkeeperCount: number };
  onProductLinesChange: (productLines: ProductLine[]) => void;
  isSubmitting: boolean;
  isGeneratingDesign: boolean;
  onSubmitOrder: () => void;
}

export function OrderSummaryTab({
  isDemoApproved,
  players,
  logos,
  productLines,
  customerInfo,
  calculateTotalCost,
  getPlayerAndGoalkeeperCounts,
  onProductLinesChange,
  isSubmitting,
  isGeneratingDesign,
  onSubmitOrder
}: OrderSummaryTabProps) {
  const { playerCount, goalkeeperCount } = getPlayerAndGoalkeeperCounts();
  
  if (!isDemoApproved) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Chưa duyệt thiết kế demo</AlertTitle>
        <AlertDescription>
          Vui lòng xem và duyệt thiết kế demo trước khi đến bước này.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <OrderSummary 
        teamName={players[0]?.name?.split(' ')[0] || "TEAM"}
        players={players}
        logos={logos}
        productLines={productLines}
        uniformType={players[0]?.uniform_type || 'player'}
        quantity={players.length}
        totalCost={calculateTotalCost()}
        customerInfo={customerInfo}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Danh sách sản phẩm in</CardTitle>
        </CardHeader>
        <CardContent>
          {productLines.length > 0 ? (
            <ProductLineTable 
              productLines={productLines} 
              onProductLinesChange={onProductLinesChange}
              logos={logos}
            />
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Chưa có sản phẩm in</AlertTitle>
              <AlertDescription>
                Vui lòng tạo danh sách sản phẩm in từ thông tin cầu thủ.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <OrderCostSummary 
        uniformCount={players.length}
        jerseyUnitPrice={120000}
        goalkeeperUnitPrice={150000}
        playerCount={playerCount}
        goalkeeperCount={goalkeeperCount}
        printPositionsCount={productLines.length}
        printUnitPrice={20000}
        totalCost={calculateTotalCost()}
      />
      
      <div className="flex justify-end">
        <Button 
          onClick={onSubmitOrder}
          disabled={isSubmitting || isGeneratingDesign}
          size="lg"
        >
          {isSubmitting ? "Đang xử lý..." : "Đặt đơn hàng"}
        </Button>
      </div>
    </div>
  );
}
