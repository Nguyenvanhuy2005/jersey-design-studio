import React from "react";
import { Customer, DeliveryInformation, Logo, Player } from "@/types";
import { CustomerForm } from "@/components/customer-form";
import { DeliveryForm } from "@/components/delivery-form";
import { UniformInfoForm } from "@/components/uniform-info-form";
import { PlayerForm } from "@/components/player-form";
import { LogoUpload } from "@/components/logo-upload";
import { PrintGlobalSettings } from "@/components/print-global-settings";
import { Separator } from "@/components/ui/separator";
interface OrderInfoTabContentProps {
  customerInfo: Customer;
  onCustomerInfoChange: (customer: Customer) => void;
  deliveryInfo: DeliveryInformation;
  onDeliveryInfoChange: (info: DeliveryInformation) => void;
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
  isAdminMode?: boolean;
  selectedCustomer?: Customer | null;
  onCustomerSelect?: (customer: Customer) => void;
}
export function OrderInfoTabContent({
  customerInfo,
  onCustomerInfoChange,
  deliveryInfo,
  onDeliveryInfoChange,
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
  isAdminMode = false,
  selectedCustomer = null,
  onCustomerSelect
}: OrderInfoTabContentProps) {
  return <div className="space-y-6">
      <CustomerForm onCustomerInfoChange={onCustomerInfoChange} initialCustomer={customerInfo} isAdminMode={isAdminMode} selectedCustomer={selectedCustomer} onCustomerSelect={onCustomerSelect} />
      
      <Separator />
      
      <DeliveryForm initialDelivery={deliveryInfo} onDeliveryInfoChange={onDeliveryInfoChange} />
      
      
      
      <UniformInfoForm teamName={notes} onTeamNameChange={onNotesChange} uniformType="player" onUniformTypeChange={() => {}} designData={{}} onDesignDataChange={() => {}} />
      
      <Separator />
      
      <PrintGlobalSettings fontTextOptions={[fontText]} fontText={fontText} onFontTextChange={onFontTextChange} fontNumberOptions={[fontNumber]} fontNumber={fontNumber} onFontNumberChange={onFontNumberChange} />
      
      <Separator />
      
      <LogoUpload logos={logos} onLogosChange={onLogosChange} />
      
      <Separator />
      
      <PlayerForm players={players} onPlayersChange={onPlayersChange} logos={logos} fontSize={fontText} fontNumber={fontNumber} printStyleOptions={[printStyle]} printColorOptions={[printColor]} printStyle={printStyle} printColor={printColor} />
    </div>;
}