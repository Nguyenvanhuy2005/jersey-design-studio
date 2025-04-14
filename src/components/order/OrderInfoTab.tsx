import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { CustomerForm } from "@/components/customer-form";
import { PrintGlobalSettings } from "@/components/print-global-settings";
import { LogoUpload } from "@/components/logo-upload";
import { PlayerForm } from "@/components/player-form";
import { Customer, Logo, Player } from "@/types";

interface OrderInfoTabProps {
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
  onNotesChange: (notes: string) => void;
  onGenerateProductLines: () => void;
}

export function OrderInfoTab({
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
  onGenerateProductLines
}: OrderInfoTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <CustomerForm 
          initialCustomer={customerInfo}
          onCustomerInfoChange={onCustomerInfoChange} 
        />
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh tham khảo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {referenceImagesPreview.map((preview, index) => (
                  <div key={index} className="relative rounded-md overflow-hidden border aspect-square">
                    <img 
                      src={preview} 
                      alt={`Reference ${index}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 w-6 h-6"
                      onClick={() => onRemoveReferenceImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {referenceImages.length < 5 && (
                  <div className="border border-dashed rounded-md flex items-center justify-center aspect-square">
                    <Label htmlFor="reference-images" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                      <span className="text-2xl">+</span>
                      <span className="text-xs text-center">Tải lên hình ảnh</span>
                      <Input
                        id="reference-images"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => onReferenceImagesUpload(e.target.files)}
                      />
                    </Label>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Tối đa 5 hình ảnh. Hình ảnh tham khảo sẽ giúp chúng tôi hiểu rõ hơn về thiết kế bạn mong muốn.
              </p>
            </CardContent>
          </Card>
          
          <PrintGlobalSettings 
            fontTextOptions={["Arial", "Times New Roman", "Impact", "Comic Sans MS"]}
            fontText={fontText}
            onFontTextChange={onFontTextChange}
            fontNumberOptions={["Arial", "Times New Roman", "Impact", "Comic Sans MS"]}
            fontNumber={fontNumber}
            onFontNumberChange={onFontNumberChange}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Tải lên logo</CardTitle>
            </CardHeader>
            <CardContent>
              <LogoUpload 
                logos={logos} 
                onLogosChange={onLogosChange} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Thông tin in ấn</CardTitle>
          {players.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerateProductLines}
            >
              Tạo danh sách sản phẩm in
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <PlayerForm
            players={players}
            onPlayersChange={onPlayersChange}
            logos={logos}
            fontSize={fontText}
            fontNumber={fontNumber}
            printStyleOptions={["In chuyển nhiệt", "In decal"]}
            printColorOptions={["Đen", "Trắng", "Vàng", "Đỏ", "Xanh dương", "Xanh lá"]}
            printStyle={printStyle}
            printColor={printColor}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ghi chú đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Nhập ghi chú cho đơn hàng (không bắt buộc)"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
