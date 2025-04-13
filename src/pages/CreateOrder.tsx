
import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerForm } from "@/components/player-form";
import { OrderSummary } from "@/components/order-summary";
import { LogoUpload } from "@/components/logo-upload";
import { Logo, Player, PrintConfig, ProductLine, DesignData, Customer } from "@/types";
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
import { CustomerForm } from "@/components/customer-form";
import { UniformInfoForm } from "@/components/uniform-info-form";
import { PrintPositionsForm } from "@/components/print-positions-form";
import { UniformPreview } from "@/components/ui/uniform-preview";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const CreateOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);
  
  const [teamName, setTeamName] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [referenceImagesPreview, setReferenceImagesPreview] = useState<string[]>([]);
  const [uniformType, setUniformType] = useState<'player' | 'goalkeeper'>('player');
  const [quantity, setQuantity] = useState<number>(0);
  const [customerInfo, setCustomerInfo] = useState<Customer>({
    name: "",
    address: "",
    phone: ""
  });
  const [designData, setDesignData] = useState<Partial<DesignData>>({
    uniform_type: 'player',
    quantity: 0,
    font_text: {
      font: "Arial"
    },
    font_number: {
      font: "Arial"
    }
  });
  
  const jerseyCanvasRef = useRef<HTMLCanvasElement>(null);
  const pantCanvasRef = useRef<HTMLCanvasElement>(null);
  
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
    if (designData) {
      let newProductLines: ProductLine[] = [];

      // Add product lines based on designData
      if (designData.line_1?.enabled) {
        newProductLines.push({
          id: `product-line-1-${Date.now()}`,
          product: uniformType === 'player' ? "Áo cầu thủ" : "Áo thủ môn",
          position: "In trên số lưng",
          material: designData.line_1.material || "In chuyển nhiệt",
          size: "Trung bình",
          points: 1,
          content: designData.line_1.content || ""
        });
      }
      
      if (designData.line_2?.enabled) {
        newProductLines.push({
          id: `product-line-2-${Date.now()}`,
          product: uniformType === 'player' ? "Áo cầu thủ" : "Áo thủ môn",
          position: "In số lưng",
          material: designData.line_2.material || "In chuyển nhiệt",
          size: "Lớn",
          points: 1,
          content: "Số áo"
        });
      }
      
      if (designData.line_3?.enabled) {
        newProductLines.push({
          id: `product-line-3-${Date.now()}`,
          product: uniformType === 'player' ? "Áo cầu thủ" : "Áo thủ môn",
          position: "In dưới số lưng",
          material: designData.line_3.material || "In chuyển nhiệt",
          size: "Nhỏ",
          points: 1,
          content: designData.line_3.content || teamName
        });
      }
      
      if (designData.chest_number?.enabled) {
        newProductLines.push({
          id: `product-chest-number-${Date.now()}`,
          product: uniformType === 'player' ? "Áo cầu thủ" : "Áo thủ môn",
          position: "In số ngực",
          material: designData.chest_number.material || "In chuyển nhiệt",
          size: "Trung bình",
          points: 1,
          content: "Số áo"
        });
      }
      
      if (designData.chest_text?.enabled) {
        newProductLines.push({
          id: `product-chest-text-${Date.now()}`,
          product: uniformType === 'player' ? "Áo cầu thủ" : "Áo thủ môn",
          position: "In chữ ngực",
          material: designData.chest_text.material || "In chuyển nhiệt",
          size: "Trung bình",
          points: 1,
          content: designData.chest_text.content || ""
        });
      }
      
      if (designData.pants_number?.enabled) {
        newProductLines.push({
          id: `product-pants-number-${Date.now()}`,
          product: "Quần",
          position: "In số quần",
          material: designData.pants_number.material || "In chuyển nhiệt",
          size: "Trung bình",
          points: 1,
          content: "Số áo"
        });
      }
      
      // Add logo positions
      const logoPositions = [
        { key: 'logo_chest_left', label: 'In logo ngực trái' },
        { key: 'logo_chest_right', label: 'In logo ngực phải' },
        { key: 'logo_chest_center', label: 'In logo ngực giữa' },
        { key: 'logo_sleeve_left', label: 'In logo tay trái' },
        { key: 'logo_sleeve_right', label: 'In logo tay phải' },
        { key: 'logo_pants', label: 'In logo quần' }
      ];
      
      logoPositions.forEach(position => {
        const positionData = designData[position.key as keyof DesignData];
        if (positionData && (positionData as any).enabled) {
          const logo = logos.find(l => l.id === (positionData as any).logo_id);
          const logoName = logo ? 
            logo.file.name.split('/').pop()?.split('.')[0] || `Logo` : 
            `Logo ${position.key.replace('logo_', '')}`;
            
          newProductLines.push({
            id: `product-${position.key}-${Date.now()}`,
            product: position.key.includes('pants') ? "Quần" : (uniformType === 'player' ? "Áo cầu thủ" : "Áo thủ môn"),
            position: position.label,
            material: (positionData as any).material || "In chuyển nhiệt",
            size: "Trung bình",
            points: 1,
            content: logoName
          });
        }
      });
      
      if (designData.pet_chest?.enabled) {
        newProductLines.push({
          id: `product-pet-chest-${Date.now()}`,
          product: uniformType === 'player' ? "Áo cầu thủ" : "Áo thủ môn",
          position: "In PET ngực",
          material: designData.pet_chest.material || "In chuyển nhiệt",
          size: "Trung bình",
          points: 1,
          content: designData.pet_chest.content || ""
        });
      }
      
      setProductLines(newProductLines);
    }
  }, [designData, uniformType, teamName, logos]);

  const calculateTotalCost = useCallback(() => {
    let totalCost = 0;
    const basePlayerUniformPrice = 120000; // Base price per uniform
    
    // Calculate uniform cost based on quantity
    const uniformPrice = uniformType === 'player' ? basePlayerUniformPrice : basePlayerUniformPrice * 1.2;
    totalCost += uniformPrice * quantity;
    
    // Calculate printing costs
    let printingCost = 0;
    
    productLines.forEach(line => {
      let unitCost = 0;
      
      // Define costs based on printing position and material
      if (line.position.includes("logo")) {
        unitCost = line.material.includes("decal") ? 25000 : 20000;
      } else if (line.position.includes("số")) {
        unitCost = line.material.includes("decal") ? 15000 : 10000;
      } else if (line.position.includes("chữ")) {
        unitCost = line.material.includes("decal") ? 20000 : 15000;
      } else if (line.position.includes("PET")) {
        unitCost = 30000;
      } else {
        unitCost = 15000; // Default cost for other printing positions
      }
      
      // Special case for pants which affect only a subset of items
      if (line.product === "Quần") {
        printingCost += unitCost * players.length;
      } else {
        // For jersey items, use the overall quantity
        printingCost += unitCost * quantity;
      }
    });
    
    totalCost += printingCost;
    
    return totalCost;
  }, [productLines, players.length, quantity, uniformType]);

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

  const generateOrderDesignImages = async (orderId: string): Promise<{ frontPath: string; backPath: string; pantsPath: string; }> => {
    try {
      setIsGeneratingDesign(true);
      
      const bucketsCheck = await createStorageBucketsIfNeeded();
      if (!bucketsCheck.success) {
        console.error("Failed to ensure storage buckets exist:", bucketsCheck.message);
        toast.error(`Không thể khởi tạo kho lưu trữ: ${bucketsCheck.message}`);
        return { frontPath: '', backPath: '', pantsPath: '' };
      }
      
      if (!jerseyCanvasRef.current) {
        console.error("Canvas reference is not available");
        toast.error("Không thể tạo ảnh thiết kế: Canvas không khả dụng");
        return { frontPath: '', backPath: '', pantsPath: '' };
      }
      
      console.log("Capturing front view design...");
      
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
      
      // Capture pants design if pants canvas ref is available
      let pantsPath = '';
      if (pantCanvasRef.current) {
        console.log("Capturing pants design...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const pantsFileName = `pants-design-${orderId}.png`;
        const pantsDesignFile = await convertCanvasToFile(
          pantCanvasRef.current,
          orderId,
          pantsFileName
        );
        
        pantsPath = await uploadDesignImage(
          orderId,
          pantsDesignFile,
          'pants-design',
          2
        );
        
        if (!pantsPath) {
          console.error("Failed to upload pants design image");
        } else {
          console.log("Pants design image uploaded successfully:", pantsPath);
        }
      }
      
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
        backPath: backPath || '',
        pantsPath: pantsPath || ''
      };
    } catch (err) {
      console.error(`Error capturing order design images:`, err);
      toast.error(`Có lỗi khi tạo ảnh thiết kế: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return { frontPath: '', backPath: '', pantsPath: '' };
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
    // Check authentication
    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt đơn hàng");
      return;
    }
    
    // Check for required fields
    if (quantity <= 0) {
      toast.error("Vui lòng nhập số lượng quần áo");
      return;
    }
    
    if (!customerInfo.name || !customerInfo.address || !customerInfo.phone) {
      toast.error("Vui lòng nhập đầy đủ thông tin khách hàng");
      setActiveTab("info");
      return;
    }
    
    // Generate product lines if not already generated
    if (productLines.length === 0) {
      generateProductLines();
    }
    
    setIsSubmitting(true);
    
    try {
      await createStorageBucketsIfNeeded();
      
      const totalCost = calculateTotalCost();
      const orderId = uuidv4();
      const logoUrls: string[] = [];
      
      console.log("Starting design images generation...");
      const { frontPath, backPath, pantsPath } = await generateOrderDesignImages(orderId);
      
      if (!frontPath && !backPath) {
        console.warn("No design images were generated, but continuing with order submission");
        toast.warning("Không thể tạo ảnh thiết kế, nhưng vẫn tiếp tục đơn hàng của bạn.");
      } else {
        console.log("Design images generated successfully:", { frontPath, backPath, pantsPath });
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
      
      // Update designData with final values
      const finalDesignData: Partial<DesignData> = {
        ...designData,
        uniform_type: uniformType,
        quantity: quantity,
        reference_images: referenceImagePaths,
      };

      console.log("Inserting order with design_images:", { frontPath, backPath, pantsPath });
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          team_name: teamName,
          logo_url: logoUrls.length > 0 ? logoUrls[0] : null,
          status: 'new',
          total_cost: totalCost,
          notes: notes,
          design_data: finalDesignData,
          design_image: frontPath || null,
          design_image_front: frontPath || null,
          design_image_back: backPath || null,
          reference_images: referenceImagePaths,
          customer_id: user.id
        });
        
      if (orderError) {
        console.error("Error creating order:", orderError);
        throw orderError;
      }

      // Insert/update customer information
      if (!customerInfo.id) {
        const { error: customerError } = await supabase
          .from('customers')
          .upsert({
            id: user.id,
            name: customerInfo.name,
            address: customerInfo.address,
            phone: customerInfo.phone,
            delivery_note: customerInfo.delivery_note
          });
          
        if (customerError) {
          console.error("Error updating customer info:", customerError);
          // Continue with order creation even if customer update fails
        }
      }
      
      // Insert players
      if (players.length > 0) {
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
      
      // Insert product lines
      if (productLines.length > 0) {
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
      }
      
      toast.success("Đơn hàng đã được gửi thành công!");
      
      const order = {
        id: orderId,
        teamName,
        players,
        logos,
        printConfig,
        productLines,
        totalCost,
        status: "new",
        notes,
        designImageFront: frontPath,
        designImageBack: backPath,
        referenceImages: referenceImagePaths,
        customer_id: user.id,
        designData: finalDesignData,
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Team Info */}
                <UniformInfoForm
                  teamName={teamName}
                  onTeamNameChange={setTeamName}
                  notes={notes}
                  onNotesChange={setNotes}
                  uniformType={uniformType}
                  onUniformTypeChange={setUniformType}
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                  designData={designData}
                  onDesignDataChange={setDesignData}
                />
                
                {/* Logo Upload */}
                <LogoUpload 
                  logos={logos}
                  onLogosChange={setLogos}
                />
                
                {/* Reference Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>Hình ảnh tham khảo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                  </CardContent>
                </Card>
                
                {/* Customer Info */}
                <CustomerForm 
                  onCustomerInfoChange={setCustomerInfo}
                  initialCustomer={customerInfo}
                />
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                {/* Print Positions */}
                <PrintPositionsForm
                  designData={designData}
                  onDesignDataChange={setDesignData}
                  logos={logos}
                  teamName={teamName}
                />
                
                {/* Player Form */}
                <PlayerForm 
                  players={players}
                  onPlayersChange={setPlayers}
                  uniformQuantity={quantity}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button onClick={generateProductLines} variant="outline">
                Tạo sản phẩm in tự động
              </Button>
              <Button onClick={() => setActiveTab("preview")}>Tiếp tục</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-8">
            <ScrollArea className="h-[calc(100vh-200px)] pr-4">
              <div className="space-y-8">
                {/* Uniform Preview */}
                <UniformPreview
                  teamName={teamName}
                  players={players}
                  logos={logos}
                  printConfig={printConfig}
                  designData={designData}
                  canvasRef={jerseyCanvasRef}
                  canvasPantsRef={pantCanvasRef}
                />
                
                {/* Product Lines */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Danh sách sản phẩm in</CardTitle>
                    <Button variant="outline" onClick={generateProductLines}>
                      Tạo lại sản phẩm in
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {productLines.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-muted">
                              <th className="p-2 text-left">Sản phẩm</th>
                              <th className="p-2 text-left">Vị trí in</th>
                              <th className="p-2 text-left">Chất liệu</th>
                              <th className="p-2 text-left">Kích thước</th>
                              <th className="p-2 text-left">Nội dung</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productLines.map((line, index) => (
                              <tr key={line.id} className="border-b border-muted">
                                <td className="p-2">{line.product}</td>
                                <td className="p-2">{line.position}</td>
                                <td className="p-2">{line.material}</td>
                                <td className="p-2">{line.size}</td>
                                <td className="p-2">{line.content}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-muted/30 rounded-md">
                        <p className="text-muted-foreground">
                          Chưa có sản phẩm in nào. Nhấn "Tạo lại sản phẩm in" để tạo tự động dựa trên cấu hình.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
            
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
              uniformType={uniformType}
              quantity={quantity}
              totalCost={calculateTotalCost()}
              customerInfo={customerInfo}
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
                disabled={isSubmitting || !user || quantity <= 0 || !customerInfo.name}
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

export default CreateOrder;
