
import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerForm } from "@/components/player-form";
import { PrintConfigForm } from "@/components/print-config-form";
import { ProductLineTable } from "@/components/product-line-table";
import { OrderSummary } from "@/components/order-summary";
import { CanvasJersey } from "@/components/ui/canvas-jersey";
import { LogoUpload } from "@/components/logo-upload";
import { Logo, Player, PrintConfig, ProductLine } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { X } from "lucide-react";
import { 
  createStorageBucketsIfNeeded, 
  uploadDesignImage, 
  verifyImageUpload,
  checkFileExistsInStorage 
} from "@/utils/image-utils";

const CreateOrder = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [previewPlayer, setPreviewPlayer] = useState<number>(0);
  const [previewView, setPreviewView] = useState<'front' | 'back'>('front');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);
  
  const [teamName, setTeamName] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [referenceImagesPreview, setReferenceImagesPreview] = useState<string[]>([]);
  
  const jerseyCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [printConfig, setPrintConfig] = useState<PrintConfig>({
    font: "Arial",
    backMaterial: "In chuyển nhiệt",
    backColor: "Đen",
    frontMaterial: "In chuyển nhiệt",
    frontColor: "Đen",
    sleeveMaterial: "In chuyển nhiệt",
    sleeveColor: "Đen",
    legMaterial: "In chuyển nhiệt",
    legColor: "Đen"
  });
  
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  
  const handleReferenceImagesUpload = (fileList: FileList | null) => {
    if (!fileList) return;
    
    const newFiles = Array.from(fileList);
    const updatedFiles = [...referenceImages];
    const updatedPreviews = [...referenceImagesPreview];
    
    const filesToAdd = newFiles.slice(0, 5 - referenceImages.length);
    
    filesToAdd.forEach(file => {
      updatedFiles.push(file);
      updatedPreviews.push(URL.createObjectURL(file));
    });
    
    setReferenceImages(updatedFiles);
    setReferenceImagesPreview(updatedPreviews);
    
    if (filesToAdd.length < newFiles.length) {
      toast.warning("Chỉ có thể tải lên tối đa 5 hình ảnh tham khảo.");
    }
  };
  
  const removeReferenceImage = (index: number) => {
    const updatedFiles = [...referenceImages];
    const updatedPreviews = [...referenceImagesPreview];
    
    URL.revokeObjectURL(updatedPreviews[index]);
    
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    
    setReferenceImages(updatedFiles);
    setReferenceImagesPreview(updatedPreviews);
  };
  
  useEffect(() => {
    return () => {
      referenceImagesPreview.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);
  
  const generateProductLines = useCallback(() => {
    if (players.length === 0) return;

    const hasPlayersWithImages = players.some(p => p.printImage);
    
    let newProductLines: ProductLine[] = [
      {
        id: `product-back-number-${Date.now()}`,
        product: "Áo thi đấu",
        position: "In số lưng",
        material: printConfig.backMaterial,
        size: "Lớn",
        points: 1,
        content: "Số áo"
      }
    ];
    
    if (players.some(p => p.name && p.name.trim() !== "")) {
      newProductLines.push({
        id: `product-above-back-${Date.now() + 1}`,
        product: "Áo thi đấu",
        position: "In trên số lưng",
        material: printConfig.backMaterial,
        size: "Trung bình",
        points: 1,
        content: "Tên cầu thủ"
      });
    }
    
    if (teamName.trim() !== "") {
      newProductLines.push({
        id: `product-below-back-${Date.now() + 2}`,
        product: "Áo thi đấu",
        position: "In dưới số lưng",
        material: printConfig.backMaterial,
        size: "Nhỏ",
        points: 1,
        content: teamName
      });
    }
    
    if (hasPlayersWithImages) {
      newProductLines.push({
        id: `product-front-number-${Date.now() + 3}`,
        product: "Áo thi đấu",
        position: "In số giữa bụng",
        material: printConfig.frontMaterial,
        size: "Trung bình",
        points: 1,
        content: "Số áo"
      });
    }
    
    logos.forEach((logo, index) => {
      let position = '';
      let logoPosition = '';
      
      switch (logo.position) {
        case 'chest_left':
          position = 'In logo ngực trái';
          break;
        case 'chest_right':
          position = 'In logo ngực phải';
          break;
        case 'chest_center':
          position = 'In logo giữa bụng';
          break;
        case 'sleeve_left':
          position = 'In logo tay trái';
          break;
        case 'sleeve_right':
          position = 'In logo tay phải';
          break;
        default:
          position = 'In logo ngực trái';
      }
      
      const logoName = logo.file.name.split('/').pop()?.split('.')[0] || `Logo ${index + 1}`;
      
      newProductLines.push({
        id: `product-logo-${Date.now() + 4 + index}`,
        product: "Áo thi đấu",
        position,
        material: printConfig.frontMaterial,
        size: "Trung bình",
        points: 1,
        content: logoName
      });
    });
    
    setProductLines(newProductLines);
  }, [players, teamName, printConfig, logos]);

  const calculateTotalCost = useCallback(() => {
    let totalCost = 0;
    
    productLines.forEach(line => {
      let unitCost = 10000;
      
      if (line.position.includes("logo")) {
        unitCost = 20000;
      }
      
      totalCost += unitCost * players.length;
    });

    totalCost += logos.length * 20000;
    
    return totalCost;
  }, [productLines, players.length, logos.length]);

  const convertCanvasToFile = async (canvas: HTMLCanvasElement, orderId: string, fileName: string): Promise<File> => {
    console.log("Converting canvas to file...");
    const imageData = canvas.toDataURL('image/png');
    
    const base64String = imageData.split(',')[1];
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    
    const file = new File([blob], fileName, { type: 'image/png' });
    console.log("Canvas converted to file successfully, size:", (file.size / 1024).toFixed(2), "KB");
    
    return file;
  };

  const generateOrderDesignImages = async (orderId: string): Promise<{ frontPath: string; backPath: string }> => {
    try {
      setIsGeneratingDesign(true);
      
      const bucketsCheck = await createStorageBucketsIfNeeded();
      if (!bucketsCheck.success) {
        console.error("Failed to ensure storage buckets exist:", bucketsCheck.message);
        toast.error(`Không thể khởi tạo kho lưu trữ: ${bucketsCheck.message}`);
        return { frontPath: '', backPath: '' };
      }
      
      if (!jerseyCanvasRef.current) {
        console.error("Canvas reference is not available");
        toast.error("Không thể tạo ảnh thiết kế: Canvas không khả dụng");
        return { frontPath: '', backPath: '' };
      }
      
      console.log("Capturing front view design...");
      setPreviewView('front');
      
      console.log("Waiting for front view canvas to render...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const frontFileName = `front-design-${orderId}.png`;
      const frontDesignFile = await convertCanvasToFile(
        jerseyCanvasRef.current, 
        orderId,
        frontFileName
      );
      
      // Upload the front design image
      const frontPath = await uploadDesignImage(
        orderId,
        frontDesignFile,
        'front-design',
        2
      );
      
      let frontVerified = false;
      if (!frontPath) {
        console.error("Failed to upload front design image");
      } else {
        console.log("Front design image uploaded successfully:", frontPath);
        
        try {
          frontVerified = await checkFileExistsInStorage('design_images', frontPath);
          if (frontVerified) {
            const { data: frontUrlData } = supabase.storage
              .from('design_images')
              .getPublicUrl(frontPath);
            console.log("Front design public URL:", frontUrlData.publicUrl);
          }
        } catch (err) {
          console.warn("Unable to verify front design image due to permissions, but continuing:", err);
          frontVerified = true;
        }
      }
      
      console.log("Switching to back view design...");
      setPreviewView('back');
      
      console.log("Waiting for back view canvas to render...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const backFileName = `back-design-${orderId}.png`;
      const backDesignFile = await convertCanvasToFile(
        jerseyCanvasRef.current, 
        orderId,
        backFileName
      );
      
      // Upload the back design image
      const backPath = await uploadDesignImage(
        orderId,
        backDesignFile,
        'back-design',
        2
      );
      
      let backVerified = false;
      if (!backPath) {
        console.error("Failed to upload back design image");
      } else {
        console.log("Back design image uploaded successfully:", backPath);
        
        try {
          backVerified = await checkFileExistsInStorage('design_images', backPath);
          if (backVerified) {
            const { data: backUrlData } = supabase.storage
              .from('design_images')
              .getPublicUrl(backPath);
            console.log("Back design public URL:", backUrlData.publicUrl);
          }
        } catch (err) {
          console.warn("Unable to verify back design image due to permissions, but continuing:", err);
          backVerified = true;
        }
      }
      
      setPreviewView('front');
      
      const frontSuccess = frontPath && frontVerified;
      const backSuccess = backPath && backVerified;
      
      if (frontSuccess || backSuccess) {
        toast.success(`Đã lưu hình ảnh thiết kế ${frontSuccess && backSuccess ? 'mặt trước và mặt sau' : frontSuccess ? 'mặt trước' : 'mặt sau'}`);
      } else if (frontPath || backPath) {
        toast.info("Đã tạo hình ảnh thiết kế, nhưng không thể xác minh. Vẫn tiếp tục xử lý đơn hàng.");
      } else {
        toast.error("Không thể tạo ảnh thiết kế. Vui lòng thử lại sau.");
      }
      
      return { 
        frontPath: frontPath || '', 
        backPath: backPath || '' 
      };
    } catch (err) {
      console.error(`Error capturing order design images:`, err);
      toast.error(`Có lỗi khi tạo ảnh thiết kế: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return { frontPath: '', backPath: '' };
    } finally {
      setIsGeneratingDesign(false);
    }
  };

  const uploadReferenceImages = async (orderId: string): Promise<string[]> => {
    if (referenceImages.length === 0) return [];
    
    const uploadedPaths: string[] = [];
    let uploadProgress = 0;
    
    toast.info(`Đang tải lên hình ảnh tham khảo (0/${referenceImages.length})...`);
    
    for (const [index, file] of referenceImages.entries()) {
      try {
        const fileExt = file.name.split('.').pop();
        const filePath = `${orderId}/${Date.now()}-ref-${index}.${fileExt}`;
        
        console.log(`Uploading reference image ${index} to ${filePath}...`);
        
        const { data, error } = await supabase.storage
          .from('reference_images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error(`Error uploading reference image ${index}:`, error);
          toast.error(`Không thể tải lên hình ảnh tham khảo ${index + 1}: ${error.message}`);
          continue;
        }
        
        const { data: urlData } = supabase.storage
          .from('reference_images')
          .getPublicUrl(data.path);
          
        console.log(`Reference image ${index} public URL: ${urlData.publicUrl}`);
        
        uploadedPaths.push(data.path);
        uploadProgress++;
        
        toast.info(`Đang tải lên hình ảnh tham khảo (${uploadProgress}/${referenceImages.length})...`);
        
      } catch (err) {
        console.error(`Error uploading reference image ${index}:`, err);
        toast.error(`Có lỗi khi tải lên hình ảnh tham khảo ${index + 1}`);
      }
    }
    
    if (uploadedPaths.length > 0) {
      toast.success(`Đã tải lên ${uploadedPaths.length}/${referenceImages.length} hình ảnh tham khảo`);
    }
    
    return uploadedPaths;
  };

  const submitOrder = async () => {
    if (players.length === 0) {
      toast.error("Vui lòng thêm ít nhất một cầu thủ");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createStorageBucketsIfNeeded();
      
      const totalCost = calculateTotalCost();
      const orderId = uuidv4();
      const logoUrls: string[] = [];
      
      console.log("Starting design images generation...");
      const { frontPath, backPath } = await generateOrderDesignImages(orderId);
      
      if (!frontPath && !backPath) {
        console.warn("No design images were generated, but continuing with order submission");
        toast.warning("Không thể tạo ảnh thiết kế, nhưng vẫn tiếp tục đơn hàng của bạn.");
      } else {
        console.log("Design images generated successfully:", { frontPath, backPath });
      }
      
      const referenceImagePaths = await uploadReferenceImages(orderId);
      
      if (logos.length > 0) {
        for (const logo of logos) {
          const fileExt = logo.file.name.split('.').pop();
          const filePath = `${orderId}/${Date.now()}-${logo.position}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('logos')
            .upload(filePath, logo.file, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (uploadError) {
            throw uploadError;
          }
          
          const { data: { publicUrl } } = supabase.storage
            .from('logos')
            .getPublicUrl(filePath);
            
          logoUrls.push(publicUrl);
          
          await supabase.from('logos').insert({
            file_path: filePath,
            order_id: orderId,
            position: logo.position
          });
        }
      }
      
      const designData = {
        logos: logos.map(logo => ({
          logo_id: logo.id,
          position: logo.position,
          x_position: 0,
          y_position: 0,
          scale: 1.0
        })),
        players: players.map(player => ({
          name: player.name,
          number: player.number,
          position: 'Trên số lưng',
          font: printConfig.font,
          color: printConfig.backColor
        })),
        reference_images: referenceImagePaths,
        design_image_front: frontPath,
        design_image_back: backPath
      };

      console.log("Inserting order with design_images:", { frontPath, backPath });
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          team_name: teamName,
          logo_url: logoUrls.length > 0 ? logoUrls[0] : null,
          status: 'new',
          total_cost: totalCost,
          notes: notes,
          design_data: designData,
          design_image: frontPath || null,
          design_image_front: frontPath || null,
          design_image_back: backPath || null,
          reference_images: referenceImagePaths
        });
        
      if (orderError) {
        console.error("Error creating order:", orderError);
        throw orderError;
      }

      const playersToInsert = players.map(player => ({
        name: player.name,
        number: player.number,
        size: player.size,
        print_image: player.printImage,
        order_id: orderId
      }));
      
      const { error: playersError } = await supabase
        .from('players')
        .insert(playersToInsert);
        
      if (playersError) {
        console.error("Error adding players:", playersError);
        throw playersError;
      } else {
        console.log("Successfully added players");
      }
      
      let fontFileUrl = null;
      if (printConfig.customFontFile) {
        const fontPath = `${orderId}/fonts/${printConfig.customFontFile.name}`;
        
        const { error: fontUploadError } = await supabase.storage
          .from('logos')
          .upload(fontPath, printConfig.customFontFile, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (fontUploadError) {
          throw fontUploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(fontPath);
          
        fontFileUrl = publicUrl;
      }
      
      const { error: printConfigError } = await supabase
        .from('print_configs')
        .insert({
          order_id: orderId,
          font: printConfig.font,
          font_file: fontFileUrl,
          back_material: printConfig.backMaterial,
          back_color: printConfig.backColor,
          front_material: printConfig.frontMaterial,
          front_color: printConfig.frontColor,
          sleeve_material: printConfig.sleeveMaterial,
          sleeve_color: printConfig.sleeveColor,
          leg_material: printConfig.legMaterial,
          leg_color: printConfig.legColor,
          logo_positions: logos.map(logo => ({
            position: logo.position
          }))
        });
        
      if (printConfigError) {
        throw printConfigError;
      }
      
      const linesToInsert = productLines.map(line => ({
        product: line.product,
        position: line.position,
        material: line.material,
        size: line.size,
        points: line.points,
        content: line.content,
        order_id: orderId
      }));
      
      const { error: linesError } = await supabase
        .from('product_lines')
        .insert(linesToInsert);
        
      if (linesError) {
        throw linesError;
      }
      
      toast.success("Đơn hàng đã được gửi thành công!");
      
      const order = {
        id: orderId,
        teamName,
        players,
        logoUrls,
        printConfig,
        productLines,
        totalCost,
        status: "new",
        notes,
        designImageFront: frontPath,
        designImageBack: backPath,
        referenceImages: referenceImagePaths,
        createdAt: new Date()
      };
      
      navigate("/order-confirmation", { state: { order } });
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Có lỗi xảy ra khi gửi đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const testDesignImage = async () => {
    try {
      const testId = uuidv4();
      toast.info("Đang kiểm tra tạo ảnh thiết kế...");
      
      const { frontPath, backPath } = await generateOrderDesignImages(testId);
      
      let frontVerified = false;
      let backVerified = false;
      
      if (frontPath) {
        try {
          frontVerified = await checkFileExistsInStorage('design_images', frontPath);
          if (frontVerified) {
            const { data: frontData } = supabase.storage
              .from('design_images')
              .getPublicUrl(frontPath);
            console.log("Test front design image URL:", frontData.publicUrl);
          }
        } catch (err) {
          console.warn("Unable to verify front image, but continuing:", err);
          frontVerified = true;
        }
      }
      
      if (backPath) {
        try {
          backVerified = await checkFileExistsInStorage('design_images', backPath);
          if (backVerified) {
            const { data: backData } = supabase.storage
              .from('design_images')
              .getPublicUrl(backPath);
            console.log("Test back design image URL:", backData.publicUrl);
          }
        } catch (err) {
          console.warn("Unable to verify back image, but continuing:", err);
          backVerified = true;
        }
      }
      
      if (frontPath || backPath) {
        toast.success(`Tạo ảnh thiết kế ${frontPath && backPath ? 'mặt trước và mặt sau' : frontPath ? 'mặt trước' : 'mặt sau'} thành công!`);
      } else {
        toast.error("Không thể tạo ảnh thiết kế");
      }
    } catch (err) {
      console.error("Test design image error:", err);
      toast.error("Lỗi khi kiểm tra tạo ảnh thiết kế");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Tạo đơn hàng mới</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="info">Thông tin đơn hàng</TabsTrigger>
            <TabsTrigger value="preview">Xem trước</TabsTrigger>
            <TabsTrigger value="summary">Tổng kết & Đặt hàng</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="teamName">Tên đội bóng</Label>
                  <Input 
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Nhập tên đội bóng (không bắt buộc)"
                  />
                </div>
                
                <LogoUpload 
                  logos={logos}
                  onLogosChange={setLogos}
                />

                <div className="border rounded-md p-4 space-y-3">
                  <Label htmlFor="referenceImages">Hình ảnh sản phẩm muốn in (PNG, JPG)</Label>
                  <Input
                    id="referenceImages"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    multiple
                    onChange={(e) => handleReferenceImagesUpload(e.target.files)}
                    className="mb-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tối đa 5 hình ảnh. Nhấp vào hình ảnh để xóa.
                  </p>
                  
                  {referenceImagesPreview.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {referenceImagesPreview.map((preview, index) => (
                        <div 
                          key={index} 
                          className="relative group w-20 h-20 border rounded-md overflow-hidden"
                        >
                          <img 
                            src={preview} 
                            alt={`Reference ${index+1}`} 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeReferenceImage(index)}
                            className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea 
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Nhập ghi chú hoặc yêu cầu đặc biệt (nếu có)"
                  />
                </div>
                
                <PrintConfigForm
                  printConfig={printConfig}
                  onPrintConfigChange={setPrintConfig}
                />
              </div>
              
              <PlayerForm 
                players={players}
                onPlayersChange={setPlayers}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Cấu hình sản phẩm in</h2>
                <Button onClick={generateProductLines}>Tạo sản phẩm in tự động</Button>
              </div>
              
              <ProductLineTable 
                productLines={productLines}
                onProductLinesChange={setProductLines}
                logos={logos}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveTab("preview")}>Hủy</Button>
              <Button onClick={() => setActiveTab("preview")}>Tiếp tục</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Xem trước thiết kế áo</h2>
                <p className="text-muted-foreground">
                  Xem trước thiết kế áo của bạn. Có thể kéo thả logo để điều chỉnh vị trí.
                </p>
                
                <div className="flex gap-4 justify-center">
                  <Button 
                    variant={previewView === 'front' ? 'default' : 'outline'} 
                    onClick={() => setPreviewView('front')}
                  >
                    Mặt trước
                  </Button>
                  <Button 
                    variant={previewView === 'back' ? 'default' : 'outline'} 
                    onClick={() => setPreviewView('back')}
                  >
                    Mặt sau
                  </Button>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-md">
                  <div className="flex justify-center">
                    <CanvasJersey 
                      teamName={teamName || "TEAM NAME"}
                      playerName={players[previewPlayer]?.name || ""}
                      playerNumber={players[previewPlayer]?.number || 0}
                      logos={logos}
                      view={previewView}
                      printConfig={printConfig}
                      canvasRef={jerseyCanvasRef}
                    />
                  </div>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700">
                    Hệ thống sẽ lưu thiết kế cho cả mặt trước và mặt sau khi bạn đặt đơn hàng.
                  </p>
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={testDesignImage}
                      disabled={isGeneratingDesign}
                    >
                      {isGeneratingDesign ? "Đang xử lý..." : "Kiểm tra tạo ảnh"}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Chọn cầu thủ để xem trước</h2>
                
                {players.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {players.map((player, index) => (
                      <Button 
                        key={player.id || index}
                        variant={previewPlayer === index ? 'default' : 'outline'}
                        onClick={() => setPreviewPlayer(index)}
                        className="h-auto py-2 justify-start"
                      >
                        <div className="text-left">
                          <div className="font-semibold">{player.name || `Cầu thủ ${index + 1}`}</div>
                          <div className="text-sm opacity-80">#{player.number} - {player.size}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Chưa có cầu thủ nào trong danh sách. Vui lòng quay lại bước trước để thêm cầu thủ.
                  </p>
                )}

                {logos.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Logo đã tải lên</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {logos.map((logo, index) => (
                        <div key={logo.id} className="border rounded p-2">
                          <img 
                            src={logo.previewUrl} 
                            alt={`Logo ${index + 1}`} 
                            className="h-16 w-16 object-contain mx-auto"
                          />
                          <p className="text-xs text-center mt-1 text-muted-foreground">
                            {getPositionLabel(logo.position)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setActiveTab("info")}>Quay lại</Button>
              <Button onClick={() => setActiveTab("summary")}>Tiếp tục</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="summary" className="space-y-8">
            <OrderSummary 
              teamName={teamName}
              players={players}
              logos={logos}
              productLines={productLines}
            />
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Lưu ý:</h3>
              <p className="text-yellow-700">
                Bằng việc nhấn nút "Đặt đơn hàng", bạn đồng ý với các điều khoản dịch vụ của chúng tôi.
                Đơn hàng sẽ được xử lý trong vòng 24 giờ và bạn sẽ nhận được email xác nhận.
              </p>
            </div>
            
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setActiveTab("preview")}>Quay lại</Button>
              <Button 
                onClick={submitOrder}
                disabled={isSubmitting || players.length === 0}
              >
                {isSubmitting ? "Đang xử lý..." : "Đặt đơn hàng"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

const getPositionLabel = (position: string): string => {
  switch (position) {
    case 'chest_left': return 'Ngực trái';
    case 'chest_right': return 'Ngực phải';
    case 'chest_center': return 'Giữa ngực';
    case 'sleeve_left': return 'Tay trái';
    case 'sleeve_right': return 'Tay phải';
    default: return 'Không xác định';
  }
};

export default CreateOrder;
