import { AlertCircle, Camera } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/order-summary";
import { Player, Logo, ProductLine, Customer } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface OrderSummaryTabProps {
  isDemoApproved: boolean;
  players: Player[];
  logos: Logo[];
  productLines: ProductLine[];
  customerInfo: Customer;
  calculateTotalCost: () => number;
  getPlayerAndGoalkeeperCounts: () => { playerCount: number; goalkeeperCount: number };
  onProductLinesChange: (productLines: ProductLine[]) => void;
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
  logos,
  productLines,
  customerInfo,
  calculateTotalCost,
  getPlayerAndGoalkeeperCounts,
  onProductLinesChange,
  isSubmitting,
  isGeneratingDesign,
  onSubmitOrder,
  jerseyCanvasRef,
  pantCanvasRef,
  referenceImagesPreview
}: OrderSummaryTabProps) {
  const { playerCount, goalkeeperCount } = getPlayerAndGoalkeeperCounts();
  
  const calculatePrintCounts = () => {
    const counts = {
      line_1: 0,
      line_2: 0,
      line_3: 0,
      chest_text: 0,
      chest_number: 0,
      pants_number: 0,
      logo_chest_left: 0,
      logo_chest_right: 0,
      logo_chest_center: 0,
      logo_sleeve_left: 0,
      logo_sleeve_right: 0,
      logo_pants: 0,
      pet_chest: 0,
      heat_transfer: 0,
      decal: 0
    };
    
    players.forEach(player => {
      if (player.line_1) counts.line_1++;
      if (player.number) counts.line_2++;
      if (player.line_3) counts.line_3++;
      if (player.chest_text) counts.chest_text++;
      if (player.chest_number) counts.chest_number++;
      if (player.pants_number) counts.pants_number++;
      if (player.logo_chest_left) counts.logo_chest_left++;
      if (player.logo_chest_right) counts.logo_chest_right++;
      if (player.logo_chest_center) counts.logo_chest_center++;
      if (player.logo_sleeve_left) counts.logo_sleeve_left++;
      if (player.logo_sleeve_right) counts.logo_sleeve_right++;
      if (player.logo_pants) counts.logo_pants++;
      if (player.pet_chest) counts.pet_chest++;
    });
    
    productLines.forEach(line => {
      if (line.material === "In chuyển nhiệt") counts.heat_transfer++;
      if (line.material === "In decal") counts.decal++;
    });
    
    return counts;
  };

  const captureCanvas = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
    if (canvasRef.current) {
      return canvasRef.current.toDataURL('image/png');
    }
    return '';
  };

  const printCounts = calculatePrintCounts();
  
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
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary">Tổng kết thông tin</TabsTrigger>
          <TabsTrigger value="print-details">Chi tiết in ấn</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Họ tên:</span> {customerInfo.name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Số điện thoại:</span> {customerInfo.phone}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Địa chỉ:</span> {customerInfo.address}
                </div>
                {customerInfo.delivery_note && (
                  <div>
                    <span className="text-muted-foreground">Ghi chú giao hàng:</span> {customerInfo.delivery_note}
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Số lượng quần áo:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Số lượng cầu thủ:</span> {playerCount} bộ
                  </div>
                  <div>
                    <span className="text-muted-foreground">Số lượng thủ môn:</span> {goalkeeperCount} bộ
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Hiển thị thiết kế:</h3>
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
              </div>
              
              {referenceImagesPreview.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-2">Hình ảnh tham khảo:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {referenceImagesPreview.map((url, index) => (
                        <div key={index} className="border rounded overflow-hidden h-24">
                          <img 
                            src={url} 
                            alt={`Tham khảo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="print-details">
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết in ấn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {logos.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Logo ({logos.length}):</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {logos.map((logo, index) => (
                      <div key={index} className="border rounded p-2 text-center">
                        <img 
                          src={logo.previewUrl} 
                          alt={`Logo ${index + 1}`} 
                          className="h-16 w-16 object-contain mx-auto"
                        />
                        <p className="text-xs mt-1">
                          {logo.position === 'chest_left' && 'Ngực trái'}
                          {logo.position === 'chest_right' && 'Ngực phải'}
                          {logo.position === 'chest_center' && 'Ngực giữa'}
                          {logo.position === 'sleeve_left' && 'Tay trái'}
                          {logo.position === 'sleeve_right' && 'Tay phải'}
                          {logo.position === 'pants' && 'Quần'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Kiểu in:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">In chuyển nhiệt:</span> {printCounts.heat_transfer} vị trí
                  </div>
                  <div>
                    <span className="text-muted-foreground">In decal:</span> {printCounts.decal} vị trí
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Vị trí in:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">IN DÒNG 1 (trên số):</span> {printCounts.line_1}
                  </div>
                  <div>
                    <span className="text-muted-foreground">IN DÒNG 2 (số lưng):</span> {printCounts.line_2}
                  </div>
                  <div>
                    <span className="text-muted-foreground">IN DÒNG 3 (dưới số):</span> {printCounts.line_3}
                  </div>
                  <div>
                    <span className="text-muted-foreground">IN CHỮ NGỰC:</span> {printCounts.chest_text}
                  </div>
                  <div>
                    <span className="text-muted-foreground">IN SỐ NGỰC:</span> {printCounts.chest_number}
                  </div>
                  <div>
                    <span className="text-muted-foreground">IN SỐ QUẦN:</span> {printCounts.pants_number}
                  </div>
                  <div>
                    <span className="text-muted-foreground">IN PET NGỰC:</span> {printCounts.pet_chest}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Vị trí in logo:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">LOGO NGỰC TRÁI:</span> {printCounts.logo_chest_left}
                  </div>
                  <div>
                    <span className="text-muted-foreground">LOGO NGỰC PHẢI:</span> {printCounts.logo_chest_right}
                  </div>
                  <div>
                    <span className="text-muted-foreground">LOGO NGỰC GIỮA:</span> {printCounts.logo_chest_center}
                  </div>
                  <div>
                    <span className="text-muted-foreground">LOGO TAY TRÁI:</span> {printCounts.logo_sleeve_left}
                  </div>
                  <div>
                    <span className="text-muted-foreground">LOGO TAY PHẢI:</span> {printCounts.logo_sleeve_right}
                  </div>
                  <div>
                    <span className="text-muted-foreground">LOGO QUẦN:</span> {printCounts.logo_pants}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
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
