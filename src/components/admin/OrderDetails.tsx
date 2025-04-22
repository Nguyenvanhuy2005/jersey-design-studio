
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Order } from "@/types";
import { OrderBasicInfo } from "./order-details/OrderBasicInfo";
import { PrintConfig } from "./order-details/PrintConfig";
import { PlayersList } from "./order-details/PlayersList";
import { ProductLinesList } from "./order-details/ProductLinesList";
import { OrderActions } from "./order-details/OrderActions";
import { ReferenceImages } from "./order-details/ReferenceImages";
import { Logo } from "@/types";
import { getReferenceImageUrls } from "@/utils/images/reference-image-utils";

interface OrderDetailsProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: 'new' | 'processing' | 'completed' | 'delivered') => void;
  onDeleteOrder: (orderId: string) => void;
}

export const OrderDetails = ({ order, onStatusChange, onDeleteOrder }: OrderDetailsProps) => {
  // Use logo_urls if available, else fallback to logos[]
  const logoUrls = order.logo_urls || [];
  const allLogosFromUrls = Array.isArray(logoUrls)
    ? logoUrls.map((url, idx) => ({
        url,
        position: `Logo ${idx+1}`,
      }))
    : [];
    
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
            <PrintConfig printConfig={order.printConfig} designData={order.designData} />
          </div>
          
          <ProductLinesList productLines={order.productLines} />
          
          {allLogosFromUrls.length > 0 && (
            <div className="mb-4">
              <div className="font-semibold mb-2">Logo đã tải lên:</div>
              <div className="flex flex-wrap gap-4">
                {allLogosFromUrls.map((logo, i) => (
                  <div
                    key={logo.url as string}
                    className="flex flex-col items-center border rounded p-2 bg-muted"
                  >
                    <img src={logo.url} alt={`Logo ${i+1}`} className="max-w-[80px] max-h-[80px] rounded mb-1 object-contain bg-white" />
                    <span className="text-xs text-center">{logo.position}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <ReferenceImages
            referenceImages={order.referenceImages}
            logos={order.logos || []}
          />
        </TabsContent>
        
        <TabsContent value="players" className="space-y-4 my-4">
          <PlayersList 
            players={order.players} 
            teamName={order.teamName || 'Không có tên'}
          />
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 pt-4 border-t">
        <OrderActions 
          orderId={order.id}
          teamName={order.teamName || 'Không có tên'}
          status={order.status as any}
          onStatusChange={onStatusChange}
          onDeleteOrder={onDeleteOrder}
        />
      </div>
    </>
  );
};
