
import { OrderActionButtons } from "./OrderActionButtons";
import { memo } from "react";

interface OrderPageHeaderProps {
  activeTab: string;
  isDemoApproved: boolean;
  isSubmitting: boolean;
  isGeneratingDesign: boolean;
  onViewDemo: () => void;
  onApproveDemo: () => void;
  onSubmitOrder: () => void;
}

export const OrderPageHeader = memo(({
  activeTab,
  isDemoApproved,
  isSubmitting,
  isGeneratingDesign,
  onViewDemo,
  onApproveDemo,
  onSubmitOrder
}: OrderPageHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Tạo đơn hàng mới</h1>
      <OrderActionButtons
        activeTab={activeTab}
        isDemoApproved={isDemoApproved}
        isSubmitting={isSubmitting}
        isGeneratingDesign={isGeneratingDesign}
        onViewDemo={onViewDemo}
        onApproveDemo={onApproveDemo}
        onSubmitOrder={onSubmitOrder}
      />
    </div>
  );
});

OrderPageHeader.displayName = "OrderPageHeader";
