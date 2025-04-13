
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PrintInfoForm } from "@/components/print-info-form";
import { PrintConfigForm } from "@/components/print-config-form";
import { ReferenceImages } from "@/components/order/ReferenceImages";
import { DesignData, PrintConfig } from "@/types";

interface OrderInfoTabProps {
  teamName: string;
  onTeamNameChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  designData: DesignData;
  onDesignDataChange: (data: DesignData) => void;
  printConfig: PrintConfig;
  onPrintConfigChange: (config: PrintConfig) => void;
  referenceImages: File[];
  onReferenceImagesChange: (images: File[]) => void;
  referenceImagesPreview: string[];
  onReferenceImagesPreviewChange: (previews: string[]) => void;
  onExcelUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
}

export function OrderInfoTab({
  teamName,
  onTeamNameChange,
  notes,
  onNotesChange,
  designData,
  onDesignDataChange,
  printConfig,
  onPrintConfigChange,
  referenceImages,
  onReferenceImagesChange,
  referenceImagesPreview,
  onReferenceImagesPreviewChange,
  onExcelUpload,
  onNext
}: OrderInfoTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="team-name">Tên đội</Label>
          <Input
            id="team-name"
            value={teamName}
            onChange={(e) => onTeamNameChange(e.target.value)}
            placeholder="Nhập tên đội"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Ghi chú</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Thêm ghi chú hoặc yêu cầu đặc biệt"
            className="h-32"
          />
        </div>
        
        <PrintInfoForm
          designData={designData}
          onDesignDataChange={onDesignDataChange}
          onExcelUpload={onExcelUpload}
        />
        
        <ReferenceImages
          referenceImages={referenceImages}
          referenceImagesPreview={referenceImagesPreview}
          onReferenceImagesChange={onReferenceImagesChange}
          onReferenceImagesPreviewChange={onReferenceImagesPreviewChange}
        />
        
        <PrintConfigForm
          printConfig={printConfig}
          onPrintConfigChange={onPrintConfigChange}
        />
        
        <div className="flex justify-end">
          <Button onClick={onNext}>
            Tiếp theo: Cầu thủ
          </Button>
        </div>
      </div>
    </div>
  );
}
