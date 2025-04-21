
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Customer, Logo, Player, ProductLine } from "@/types";
import { OrderInfoTabContent } from "./tabs/OrderInfoTabContent";
import { OrderPreviewTabContent } from "./tabs/OrderPreviewTabContent";
import { OrderSummaryTabContent } from "./tabs/OrderSummaryTabContent";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

const TAB_ORDER = ["info", "preview", "summary"] as const;

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
  // Determine the active tab index for navigation logic
  const tabIndex = TAB_ORDER.indexOf(activeTab as typeof TAB_ORDER[number]);

  // Handlers for navigation buttons
  const goPrev = () => {
    if (tabIndex > 0) {
      setActiveTab(TAB_ORDER[tabIndex - 1]);
    }
  };
  const goNext = () => {
    if (tabIndex < TAB_ORDER.length - 1) {
      setActiveTab(TAB_ORDER[tabIndex + 1]);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="info">Thông tin</TabsTrigger>
        <TabsTrigger value="preview">Thiết kế</TabsTrigger>
        <TabsTrigger value="summary">Tổng kết</TabsTrigger>
      </TabsList>
      
      <TabsContent value="info">
        <div className="flex flex-col h-full min-h-[70vh]">
          <div className="flex-1">
            <OrderInfoTabContent
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
              onFontTextChange={(value) => {
                onFontTextChange(value);
                console.log('Font text updated:', value);
              }}
              onFontNumberChange={(value) => {
                onFontNumberChange(value);
                console.log('Font number updated:', value);
              }}
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
          </div>
          {/* Navigation bottom bar */}
          <div className="w-full flex justify-end gap-2 mt-8">
            <Button onClick={goNext} variant="default" size="lg" className="ml-auto flex items-center gap-2">
              Tiếp theo <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="preview">
        <div className="flex flex-col h-full min-h-[70vh]">
          <div className="flex-1">
            <OrderPreviewTabContent
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
          </div>
          {/* Navigation bottom bar */}
          <div className="w-full flex justify-between gap-2 mt-8">
            <Button onClick={goPrev} variant="outline" size="lg" className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Quay lại
            </Button>
            <Button onClick={goNext} variant="default" size="lg" className="flex items-center gap-2">
              Tiếp theo <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="summary">
        <div className="flex flex-col h-full min-h-[70vh]">
          <div className="flex-1">
            <OrderSummaryTabContent
              isDemoApproved={isDemoApproved}
              players={players}
              productLines={productLines}
              customerInfo={customerInfo}
              calculateTotalCost={calculateTotalCost}
              getPlayerAndGoalkeeperCounts={getPlayerAndGoalkeeperCounts}
              isSubmitting={isSubmitting}
              isGeneratingDesign={isGeneratingDesign}
              onSubmitOrder={onSubmitOrder}
              referenceImagesPreview={referenceImagesPreview}
            />
          </div>
          {/* Navigation bottom bar */}
          <div className="w-full flex justify-start gap-2 mt-8">
            <Button onClick={goPrev} variant="outline" size="lg" className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Quay lại
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

