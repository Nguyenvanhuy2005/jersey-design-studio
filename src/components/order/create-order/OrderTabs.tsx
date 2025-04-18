
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderInfoTab } from "@/components/order/OrderInfoTab";
import { OrderPreviewTab } from "@/components/order/OrderPreviewTab";
import { OrderSummaryTab } from "@/components/order/OrderSummaryTab";
import { Customer, Logo, Player, ProductLine } from "@/types";

interface OrderTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  customerInfo: Customer;
  onCustomerInfoChange: (customer: Customer) => void;
  referenceImages: File[];
  referenceImagesPreview: string[];
  onReferenceImagesUpload: (fileList: FileList | null) => void;
  onRemoveReferenceImage: (index: number) => void;
  fontText: string;
  fontNumber: string;
  printStyle: string;
  printColor: string;
  onFontTextChange: (value: string) => void;
  onFontNumberChange: (value: string) => void;
  onPrintStyleChange: (value: string) => void;
  onPrintColorChange: (value: string) => void;
  logos: Logo[];
  onLogosChange: (logos: Logo[]) => void;
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  onGenerateProductLines: () => void;
  printConfig: any;
  designData: any;
  productLines: ProductLine[];
  calculateTotalCost: () => number;
  isGeneratingDesign: boolean;
  isDemoApproved: boolean;
  onApproveDemo: () => void;
  jerseyCanvasRef: React.RefObject<HTMLCanvasElement>;
  pantCanvasRef: React.RefObject<HTMLCanvasElement>;
  onSubmitOrder: () => void;
  isSubmitting: boolean;
  getPlayerAndGoalkeeperCounts: () => { playerCount: number; goalkeeperCount: number };
}

export function OrderTabs({
  activeTab,
  setActiveTab,
  customerInfo,
  onCustomerInfoChange,
  referenceImages,
  referenceImagesPreview,
  onReferenceImagesUpload,
  onRemoveReferenceImage,
  fontText,
  fontNumber,
  printStyle,
  printColor,
  onFontTextChange,
  onFontNumberChange,
  onPrintStyleChange,
  onPrintColorChange,
  logos,
  onLogosChange,
  players,
  onPlayersChange,
  notes,
  onNotesChange,
  onGenerateProductLines,
  printConfig,
  designData,
  productLines,
  calculateTotalCost,
  isGeneratingDesign,
  isDemoApproved,
  onApproveDemo,
  jerseyCanvasRef,
  pantCanvasRef,
  onSubmitOrder,
  isSubmitting,
  getPlayerAndGoalkeeperCounts
}: OrderTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="info">Thông tin</TabsTrigger>
        <TabsTrigger value="preview">Thiết kế</TabsTrigger>
        <TabsTrigger value="summary">Tổng kết</TabsTrigger>
      </TabsList>
      
      <TabsContent value="info">
        <OrderInfoTab
          customerInfo={customerInfo}
          onCustomerInfoChange={onCustomerInfoChange}
          referenceImages={referenceImages}
          referenceImagesPreview={referenceImagesPreview}
          onReferenceImagesUpload={onReferenceImagesUpload}
          onRemoveReferenceImage={onRemoveReferenceImage}
          fontText={fontText}
          fontNumber={fontNumber}
          printStyle={printStyle}
          printColor={printColor}
          onFontTextChange={onFontTextChange}
          onFontNumberChange={onFontNumberChange}
          onPrintStyleChange={onPrintStyleChange}
          onPrintColorChange={onPrintColorChange}
          logos={logos}
          onLogosChange={onLogosChange}
          players={players}
          onPlayersChange={onPlayersChange}
          notes={notes}
          onNotesChange={onNotesChange}
          onGenerateProductLines={onGenerateProductLines}
        />
      </TabsContent>
      
      <TabsContent value="preview">
        <OrderPreviewTab 
          players={players}
          logos={logos}
          printConfig={printConfig}
          designData={designData}
          productLines={productLines}
          calculateTotalCost={calculateTotalCost}
          isGeneratingDesign={isGeneratingDesign}
          isDemoApproved={isDemoApproved}
          onApproveDemo={onApproveDemo}
          jerseyCanvasRef={jerseyCanvasRef}
          pantCanvasRef={pantCanvasRef}
        />
      </TabsContent>
      
      <TabsContent value="summary">
        <OrderSummaryTab 
          isDemoApproved={isDemoApproved}
          players={players}
          logos={logos}
          productLines={productLines}
          customerInfo={customerInfo}
          calculateTotalCost={calculateTotalCost}
          getPlayerAndGoalkeeperCounts={getPlayerAndGoalkeeperCounts}
          onProductLinesChange={() => {}}
          isSubmitting={isSubmitting}
          isGeneratingDesign={isGeneratingDesign}
          onSubmitOrder={onSubmitOrder}
          referenceImagesPreview={referenceImagesPreview}
        />
      </TabsContent>
    </Tabs>
  );
}
