
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UniformPreview } from "@/components/ui/uniform-preview";
import { formatCurrency } from "@/utils/format-utils";
import { Player, Logo, PrintConfig, DesignData, ProductLine } from "@/types";
interface OrderPreviewTabContentProps {
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
export function OrderPreviewTabContent({
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
}: OrderPreviewTabContentProps) {
  if (players.length === 0) {
    return <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Chưa có cầu thủ</AlertTitle>
        <AlertDescription>
          Vui lòng thêm ít nhất một cầu thủ vào danh sách để xem trước thiết kế.
        </AlertDescription>
      </Alert>;
  }

  // Log the current font settings to help debug
  console.log("OrderPreviewTabContent fonts:", {
    textFont: designData?.font_text?.font,
    numberFont: designData?.font_number?.font,
    printConfigFont: printConfig?.font
  });

  // Modify team name logic to be empty if no line_3 or name
  const currentPlayer = players[0];
  const teamName = currentPlayer.line_3 || (currentPlayer.line_3 === '' ? '' : currentPlayer.name?.split(' ')?.[0] || '');

  // Ensure designData includes the latest font settings
  const enhancedDesignData: Partial<DesignData> = {
    ...designData,
    font_text: {
      font: designData?.font_text?.font || printConfig?.font || 'Arial'
    },
    font_number: {
      font: designData?.font_number?.font || printConfig?.font || 'Arial'
    }
  };
  
  // Log the enhanced design data to help with debugging
  console.log("Enhanced design data:", enhancedDesignData);
  
  return <div className="space-y-6">
      <UniformPreview 
        teamName={teamName} 
        players={players} 
        logos={logos} 
        printConfig={printConfig} 
        designData={enhancedDesignData} 
        jerseyCanvasRef={jerseyCanvasRef} 
        pantCanvasRef={pantCanvasRef} 
      />

      <div className="text-center p-2 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-600">Demo tham khảo cho quý khách ạ, kích thước có thể sẽ thay đổi tùy thuộc vào số lượng chữ cần in của quý khách</p>
      </div>

      {productLines.length > 0 && <Card>
          
          
          
        </Card>}
    </div>;
}
