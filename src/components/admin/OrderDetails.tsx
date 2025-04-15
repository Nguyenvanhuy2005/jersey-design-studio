
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Order } from "@/types";
import { OrderBasicInfo } from "./order-details/OrderBasicInfo";
import { PrintConfig } from "./order-details/PrintConfig";
import { DesignImages } from "./order-details/DesignImages";
import { PlayersList } from "./order-details/PlayersList";
import { ProductLinesList } from "./order-details/ProductLinesList";
import { OrderActions } from "./order-details/OrderActions";
import { ReferenceImages } from "./order-details/ReferenceImages";

interface OrderDetailsProps {
  order: Order;
  onViewImage: (imageUrl: string) => void;
  onStatusChange: (orderId: string, newStatus: 'new' | 'processing' | 'completed') => void;
}

export const OrderDetails = ({ 
  order, 
  onViewImage,
  onStatusChange
}: OrderDetailsProps) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Chi tiết đơn hàng #{order.id}</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4 my-4">
        <div className="grid grid-cols-2 gap-4">
          <OrderBasicInfo order={order} />
          <PrintConfig printConfig={order.printConfig} />
        </div>
        
        <DesignImages order={order} onViewImage={onViewImage} />
        
        <PlayersList players={order.players} />
        
        <ProductLinesList productLines={order.productLines} />
        
        <OrderActions 
          orderId={order.id}
          teamName={order.teamName || 'Không có tên'}
          onStatusChange={onStatusChange}
        />

        <ReferenceImages 
          referenceImages={order.referenceImages}
          onViewImage={onViewImage}
        />
      </div>
    </>
  );
};
