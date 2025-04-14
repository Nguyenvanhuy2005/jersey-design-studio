
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthCheck } from "@/components/auth/AuthCheck";
import { useOrderForm } from "@/hooks/useOrderForm";
import { useOrderProductLines } from "@/hooks/useOrderProductLines";
import { useOrderCosts } from "@/hooks/useOrderCosts";
import { useOrderSubmission } from "@/hooks/useOrderSubmission";
import { validateOrderForm } from "@/components/order/OrderFormValidation";
import { OrderInfoTab } from "@/components/order/OrderInfoTab";
import { OrderPreviewTab } from "@/components/order/OrderPreviewTab";
import { OrderSummaryTab } from "@/components/order/OrderSummaryTab";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { JerseyPreviewHelper } from "@/components/jersey/PreviewHelper";

const CreateOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const jerseyCanvasRef = useRef<HTMLCanvasElement>(null);
  const pantCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Preview image URLs for different views
  const [frontPreviewUrl, setFrontPreviewUrl] = useState<string>('');
  const [backPreviewUrl, setBackPreviewUrl] = useState<string>('');
  const [pantsPreviewUrl, setPantsPreviewUrl] = useState<string>('');
  
  const {
    activeTab,
    setActiveTab,
    isSubmitting,
    setIsSubmitting,
    isGeneratingDesign,
    setIsGeneratingDesign,
    isDemoApproved,
    setIsDemoApproved,
    players,
    setPlayers,
    logos,
    setLogos,
    notes,
    setNotes,
    referenceImages,
    referenceImagesPreview,
    customerInfo,
    setCustomerInfo,
    fontText,
    setFontText,
    fontNumber,
    setFontNumber,
    printStyle,
    setPrintStyle,
    printColor,
    setPrintColor,
    designData,
    setDesignData,
    printConfig,
    productLines,
    setProductLines,
    handleReferenceImagesUpload,
    removeReferenceImage
  } = useOrderForm();
  
  const { generateProductLines } = useOrderProductLines(
    players,
    logos,
    printStyle,
    fontText,
    fontNumber,
    printColor,
    setDesignData,
    setProductLines
  );

  const { calculateTotalCost, getPlayerAndGoalkeeperCounts } = useOrderCosts(players, productLines);
  
  const { submitOrder } = useOrderSubmission({
    user,
    players,
    logos,
    designData,
    notes,
    customerInfo,
    productLines,
    referenceImages,
    totalCost: calculateTotalCost(),
    setIsSubmitting,
    fontText,
    fontNumber,
    printStyle,
    printColor
  });

  // Use the JerseyPreviewHelper to generate preview images
  const handleFrontPreviewRender = (imageUrl: string) => {
    setFrontPreviewUrl(imageUrl);
  };
  
  const handleBackPreviewRender = (imageUrl: string) => {
    setBackPreviewUrl(imageUrl);
  };
  
  const handlePantsPreviewRender = (imageUrl: string) => {
    setPantsPreviewUrl(imageUrl);
  };

  const handleViewDemo = () => {
    if (!validateOrderForm({ players, customerInfo })) return;
    
    generateProductLines();
    
    setActiveTab("preview");
  };

  const approveDemo = () => {
    setIsDemoApproved(true);
    toast.success("Đã duyệt thiết kế demo. Tiếp tục để hoàn tất đơn hàng.");
    setActiveTab("summary");
  };
  
  const handleSubmitOrder = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt đơn hàng");
      return;
    }
    
    if (!isDemoApproved) {
      toast.error("Vui lòng duyệt demo trước khi đặt đơn hàng");
      setActiveTab("preview");
      return;
    }
    
    if (!validateOrderForm({ players, customerInfo })) {
      setActiveTab("info");
      return;
    }
    
    if (productLines.length === 0) {
      generateProductLines();
    }
    
    submitOrder(jerseyCanvasRef, pantCanvasRef);
  };

  // Get a representative player for preview
  const previewPlayer = players.length > 0 ? players[0] : null;

  return (
    <Layout>
      <AuthCheck>
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Tạo đơn hàng mới</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
              >
                Hủy
              </Button>
              
              {activeTab !== "preview" ? (
                <Button onClick={handleViewDemo}>
                  Xem thiết kế demo
                </Button>
              ) : (
                <Button 
                  onClick={approveDemo}
                  disabled={isGeneratingDesign}
                >
                  {isGeneratingDesign ? "Đang xử lý..." : "Duyệt thiết kế demo"}
                </Button>
              )}
              
              {isDemoApproved && (
                <Button 
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || isGeneratingDesign}
                >
                  {isSubmitting ? "Đang xử lý..." : "Đặt đơn hàng"}
                </Button>
              )}
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Thông tin</TabsTrigger>
              <TabsTrigger value="preview">Thiết kế</TabsTrigger>
              <TabsTrigger value="summary">Tổng kết</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info">
              <OrderInfoTab
                customerInfo={customerInfo}
                onCustomerInfoChange={setCustomerInfo}
                referenceImages={referenceImages}
                referenceImagesPreview={referenceImagesPreview}
                onReferenceImagesUpload={handleReferenceImagesUpload}
                onRemoveReferenceImage={removeReferenceImage}
                fontText={fontText}
                fontNumber={fontNumber}
                printStyle={printStyle}
                printColor={printColor}
                onFontTextChange={setFontText}
                onFontNumberChange={setFontNumber}
                onPrintStyleChange={setPrintStyle}
                onPrintColorChange={setPrintColor}
                logos={logos}
                onLogosChange={setLogos}
                players={players}
                onPlayersChange={setPlayers}
                notes={notes}
                onNotesChange={setNotes}
                onGenerateProductLines={generateProductLines}
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
                onApproveDemo={approveDemo}
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
                onProductLinesChange={setProductLines}
                isSubmitting={isSubmitting}
                isGeneratingDesign={isGeneratingDesign}
                onSubmitOrder={handleSubmitOrder}
                jerseyCanvasRef={jerseyCanvasRef}
                pantCanvasRef={pantCanvasRef}
                referenceImagesPreview={referenceImagesPreview}
              />
            </TabsContent>
          </Tabs>
          
          {/* Hidden preview generators - they render jersey images for different views */}
          {previewPlayer && (
            <>
              <div className="hidden">
                <JerseyPreviewHelper
                  view="front"
                  player={previewPlayer}
                  logos={logos}
                  printConfig={printConfig}
                  designData={designData}
                  onRender={handleFrontPreviewRender}
                />
                <JerseyPreviewHelper
                  view="back"
                  player={previewPlayer}
                  logos={logos}
                  printConfig={printConfig}
                  designData={designData}
                  onRender={handleBackPreviewRender}
                />
                <JerseyPreviewHelper
                  view="pants"
                  player={previewPlayer}
                  logos={logos.filter(logo => logo.position === 'pants')}
                  printConfig={printConfig}
                  designData={{
                    ...designData,
                    pants_number: { enabled: designData?.pants_number?.enabled ?? false }
                  }}
                  onRender={handlePantsPreviewRender}
                />
              </div>
            </>
          )}
        </div>
      </AuthCheck>
    </Layout>
  );
};

export default CreateOrder;
