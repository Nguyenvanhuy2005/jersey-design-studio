
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Player, Order, ProductLine, Customer } from "@/types";
import { OrderPlayersTable } from "./OrderPlayersTable";

interface OrderSummaryTabProps {
  isDemoApproved: boolean;
  players: Player[];
  productLines: ProductLine[];
  customerInfo: Customer;
  isSubmitting: boolean;
  isGeneratingDesign: boolean;
  onSubmitOrder: () => void;
  jerseyCanvasRef: React.RefObject<HTMLCanvasElement>;
  pantCanvasRef: React.RefObject<HTMLCanvasElement>;
  referenceImagesPreview: string[];
}

export function OrderSummaryTab({
  isDemoApproved,
  players,
  productLines,
  customerInfo,
  isSubmitting,
  isGeneratingDesign,
  onSubmitOrder,
  jerseyCanvasRef,
  pantCanvasRef,
  referenceImagesPreview
}: OrderSummaryTabProps) {
  if (!isDemoApproved) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Vui lòng xem và duyệt thiết kế demo trước khi đến bước này.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div>
                <span className="font-medium">Họ tên:</span> {customerInfo.name}
              </div>
              <div>
                <span className="font-medium">Số điện thoại:</span> {customerInfo.phone}
              </div>
              <div>
                <span className="font-medium">Địa chỉ:</span> {customerInfo.address}
              </div>
              {customerInfo.delivery_note && (
                <div>
                  <span className="font-medium">Ghi chú giao hàng:</span> {customerInfo.delivery_note}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Design Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Thiết kế mẫu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded p-2">
                <h4 className="text-sm font-medium mb-2 text-center">Mặt trước áo</h4>
                <div className="flex justify-center">
                  <img 
                    src={jerseyCanvasRef.current?.toDataURL()} 
                    alt="Mặt trước áo"
                    className="max-h-40 object-contain"
                  />
                </div>
              </div>
              <div className="border rounded p-2">
                <h4 className="text-sm font-medium mb-2 text-center">Mặt sau áo</h4>
                <div className="flex justify-center">
                  <img 
                    src={jerseyCanvasRef.current?.toDataURL()} 
                    alt="Mặt sau áo"
                    className="max-h-40 object-contain"
                  />
                </div>
              </div>
              <div className="border rounded p-2">
                <h4 className="text-sm font-medium mb-2 text-center">Quần</h4>
                <div className="flex justify-center">
                  <img 
                    src={pantCanvasRef.current?.toDataURL()} 
                    alt="Quần"
                    className="max-h-40 object-contain"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Players List */}
        <OrderPlayersTable players={players} />
      </div>

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
