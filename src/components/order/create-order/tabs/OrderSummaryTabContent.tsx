import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderPlayersList } from "../../OrderPlayersList";
import { OrderCostSummary } from "@/components/order-cost-summary";
import { Player, ProductLine, Customer } from "@/types";
import { PrintCostBreakdown } from "@/components/order/create-order/tabs/PrintCostBreakdown";

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
  getPrintCostBreakdown: () => {
    label: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
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
  referenceImagesPreview,
  getPrintCostBreakdown
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

  const { playerCount, goalkeeperCount } = getPlayerAndGoalkeeperCounts();
  const totalCost = calculateTotalCost();
  const costBreakdown = getPrintCostBreakdown();

  const calculatePrintPositionsCount = () => {
    let count = 0;
    players.forEach(player => {
      if (player.chest_number) count++;
      if (player.pants_number) count++;
      if (player.logo_chest_left) count++;
      if (player.logo_chest_right) count++;
      if (player.logo_chest_center) count++;
      if (player.logo_sleeve_left) count++;
      if (player.logo_sleeve_right) count++;
      if (player.logo_pants) count++;
    });
    return count;
  };

  return (
    <div className="space-y-6">
      <OrderCostSummary
        breakdown={costBreakdown}
        totalCost={totalCost}
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
