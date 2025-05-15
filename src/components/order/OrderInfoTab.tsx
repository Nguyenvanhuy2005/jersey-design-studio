import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, AlertCircle } from "lucide-react";
import { CustomerForm } from "@/components/customer-form";
import { PrintGlobalSettings } from "@/components/print-global-settings";
import { LogoUpload } from "@/components/logo-upload";
import { PlayerForm } from "@/components/player-form";
import { Customer, Logo, Player } from "@/types";
import { useState } from "react";
import { toast } from "sonner";

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
  onViewDemo?: () => void;
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
  onGenerateProductLines,
  onViewDemo
}: OrderInfoTabProps) {
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<number, boolean>>({});
  
  // Enhanced image error handling with more detailed logging
  const handleImageError = (index: number, event: React.SyntheticEvent<HTMLImageElement>) => {
    const imageUrl = referenceImagesPreview[index];
    const fileType = referenceImages[index]?.type || 'unknown';
    const fileName = referenceImages[index]?.name || 'unknown';
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'unknown';
    
    console.error(`Error loading reference image ${index}: ${imageUrl}`);
    console.error(`Image details - Type: ${fileType}, Name: ${fileName}, Extension: ${fileExtension}`);
    
    setImageLoadErrors(prev => ({ ...prev, [index]: true }));
    
    // Show toast for image loading failure with more details
    toast.error(`Không thể tải hình ảnh tham khảo #${index + 1} (${fileExtension})`);
  };

  // Enhanced file upload validation
  const handleFileUpload = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    
    // Check for valid image types with better JPG handling
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    // Log detailed file information for debugging
    Array.from(fileList).forEach(file => {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      console.log(`File upload - Name: ${file.name}, Type: ${file.type}, Extension: ${extension}, Size: ${file.size} bytes`);
      
      // Special handling for JPG files
      if ((extension === 'jpg' || extension === 'jpeg') && file.type !== 'image/jpeg') {
        console.warn(`JPG file with incorrect MIME type: ${file.name}, type: ${file.type}`);
      }
    });
    
    const allFilesValid = Array.from(fileList).every(file => {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      
      // Special handling for JPG files with incorrect MIME type
      if ((extension === 'jpg' || extension === 'jpeg') && !validTypes.includes(file.type.toLowerCase())) {
        console.warn(`Accepting JPG file despite incorrect MIME type: ${file.name}, type: ${file.type}`);
        return true;
      }
      
      return validTypes.includes(file.type.toLowerCase());
    });
    
    if (!allFilesValid) {
      toast.warning("Chỉ chấp nhận các định dạng hình ảnh: JPG, PNG, GIF, WebP");
      return;
    }
    
    // Reset errors when new images are uploaded
    setImageLoadErrors({});
    onReferenceImagesUpload(fileList);
  };

  
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
                    {imageLoadErrors[index] ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-muted rounded-md">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {referenceImages[index]?.name ? (
                            <>
                              Không thể tải hình ảnh<br/>
                              <span className="text-xs">{referenceImages[index].name}</span>
                            </>
                          ) : (
                            "Không thể tải hình ảnh"
                          )}
                        </p>
                      </div>
                    ) : (
                      <img 
                        src={preview} 
                        alt={`Reference ${index}`}
                        className="w-full h-full object-contain" // Changed from object-cover to object-contain
                        onError={(e) => handleImageError(index, e)}
                      />
                    )}
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
                        accept="image/*" // Accept all image types
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files)}
                      />
                    </Label>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Tối đa 5 hình ảnh (JPG, PNG). Hình ảnh tham khảo sẽ giúp chúng tôi hiểu rõ hơn về thiết kế bạn mong muốn.
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
        <CardHeader>
          <CardTitle>Thông tin in ấn</CardTitle>
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
        <CardFooter className="flex justify-end">
          {onViewDemo && (
            <Button 
              onClick={onViewDemo}
              variant="default"
            >
              Xem thiết kế demo
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
