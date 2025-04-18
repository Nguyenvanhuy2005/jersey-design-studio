
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderPlayersList } from "../../OrderPlayersList";
import { OrderCostSummary } from "@/components/order-cost-summary";
import { Player, ProductLine, Customer } from "@/types";

interface OrderSummaryTabContentProps {
  isDemoApproved: boolean;
  players: Player[];
  productLines: ProductLine[];
  customerInfo: Customer;
  calculateTotalCost: () => number;
  getPlayerAndGoalkeeperCounts: () => { playerCount: number; goalkeeperCount: number };
  isSubmitting: boolean;
  isGeneratingDesign: boolean;
  onSubmitOrder: () => void;
  referenceImagesPreview: string[];
}

export function OrderSummaryTabContent({
  isDemoApproved,
  players,
  productLines,
  customerInfo,
  calculateTotalCost,
  getPlayerAndGoalkeeperCounts,
  isSubmitting,
  isGeneratingDesign,
  onSubmitOrder,
  referenceImagesPreview
}: OrderSummaryTabContentProps) {
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
      <OrderCostSummary 
        customerInfo={customerInfo}
        players={players}
        productLines={productLines}
        calculateTotalCost={calculateTotalCost}
        getPlayerAndGoalkeeperCounts={getPlayerAndGoalkeeperCounts}
        referenceImagesPreview={referenceImagesPreview}
      />

      <OrderPlayersList players={players} />
      
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
