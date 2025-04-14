import React from 'react';
import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerForm } from "@/components/player-form";
import { OrderSummary } from "@/components/order-summary";
import { OrderCostSummary } from "@/components/order-cost-summary";
import { LogoUpload } from "@/components/logo-upload";
import { Player, Logo, PrintConfig, ProductLine, DesignData, Customer } from "@/types";
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
import { PrintGlobalSettings } from "@/components/print-global-settings";
import { UniformPreview } from "@/components/ui/uniform-preview";
import { useAuth } from "@/contexts/AuthContext";
import { AuthCheck } from "@/components/auth/AuthCheck";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { formatCurrency, parseDateSafely } from "@/utils/format-utils";
import { ProductLineTable } from "@/components/product-line-table";

const CreateOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);
  const [isDemoApproved, setIsDemoApproved] = useState(false);
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [referenceImagesPreview, setReferenceImagesPreview] = useState<string[]>([]);
  const [customerInfo, setCustomerInfo] = useState<Customer>({
    name: "",
    address: "",
    phone: ""
  });
  
  const [fontText, setFontText] = useState<string>("Arial");
  const [fontNumber, setFontNumber] = useState<string>("Arial");
  const [printStyle, setPrintStyle] = useState<string>("In chuyển nhiệt");
  const [printColor, setPrintColor] = useState<string>("Đen");
  
  const [designData, setDesignData] = useState<Partial<DesignData>>({
    uniform_type: 'player',
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

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data && !error) {
          const customerData: Customer = {
            ...data,
            created_at: parseDateSafely(data.created_at)
          };
          setCustomerInfo(customerData);
        }
      }
    };
    
    fetchCustomerInfo();
  }, [user]);
  
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
    if (players.length === 0) {
      toast.error("Chưa có cầu thủ nào trong danh sách. Vui lòng thêm ít nhất một cầu thủ.");
      return;
    }
    
    const newProductLines: ProductLine[] = [];
    
    const uniqueConfigs = new Set<string>();
    
    players.forEach(player => {
      const extPlayer = player as any;
      
      if (extPlayer.line_1) {
        uniqueConfigs.add("line_1");
      }
      
      uniqueConfigs.add("line_2");
      
      if (extPlayer.line_3) {
        uniqueConfigs.add("line_3");
      }
      
      if (extPlayer.chest_text) {
        uniqueConfigs.add("chest_text");
      }
      
      if (extPlayer.chest_number) {
        uniqueConfigs.add("chest_number");
      }
      
      if (extPlayer.pants_number) {
        uniqueConfigs.add("pants_number");
      }
      
      if (extPlayer.logo_chest_left) uniqueConfigs.add("logo_chest_left");
      if (extPlayer.logo_chest_right) uniqueConfigs.add("logo_chest_right");
      if (extPlayer.logo_chest_center) uniqueConfigs.add("logo_chest_center");
      if (extPlayer.logo_sleeve_left) uniqueConfigs.add("logo_sleeve_left");
      if (extPlayer.logo_sleeve_right) uniqueConfigs.add("logo_sleeve_right");
      if (extPlayer.logo_pants) uniqueConfigs.add("logo_pants");
      
      if (extPlayer.pet_chest) {
        uniqueConfigs.add("pet_chest");
      }
    });
    
    if (uniqueConfigs.has("line_1")) {
      newProductLines.push({
        id: `product-line-1-${Date.now()}`,
        product: "Áo cầu thủ",
        position: "In trên số lưng",
        material: printStyle,
        size: "Trung bình",
        points: 1,
        content: "Tên trên số lưng"
      });
    }
    
    if (uniqueConfigs.has("line_2")) {
      newProductLines.push({
        id: `product-line-2-${Date.now()}`,
        product: "Áo cầu thủ",
        position: "In số lưng",
        material: printStyle,
        size: "Lớn",
        points: 1,
        content: "Số áo"
      });
    }
    
    if (uniqueConfigs.has("line_3")) {
      newProductLines.push({
        id: `product-line-3-${Date.now()}`,
        product: "Áo cầu thủ",
        position: "In dưới số lưng",
        material: printStyle,
        size: "Trung bình",
        points: 1,
        content: "Tên dưới số lưng"
      });
    }
    
    if (uniqueConfigs.has("chest_text")) {
      newProductLines.push({
        id: `product-chest-text-${Date.now()}`,
        product: "Áo cầu thủ",
        position: "In chữ ngực",
        material: printStyle,
        size: "Trung bình",
        points: 1,
        content: "Chữ ngực"
      });
    }
    
    if (uniqueConfigs.has("chest_number")) {
      newProductLines.push({
        id: `product-chest-number-${Date.now()}`,
        product: "Áo cầu thủ",
        position: "In số ngực",
        material: printStyle,
        size: "Nhỏ",
        points: 1,
        content: "Số ngực"
      });
    }
    
    if (uniqueConfigs.has("pants_number")) {
      newProductLines.push({
        id: `product-pants-number-${Date.now()}`,
        product: "Quần",
        position: "In số quần",
        material: printStyle,
        size: "Nhỏ",
        points: 1,
        content: "Số quần"
      });
    }
    
    const logoPositions = [
      { key: 'logo_chest_left', label: 'Logo ngực trái' },
      { key: 'logo_chest_right', label: 'Logo ngực phải' },
      { key: 'logo_chest_center', label: 'Logo ngực giữa' },
      { key: 'logo_sleeve_left', label: 'Logo tay trái' },
      { key: 'logo_sleeve_right', label: 'Logo tay phải' },
      { key: 'logo_pants', label: 'Logo quần' }
    ];
    
    logoPositions.forEach(position => {
      if (uniqueConfigs.has(position.key)) {
        const logo = logos.find(l => l.position === position.key.replace('logo_', '') as any);
        
        newProductLines.push({
          id: `product-${position.key}-${Date.now()}`,
          product: position.key.includes('pants') ? "Quần" : "Áo cầu thủ",
          position: position.label,
          material: printStyle,
          size: "Trung bình",
          points: 1,
          content: logo ? `Logo: ${logo.file.name.split('/').pop()?.split('.')[0]}` : position.label
        });
      }
    });
    
    if (uniqueConfigs.has("pet_chest")) {
      newProductLines.push({
        id: `product-pet-chest-${Date.now()}`,
        product: "Áo cầu thủ",
        position: "In PET ngực",
        material: "In PET",
        size: "Lớn",
        points: 1,
        content: "PET ngực"
      });
    }
    
    setProductLines(newProductLines);
    toast.success("Đã tạo danh sách sản phẩm in từ cấu hình cầu thủ");
    
    updateDesignDataFromPlayers();
  }, [players, logos, printStyle]);

  const updateDesignDataFromPlayers = useCallback(() => {
    if (players.length === 0) return;
    
    const newDesignData: Partial<DesignData> = {
      uniform_type: 'player',
      quantity: players.length,
      font_text: {
        font: fontText
      },
      font_number: {
        font: fontNumber
      }
    };
    
    const hasGoalkeeper = players.some(p => p.uniform_type === 'goalkeeper');
    if (hasGoalkeeper) {
      newDesignData.uniform_type = 'mixed';
    }
    
    const firstPlayer = players[0];
    
    if (players.some(p => p.line_1)) {
      newDesignData.line_1 = {
        enabled: true,
        material: printStyle,
        color: printColor,
        content: firstPlayer.line_1 || "",
        font: fontText
      };
    }
    
    newDesignData.line_2 = {
      enabled: true,
      material: printStyle,
      color: printColor,
      font: fontNumber
    };
    
    if (players.some(p => p.line_3)) {
      newDesignData.line_3 = {
        enabled: true,
        material: printStyle,
        color: printColor,
        content: firstPlayer.line_3 || "",
        font: fontText
      };
    }
    
    if (players.some(p => p.chest_text)) {
      newDesignData.chest_text = {
        enabled: true,
        material: printStyle,
        color: printColor,
        content: firstPlayer.chest_text || "",
        font: fontText
      };
    }
    
    if (players.some(p => p.chest_number)) {
      newDesignData.chest_number = {
        enabled: true,
        material: printStyle,
        color: printColor
      };
    }
    
    if (players.some(p => p.pants_number)) {
      newDesignData.pants_number = {
        enabled: true,
        material: printStyle,
        color: printColor
      };
    }
    
    const logoPositions = [
      { key: 'logo_chest_left', position: 'chest_left' },
      { key: 'logo_chest_right', position: 'chest_right' },
      { key: 'logo_chest_center', position: 'chest_center' },
      { key: 'logo_sleeve_left', position: 'sleeve_left' },
      { key: 'logo_sleeve_right', position: 'sleeve_right' },
      { key: 'logo_pants', position: 'pants' }
    ];
    
    logoPositions.forEach(pos => {
      if (players.some(p => p[pos.key as keyof Player])) {
        const logo = logos.find(l => l.position === pos.position);
        
        if (newDesignData[pos.key as keyof DesignData] === undefined) {
          (newDesignData as any)[pos.key] = {
            enabled: true,
            material: printStyle,
            logo_id: logo?.id,
            x_position: 0,
            y_position: 0,
            scale: pos.key === 'logo_chest_center' ? 1.3 : 1.0
          };
        }
      }
    });
    
    if (players.some(p => p.pet_chest)) {
      newDesignData.pet_chest = {
        enabled: true,
        material: "In PET",
        color: "Trong suốt",
        content: firstPlayer.pet_chest || ""
      };
    }
    
    setDesignData(newDesignData);
  }, [players, logos, fontText, fontNumber, printStyle, printColor]);

  const calculateTotalCost = useCallback(() => {
    if (!players.length) return 0;
    
    let totalCost = 0;
    const basePlayerUniformPrice = 120000;
    const baseGoalkeeperUniformPrice = 150000;
    
    const playerCount = players.filter(p => (p as any).uniform_type !== 'goalkeeper').length;
    const goalkeeperCount = players.filter(p => (p as any).uniform_type === 'goalkeeper').length;
    
    const uniformsCost = (playerCount * basePlayerUniformPrice) + 
                         (goalkeeperCount * baseGoalkeeperUniformPrice);
    
    const printPositionsCount = productLines.length;
    
    const printingCost = productLines.reduce((total, line) => {
      let positionCost = 0;
      
      if (line.position.includes("số lưng")) {
        positionCost = 20000;
      } else if (line.position.includes("số ngực") || line.position.includes("số quần")) {
        positionCost = 10000;
      } else if (line.position.includes("Logo")) {
        positionCost = 25000;
      } else if (line.position.includes("PET")) {
        positionCost = 35000;
      } else {
        positionCost = 15000;
      }
      
      if (line.material.includes("decal")) {
        positionCost *= 1.2;
      } else if (line.material.includes("PET")) {
        positionCost *= 1.5;
      }
      
      return total + positionCost;
    }, 0);
    
    totalCost = uniformsCost + printingCost;
    
    return totalCost;
  }, [players, productLines]);

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

  const prepareDesignDataForStorage = (data: Partial<DesignData>): Record<string, any> => {
    if (data.uniform_type && !['player', 'goalkeeper', 'mixed'].includes(data.uniform_type)) {
      data.uniform_type = 'player';
    }
    return JSON.parse(JSON.stringify(data));
  };

  const getPlayerAndGoalkeeperCounts = () => {
    const playerCount = players.filter(p => (p as any).uniform_type !== 'goalkeeper').length;
    const goalkeeperCount = players.filter(p => (p as any).uniform_type === 'goalkeeper').length;
    return { playerCount, goalkeeperCount };
  };

  const validateForm = () => {
    if (players.length === 0) {
      toast.error("Vui lòng thêm ít nhất một cầu thủ vào danh sách");
      return false;
    }
    
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      toast.error("Vui lòng nhập đầy đủ thông tin khách hàng");
      return false;
    }
    
    return true;
  };

  const handleViewDemo = () => {
    if (!validateForm()) return;
    
    generateProductLines();
    
    setActiveTab("preview");
  };

  const approveDemo = () => {
    setIsDemoApproved(true);
    toast.success("Đã duyệt thiết kế demo. Tiếp tục để hoàn tất đơn hàng.");
    setActiveTab("summary");
  };

  const submitOrder = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt đơn hàng");
      return;
    }
    
    if (!isDemoApproved) {
      toast.error("Vui lòng duyệt demo trước khi đặt đơn hàng");
      setActiveTab("preview");
      return;
    }
    
    if (players.length === 0) {
      toast.error("Vui lòng thêm ít nhất một cầu thủ vào danh sách");
      setActiveTab("info");
      return;
    }
    
    if (!customerInfo.name || !customerInfo.address || !customerInfo.phone) {
      toast.error("Vui lòng nhập đầy đủ thông tin khách hàng");
      setActiveTab("info");
      return;
    }
    
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
      
      const { playerCount, goalkeeperCount } = getPlayerAndGoalkeeperCounts();
      
      const finalDesignData: Partial<DesignData> = {
        ...designData,
        uniform_type: playerCount > 0 && goalkeeperCount > 0 ? 'mixed' : 
                     goalkeeperCount > 0 ? 'goalkeeper' : 'player',
        quantity: players.length,
        reference_images: referenceImagePaths,
        font_text: {
          font: fontText
        },
        font_number: {
          font: fontNumber
        },
        print_style: printStyle,
        print_color: printColor
      };

      const designDataJson = prepareDesignDataForStorage(finalDesignData);

      console.log("Inserting order with design_images:", { frontPath, backPath, pantsPath });
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          team_name: players[0].name || "Team",
          logo_url: logoUrls.length > 0 ? logoUrls[0] : null,
          status: 'new',
          total_cost: totalCost,
          notes: notes,
          design_data: designDataJson,
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
        toast.warning("Không thể cập nhật thông tin khách hàng, nhưng vẫn tiếp tục tạo đơn hàng.");
      }
      
      if (players.length > 0) {
        const playersToInsert = players.map(p => {
          return {
            name: p.name,
            number: p.number,
            size: p.size,
            print_image: p.printImage,
            order_id: orderId,
            uniform_type: p.uniform_type || 'player',
            line_1: p.line_1 || null,
            line_2: String(p.number),
            line_3: p.line_3 || null,
            chest_text: p.chest_text || null,
            chest_number: p.chest_number || false,
            pants_number: p.pants_number || false,
            logo_chest_left: p.logo_chest_left || false,
            logo_chest_right: p.logo_chest_right || false,
            logo_chest_center: p.logo_chest_center || false,
            logo_sleeve_left: p.logo_sleeve_left || false,
            logo_sleeve_right: p.logo_sleeve_right || false,
            logo_pants: p.logo_pants || false,
            pet_chest: p.pet_chest || null,
            jersey_color: p.jersey_color || 'yellow',
            note: p.note || null
          };
        });
        
        await supabase.from('players').insert(playersToInsert);
      }
    } catch (err) {
      console.error(`Error submitting order:`, err);
      toast.error(`Có lỗi khi đặt đơn hàng: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  onClick={submitOrder}
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
            
            <TabsContent value="info" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <CustomerForm 
                  onCustomerInfoChange={setCustomerInfo} 
                  initialCustomer={customerInfo}
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
                              onClick={() => removeReferenceImage(index)}
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
                                onChange={(e) => handleReferenceImagesUpload(e.target.files)}
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
                    onFontTextChange={setFontText}
                    fontNumberOptions={["Arial", "Times New Roman", "Impact", "Comic Sans MS"]}
                    fontNumber={fontNumber}
                    onFontNumberChange={setFontNumber}
                    printStyleOptions={["In chuyển nhiệt", "In decal", "In PET"]}
                    printStyle={printStyle}
                    onPrintStyleChange={setPrintStyle}
                    printColorOptions={["Đen", "Trắng", "Vàng", "Đỏ", "Xanh dương", "Xanh lá"]}
                    printColor={printColor}
                    onPrintColorChange={setPrintColor}
                  />
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Tải lên logo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <LogoUpload 
                        logos={logos} 
                        onLogosChange={setLogos} 
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Danh sách cầu thủ</CardTitle>
                  {players.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateProductLines}
                    >
                      Tạo danh sách sản phẩm in
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <PlayerForm
                    players={players}
                    onPlayersChange={setPlayers}
                    logos={logos}
                    fontSize={fontText}
                    fontNumber={fontNumber}
                    printStyleOptions={["In chuyển nhiệt", "In decal", "In PET"]}
                    printStyle={printStyle}
                    printColorOptions={["Đen", "Trắng", "Vàng", "Đỏ", "Xanh dương", "Xanh lá"]}
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
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Nhập ghi chú cho đơn hàng (không bắt buộc)"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preview">
              {players.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Chưa có cầu thủ</AlertTitle>
                  <AlertDescription>
                    Vui lòng thêm ít nhất một cầu thủ vào danh sách để xem trước thiết kế.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  <UniformPreview
                    teamName={players[0]?.name?.split(' ')[0] || "TEAM"}
                    players={players}
                    logos={logos}
                    printConfig={printConfig}
                    designData={designData}
                    canvasRef={jerseyCanvasRef}
                    canvasPantsRef={pantCanvasRef}
                  />
                  
                  {productLines.length > 0 && (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Chi phí ước tính</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xl font-bold">
                            {formatCurrency(calculateTotalCost())}
                          </div>
                          
                          <div className="mt-4">
                            <p className="text-sm text-muted-foreground">
                              * Đây chỉ là giá ước tính. Chi phí có thể thay đổi tùy thuộc vào yêu cầu cụ thể.
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            onClick={approveDemo}
                            disabled={isGeneratingDesign}
                            className="w-full"
                          >
                            {isGeneratingDesign ? "Đang xử lý..." : isDemoApproved ? "Đã duyệt thiết kế" : "Duyệt thiết kế demo"}
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="summary">
              {isDemoApproved ? (
                <div className="space-y-6">
                  <OrderSummary 
                    teamName={players[0]?.name?.split(' ')[0] || "TEAM"}
                    players={players}
                    logos={logos}
                    productLines={productLines}
                    uniformType={players[0]?.uniform_type || 'player'}
                    quantity={players.length}
                    totalCost={calculateTotalCost()}
                    customerInfo={customerInfo}
                  />
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Danh sách sản phẩm in</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {productLines.length > 0 ? (
                        <ProductLineTable 
                          productLines={productLines} 
                          onProductLinesChange={setProductLines}
                          logos={logos}
                        />
                      ) : (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Chưa có sản phẩm in</AlertTitle>
                          <AlertDescription>
                            Vui lòng tạo danh sách sản phẩm in từ thông tin cầu thủ.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                  
                  <OrderCostSummary 
                    uniformCount={players.length}
                    jerseyUnitPrice={120000}
                    goalkeeperUnitPrice={150000}
                    playerCount={players.filter(p => (p as any).uniform_type !== 'goalkeeper').length}
                    goalkeeperCount={players.filter(p => (p as any).uniform_type === 'goalkeeper').length}
                    printPositionsCount={productLines.length}
                    printUnitPrice={20000}
                    totalCost={calculateTotalCost()}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={submitOrder}
                      disabled={isSubmitting || isGeneratingDesign}
                      size="lg"
                    >
                      {isSubmitting ? "Đang xử lý..." : "Đặt đơn hàng"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Chưa duyệt thiết kế demo</AlertTitle>
                  <AlertDescription>
                    Vui lòng xem và duyệt thiết kế demo trước khi đến bước này.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </AuthCheck>
    </Layout>
  );
};

export default CreateOrder;
