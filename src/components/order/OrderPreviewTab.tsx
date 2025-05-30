
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UniformPreview } from "@/components/ui/uniform-preview";
import { formatCurrency } from "@/utils/format-utils";
import { Player, Logo, PrintConfig, DesignData, ProductLine } from "@/types";
import { useRef } from "react";

interface OrderPreviewTabProps {
  players: Player[];
  logos: Logo[];
  printConfig: PrintConfig;
  designData: Partial<DesignData>;
  productLines: ProductLine[];
  calculateTotalCost: () => number;
  isGeneratingDesign: boolean;
  isDemoApproved: boolean;
  onApproveDemo: () => void;
  jerseyCanvasRef?: React.RefObject<HTMLCanvasElement>;
  pantCanvasRef?: React.RefObject<HTMLCanvasElement>;
}

export function OrderPreviewTab({
  players,
  logos,
  printConfig,
  designData,
  productLines,
  calculateTotalCost,
  isGeneratingDesign,
  isDemoApproved,
  onApproveDemo,
  jerseyCanvasRef,
  pantCanvasRef
}: OrderPreviewTabProps) {
  // Create refs if not provided
  const defaultJerseyCanvasRef = useRef<HTMLCanvasElement>(null);
  const defaultPantCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const jerseyRef = jerseyCanvasRef || defaultJerseyCanvasRef;
  const pantRef = pantCanvasRef || defaultPantCanvasRef;

  if (players.length === 0) {
    return <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Chưa có cầu thủ</AlertTitle>
        <AlertDescription>
          Vui lòng thêm ít nhất một cầu thủ vào danh sách để xem trước thiết kế.
        </AlertDescription>
      </Alert>;
  }

  const currentPlayer = players[0];
  const teamName = currentPlayer.line_3 || 
                   currentPlayer.name?.split(' ')?.[0] || 
                   "TEAM";

  return <div className="space-y-6">
      <UniformPreview 
        teamName={teamName} 
        players={players} 
        logos={logos} 
        printConfig={printConfig} 
        designData={designData} 
        jerseyCanvasRef={jerseyRef} 
        pantCanvasRef={pantRef} 
      />
      
      <div className="text-center p-2 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-600">Nhắn tin với nhân viên hỗ trợ để được lên demo chi tiết hơn nếu quý khách hàng muốn ạ!</p>
      </div>
      
      {productLines.length > 0 && <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chi phí ước tính</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {formatCurrency(calculateTotalCost())}
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  * Đây chỉ là giá ước tính. Chi phí có thể thay đổi tùy thuộc vào yêu cầu cụ thể.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={onApproveDemo} disabled={isGeneratingDesign} className="w-full">
                {isGeneratingDesign ? "Đang xử lý..." : isDemoApproved ? "Đã duyệt thiết kế" : "Duyệt thiết kế demo"}
              </Button>
            </CardFooter>
          </Card>
        </div>}
    </div>;
}
