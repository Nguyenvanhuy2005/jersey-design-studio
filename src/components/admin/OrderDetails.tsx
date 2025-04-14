
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Order } from "@/types";
import { OrderBasicInfo } from "./order-details/OrderBasicInfo";
import { PrintConfig } from "./order-details/PrintConfig";
import { DesignImages } from "./order-details/DesignImages";
import { PlayersList } from "./order-details/PlayersList";
import { ProductLinesList } from "./order-details/ProductLinesList";
import { OrderActions } from "./order-details/OrderActions";
import { ReferenceImages } from "./order-details/ReferenceImages";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerInfo } from "./order-details/CustomerInfo";
import { OrderSummary } from "./order-details/OrderSummary";

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
        <DialogTitle>Chi tiết đơn hàng: {order.teamName || `#${order.id?.substring(0, 8)}`}</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4 my-4">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Thông tin đơn hàng</TabsTrigger>
            <TabsTrigger value="players">Danh sách cầu thủ</TabsTrigger>
            <TabsTrigger value="printing">Thông tin in ấn</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <OrderBasicInfo order={order} />
              <CustomerInfo customer={order.customerInfo} />
            </div>
            
            <OrderSummary order={order} />
            
            <DesignImages order={order} onViewImage={onViewImage} />
            
            <ReferenceImages 
              referenceImages={order.referenceImages}
              onViewImage={onViewImage}
            />
            
            <OrderActions 
              orderId={order.id}
              teamName={order.teamName}
              onStatusChange={onStatusChange}
            />
          </TabsContent>
          
          <TabsContent value="players">
            <PlayersList players={order.players} />
          </TabsContent>
          
          <TabsContent value="printing">
            <div className="space-y-4">
              <PrintConfig printConfig={order.printConfig} />
              <ProductLinesList productLines={order.productLines} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};
