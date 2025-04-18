
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface OrderActionButtonsProps {
  activeTab: string;
  isDemoApproved: boolean;
  isSubmitting: boolean;
  isGeneratingDesign: boolean;
  onViewDemo: () => void;
  onApproveDemo: () => void;
  onSubmitOrder: () => void;
}

export function OrderActionButtons({
  activeTab,
  isDemoApproved,
  isSubmitting,
  isGeneratingDesign,
  onViewDemo,
  onApproveDemo,
  onSubmitOrder
}: OrderActionButtonsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={() => navigate(-1)}
      >
        Hủy
      </Button>
      
      {activeTab !== "preview" ? (
        <Button onClick={onViewDemo}>
          Xem thiết kế demo
        </Button>
      ) : (
        <Button 
          onClick={onApproveDemo}
          disabled={isGeneratingDesign}
        >
          {isGeneratingDesign ? "Đang xử lý..." : "Duyệt thiết kế demo"}
        </Button>
      )}
      
      {isDemoApproved && (
        <Button 
          onClick={onSubmitOrder}
          disabled={isSubmitting || isGeneratingDesign}
        >
          {isSubmitting ? "Đang xử lý..." : "Đặt đơn hàng"}
        </Button>
      )}
    </div>
  );
}
