
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Order } from "@/types";
import { OrderBasicInfo } from "./order-details/OrderBasicInfo";
import { PrintConfig } from "./order-details/PrintConfig";
import { PlayersList } from "./order-details/PlayersList";
import { ProductLinesList } from "./order-details/ProductLinesList";
import { OrderActions } from "./order-details/OrderActions";
import { ReferenceImages } from "./order-details/ReferenceImages";

interface OrderDetailsProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: 'new' | 'processing' | 'completed') => void;
}

export const OrderDetails = ({ 
  order, 
  onStatusChange
}: OrderDetailsProps) => {
  return (
    <>
      <DialogHeader className="mb-4">
        <DialogTitle>Chi tiết đơn hàng #{order.id}</DialogTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {order.teamName || 'Không có tên đội'} - {order.customerName || 'Không xác định'}
        </p>
      </DialogHeader>
      
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="info">Thông tin đơn hàng</TabsTrigger>
          <TabsTrigger value="players">Danh sách cầu thủ</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-4 my-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OrderBasicInfo order={order} />
            <PrintConfig printConfig={order.printConfig} />
          </div>
          
          <ProductLinesList productLines={order.productLines} />
          
          <ReferenceImages 
            referenceImages={order.referenceImages}
          />
        </TabsContent>
        
        <TabsContent value="players" className="space-y-4 my-4">
          <PlayersList players={order.players} />
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 pt-4 border-t">
        <OrderActions 
          orderId={order.id}
          teamName={order.teamName || 'Không có tên'}
          onStatusChange={onStatusChange}
        />
      </div>
    </>
  );
};
