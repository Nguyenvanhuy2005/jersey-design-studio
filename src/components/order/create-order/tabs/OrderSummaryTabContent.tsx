
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Customer, DeliveryInformation, Player, ProductLine } from "@/types";
import { Loader2, ShoppingCart } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PrintCostBreakdown } from "./PrintCostBreakdown";

interface OrderSummaryTabContentProps {
  isDemoApproved: boolean;
  players: Player[];
  productLines: ProductLine[];
  customerInfo: Customer;
  deliveryInfo: DeliveryInformation;
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
  deliveryInfo,
  calculateTotalCost,
  getPlayerAndGoalkeeperCounts,
  isSubmitting,
  isGeneratingDesign,
  onSubmitOrder,
  referenceImagesPreview,
  getPrintCostBreakdown
}: OrderSummaryTabContentProps) {
  const { playerCount, goalkeeperCount } = getPlayerAndGoalkeeperCounts();
  const totalCost = calculateTotalCost();
  const formattedCost = new Intl.NumberFormat('vi-VN').format(totalCost);

  return (
    <div className="space-y-6">
      {!isDemoApproved && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">
            Vui lòng duyệt thiết kế demo trước khi đặt hàng
          </p>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khách hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="grid grid-cols-3 gap-1">
                  <dt className="font-semibold">Tên khách hàng:</dt>
                  <dd className="col-span-2">{customerInfo.name || "Chưa có thông tin"}</dd>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <dt className="font-semibold">Số điện thoại:</dt>
                  <dd className="col-span-2">{customerInfo.phone || "Chưa có thông tin"}</dd>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <dt className="font-semibold">Email:</dt>
                  <dd className="col-span-2">{customerInfo.email || "Không có"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Thông tin giao hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="grid grid-cols-3 gap-1">
                  <dt className="font-semibold">Người nhận:</dt>
                  <dd className="col-span-2">{deliveryInfo.recipient_name || "Chưa có thông tin"}</dd>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <dt className="font-semibold">Địa chỉ:</dt>
                  <dd className="col-span-2">{deliveryInfo.address || "Chưa có thông tin"}</dd>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <dt className="font-semibold">Số điện thoại:</dt>
                  <dd className="col-span-2">{deliveryInfo.phone || "Chưa có thông tin"}</dd>
                </div>
                {deliveryInfo.delivery_note && (
                  <div className="grid grid-cols-3 gap-1">
                    <dt className="font-semibold">Ghi chú:</dt>
                    <dd className="col-span-2">{deliveryInfo.delivery_note}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Thống kê đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="grid grid-cols-3 gap-1">
                  <dt className="font-semibold">Số lượng áo:</dt>
                  <dd className="col-span-2">{players.length} áo</dd>
                </div>
                {playerCount > 0 && (
                  <div className="grid grid-cols-3 gap-1">
                    <dt className="font-semibold">Áo cầu thủ:</dt>
                    <dd className="col-span-2">{playerCount} áo</dd>
                  </div>
                )}
                {goalkeeperCount > 0 && (
                  <div className="grid grid-cols-3 gap-1">
                    <dt className="font-semibold">Áo thủ môn:</dt>
                    <dd className="col-span-2">{goalkeeperCount} áo</dd>
                  </div>
                )}
                {productLines.length > 0 && (
                  <div className="grid grid-cols-3 gap-1">
                    <dt className="font-semibold">Số mục in:</dt>
                    <dd className="col-span-2">{productLines.length} mục</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết in ấn</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[200px] overflow-y-auto">
              {productLines.length > 0 ? (
                <PrintCostBreakdown costBreakdown={getPrintCostBreakdown()} />
              ) : (
                <p className="text-muted-foreground">Chưa có thông tin chi tiết in ấn</p>
              )}
            </CardContent>
          </Card>
          
          {referenceImagesPreview.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Mẫu tham khảo</CardTitle>
                <CardDescription>Đã tải lên {referenceImagesPreview.length} hình ảnh</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="grid grid-cols-2 gap-2">
                    {referenceImagesPreview.map((preview, index) => (
                      <div key={index} className="rounded-md overflow-hidden border">
                        <img 
                          src={preview} 
                          alt={`Reference ${index}`}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Tổng chi phí dự kiến</CardTitle>
              <CardDescription>Các chi phí có thể thay đổi sau khi xác nhận đơn hàng</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formattedCost} VNĐ</p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg"
                onClick={onSubmitOrder}
                disabled={isSubmitting || isGeneratingDesign || !isDemoApproved || 
                          !customerInfo.name || !customerInfo.phone || 
                          !deliveryInfo.recipient_name || !deliveryInfo.address || !deliveryInfo.phone}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Đặt hàng
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
