
import React, { useRef } from "react";
import { Layout } from "@/components/layout/layout";
import { AuthCheck } from "@/components/auth/AuthCheck";
import { useOrderForm } from "@/hooks/useOrderForm";
import { useOrderProductLines } from "@/hooks/useOrderProductLines";
import { useOrderCosts } from "@/hooks/useOrderCosts";
import { useOrderSubmission } from "@/hooks/useOrderSubmission";
import { validateOrderForm } from "@/components/order/OrderFormValidation";
import { useAuth } from "@/contexts/AuthContext";
import { OrderPageHeader } from "@/components/order/create-order/OrderPageHeader";
import { OrderTabs } from "@/components/order/create-order/OrderTabs";
import { toast } from "sonner";

const CreateOrder = () => {
  const jerseyCanvasRef = useRef<HTMLCanvasElement>(null);
  const pantCanvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();
  
  const {
    activeTab,
    setActiveTab,
    isSubmitting,
    setIsSubmitting,
    isGeneratingDesign,
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
    deliveryInfo,
    setDeliveryInfo,
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

  // Get printing breakdown for summary tab
  const { calculateTotalCost, getPlayerAndGoalkeeperCounts, getPrintCostBreakdown } = useOrderCosts(players, productLines);
  
  const { submitOrder } = useOrderSubmission({
    user,
    players,
    logos,
    designData,
    notes,
    customerInfo,
    deliveryInfo,
    productLines,
    referenceImages,
    totalCost: calculateTotalCost(),
    setIsSubmitting,
    fontText,
    fontNumber,
    printStyle,
    printColor
  });

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

  return (
    <Layout>
      <AuthCheck>
        <div className="container mx-auto py-6 space-y-6">
          <OrderPageHeader
            activeTab={activeTab}
            isDemoApproved={isDemoApproved}
            isSubmitting={isSubmitting}
            isGeneratingDesign={isGeneratingDesign}
            onViewDemo={handleViewDemo}
            onApproveDemo={approveDemo}
            onSubmitOrder={submitOrder}
          />
          
          <OrderTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            customerInfo={customerInfo}
            onCustomerInfoChange={setCustomerInfo}
            deliveryInfo={deliveryInfo}
            onDeliveryInfoChange={setDeliveryInfo}
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
            printConfig={printConfig}
            designData={designData}
            productLines={productLines}
            calculateTotalCost={calculateTotalCost}
            isGeneratingDesign={isGeneratingDesign}
            isDemoApproved={isDemoApproved}
            onApproveDemo={approveDemo}
            jerseyCanvasRef={jerseyCanvasRef}
            pantCanvasRef={pantCanvasRef}
            onSubmitOrder={submitOrder}
            isSubmitting={isSubmitting}
            getPlayerAndGoalkeeperCounts={getPlayerAndGoalkeeperCounts}
            getPrintCostBreakdown={getPrintCostBreakdown}
          />
        </div>
      </AuthCheck>
    </Layout>
  );
};

export default CreateOrder;
