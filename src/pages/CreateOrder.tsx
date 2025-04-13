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
import { PrintInfoForm } from "@/components/print-info-form";
import { ProductLineTable } from "@/components/product-line-table";
import { OrderSummary } from "@/components/order-summary";
import { CanvasJersey } from "@/components/ui/canvas-jersey";
import { LogoUpload } from "@/components/logo-upload";
import { Logo, Player, PrintConfig, ProductLine, DesignData, FontConfig } from "@/types";
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
import * as XLSX from 'xlsx';

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
  
  const [designData, setDesignData] = useState<DesignData>({
    font_text: {
      font: "Arial"
    },
    font_number: {
      font: "Arial"
    }
  });
  
  const jerseyCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [printConfig, setPrintConfig] = useState<PrintConfig>({
    fontText: {
      font: "Arial"
    },
    fontNumber: {
      font: "Arial"
    },
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
  
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const binaryStr = evt.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

        const headerRow = data.find(row => 
          Array.isArray(row) && row.some(cell => 
            typeof cell === 'string' && 
            (cell.includes('DÒNG 1') || cell.includes('DÒNG 2') || cell.includes('KÍCH THƯỚC'))
          )
        );

        if (!headerRow) {
          toast.error("Không tìm thấy dòng tiêu đề trong file Excel. Vui lòng kiểm tra định dạng file.");
          return;
        }

        const line1Idx = headerRow.findIndex((col: any) => 
          typeof col === 'string' && (col.includes('DÒNG 1') || col.includes('TRÊN SỐ LƯNG'))
        );
        const line2Idx = headerRow.findIndex((col: any) => 
          typeof col === 'string' && (col.includes('DÒNG 2') || col.includes('SỐ LƯNG'))
        );
        const line3Idx = headerRow.findIndex((col: any) => 
          typeof col === 'string' && (col.includes('DÒNG 3') || col.includes('DƯỚI SỐ LƯNG'))
        );
        const sizeIdx = headerRow.findIndex((col: any) => 
          typeof col === 'string' && (col.includes('KÍCH THƯỚC') || col.includes('SIZE'))
        );
        const chestTextIdx = headerRow.findIndex((col: any) => 
          typeof col === 'string' && col.includes('CHỮ NGỰC')
        );
        const chestNumberIdx = headerRow.findIndex((col: any) => 
          typeof col === 'string' && col.includes('SỐ NGỰC')
        );
        const pantsNumberIdx = headerRow.findIndex((col: any) => 
          typeof col === 'string' && col.includes('SỐ QUẦN')
        );
        const fontTextIdx = headerRow.findIndex((col: any) => 
          typeof col === 'string' && col.includes('FONT CHỮ')
        );
        const fontNumberIdx = headerRow.findIndex((col: any) => 
          typeof col === 'string' && col.includes('FONT SỐ')
        );

        const newDesignData: DesignData = {
          ...designData
        };

        const dataRow = data[headerRow.length > 0 ? headerRow.length : 0];
        if (dataRow) {
          if (fontTextIdx !== -1 && dataRow[fontTextIdx]) {
            newDesignData.font_text = {
              font: String(dataRow[fontTextIdx])
            };
          }
          
          if (fontNumberIdx !== -1 && dataRow[fontNumberIdx]) {
            newDesignData.font_number = {
              font: String(dataRow[fontNumberIdx])
            };
          }

          if (line1Idx !== -1 && dataRow[line1Idx]) {
            newDesignData.line_1 = {
              content: String(dataRow[line1Idx]),
              material: "In chuyển nhiệt",
              color: "Đen",
              enabled: true
            };
          }
          
          if (line3Idx !== -1 && dataRow[line3Idx]) {
            newDesignData.line_3 = {
              content: String(dataRow[line3Idx]),
              material: "In chuyển nhiệt",
              color: "Đen",
              enabled: true
            };
          }
          
          if (chestTextIdx !== -1 && dataRow[chestTextIdx]) {
            newDesignData.chest_text = {
              content: String(dataRow[chestTextIdx]),
              material: "In chuyển nhiệt",
              color: "Đen",
              enabled: true
            };
          }

          if (line2Idx !== -1 && dataRow[line2Idx] === "1" || dataRow[line2Idx] === "true" || dataRow[line2Idx] === "có") {
            newDesignData.line_2 = {
              material: "In chuyển nhiệt",
              color: "Đen",
              enabled: true
            };
          }
          
          if (chestNumberIdx !== -1 && dataRow[chestNumberIdx] === "1" || dataRow[chestNumberIdx] === "true" || dataRow[chestNumberIdx] === "có") {
            newDesignData.chest_number = {
              material: "In chuyển nhiệt",
              color: "Đen",
              enabled: true
            };
          }
          
          if (pantsNumberIdx !== -1 && dataRow[pantsNumberIdx] === "1" || dataRow[pantsNumberIdx] === "true" || dataRow[pantsNumberIdx] === "có") {
            newDesignData.pants_number = {
              material: "In chuyển nhiệt",
              color: "Đen",
              enabled: true
            };
          }
        }

        setDesignData(newDesignData);
        
        if (newDesignData.font_text?.font || newDesignData.font_number?.font) {
          const updatedConfig: PrintConfig = { ...printConfig };
          
          if (newDesignData.font_text?.font) {
            updatedConfig.fontText = {
              font: newDesignData.font_text.font
            };
          }
          
          if (newDesignData.font_number?.font) {
            updatedConfig.fontNumber = {
              font: newDesignData.font_number.font
            };
          }
          
          setPrintConfig(updatedConfig);
        }

        toast.success("Đã tải thông tin in từ file Excel");
      } catch (error) {
        console.error("Excel import error:", error);
        toast.error("Lỗi khi xử lý file Excel. Vui lòng kiểm tra định dạng file.");
      }
    };
    
    reader.readAsBinaryString(file);
    e.target.value = "";
  };
  
  useEffect(() => {
    return () => {
      referenceImagesPreview.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);
  
  const generateProductLines = useCallback(() => {
    if (players.length === 0) return;

    const hasPlayersWithImages = players.some(p => p.printImage);
    
    let newProductLines: ProductLine[] = [];
    
    if (designData.line_2?.enabled) {
      newProductLines.push({
        id: `product-back-number-${Date.now()}`,
        product: "Áo thi đấu",
        position: "In số lưng",
        material: designData.line_2.material || printConfig.backMaterial,
        size: "Lớn",
        points: 1,
        content: "Số áo"
      });
    }
    
    if (designData.line_1?.enabled && designData.line_1.content) {
      newProductLines.push({
        id: `product-above-back-${Date.now() + 1}`,
        product: "Áo thi đấu",
        position: "In trên số lưng",
        material: designData.line_1.material || printConfig.backMaterial,
        size: "Trung bình",
        points: 1,
        content: designData.line_1.content
      });
    }
    
    if (designData.line_3?.enabled && designData.line_3.content) {
      newProductLines.push({
        id: `product-below-back-${Date.now() + 2}`,
        product: "Áo thi đấu",
        position: "In dưới số lưng",
        material: designData.line_3.material || printConfig.backMaterial,
        size: "Nhỏ",
        points: 1,
        content: designData.line_3.content
      });
    }
    
    if (designData.chest_number?.enabled && hasPlayersWithImages) {
      newProductLines.push({
        id: `product-chest-number-${Date.now() + 3}`,
        product: "Áo thi đấu",
        position: "In số giữa bụng",
        material: designData.chest_number.material || printConfig.frontMaterial,
        size: "Trung bình",
        points: 1,
        content: "Số áo"
      });
    }
    
    if (designData.chest_text?.enabled && designData.chest_text.content) {
      newProductLines.push({
        id: `product-chest-text-${Date.now() + 4}`,
        product: "Áo thi đấu",
        position: "In chữ ngực",
        material: designData.chest_text.material || printConfig.frontMaterial,
        size: "Nhỏ",
        points: 1,
        content: designData.chest_text.content
      });
    }
    
    if (designData.pants_number?.enabled) {
      newProductLines.push({
        id: `product-pants-number-${Date.now() + 5}`,
        product: "Quần thi đấu",
        position: "In số quần",
        material: designData.pants_number.material || printConfig.legMaterial,
        size: "Nhỏ",
        points: 1,
        content: "Số áo"
      });
    }
    
    if (designData.pet_chest?.enabled && designData.pet_chest.content) {
      newProductLines.push({
        id: `product-pet-chest-${Date.now() + 6}`,
        product: "Áo thi đấu",
        position: "In PET ngực",
        material: designData.pet_chest.material || "In chuyển nhiệt",
        size: "Trung bình",
        points: 1,
        content: designData.pet_chest.content
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
        case 'pants':
          position = 'In logo quần';
          break;
        default:
          position = 'In logo ngực trái';
      }
      
      const logoName = logo.file.name.split('/').pop()?.split('.')[0] || `Logo ${index + 1}`;
      
      newProductLines.push({
        id: `product-logo-${Date.now() + 7 + index}`,
        product: logo.position === 'pants' ? "Quần thi đấu" : "Áo thi đấu",
        position,
        material: printConfig.frontMaterial,
        size: "Trung bình",
        points: 1,
        content: logoName
      });
    });
    
    setProductLines(newProductLines);
  }, [players, teamName, printConfig, logos, designData]);

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

  const uploadFontFiles = async (orderId: string): Promise<{ textFontPath?: string, numberFontPath?: string }> => {
    const result: { textFontPath?: string, numberFontPath?: string } = {};
    
    if (printConfig.fontText.customFontFile) {
      try {
        const file = printConfig.fontText.customFontFile;
        const fileExt = file.name.split('.').pop();
        const filePath = `${orderId}/fonts/text-${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('fonts')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error(`Error uploading text font:`, error);
          toast.error(`Không thể tải lên font chữ: ${error.message}`);
        } else {
          const { data: urlData } = supabase.storage
            .from('fonts')
            .getPublicUrl(data.path);
            
          console.log(`Text font public URL: ${urlData.publicUrl}`);
          result.textFontPath = data.path;
          
          setDesignData(prev => ({
            ...prev,
            font_text: {
              ...prev.font_text,
              font_file: data.path
            }
          }));
        }
      } catch (err) {
        console.error(`Error uploading text font:`, err);
        toast.error(`Có lỗi khi tải lên font chữ`);
      }
    }
    
    if (printConfig.fontNumber.customFontFile) {
      try {
        const file = printConfig.fontNumber.customFontFile;
        const fileExt = file.name.split('.').pop();
        const filePath = `${orderId}/fonts/number-${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('fonts')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error(`Error uploading number font:`, error);
          toast.error(`Không thể tải lên font số: ${error.message}`);
        } else {
          const { data: urlData } = supabase.storage
            .from('fonts')
            .getPublicUrl(data.path);
            
          console.log(`Number font public URL: ${urlData.publicUrl}`);
          result.numberFontPath = data.path;
          
          setDesignData(prev => ({
            ...prev,
            font_number: {
              ...prev.font_number,
              font_file: data.path
            }
          }));
        }
      } catch (err) {
        console.error(`Error uploading number font:`, err);
        toast.error(`Có lỗi khi tải lên font số`);
      }
    }
    
    return result;
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
      
      const fontPaths = await uploadFontFiles(orderId);
      
      let finalDesignData = {
        ...designData,
        font_text: {
          font: printConfig.fontText.font,
          font_file: fontPaths.textFontPath || designData.font_text.font_file
        },
        font_number: {
          font: printConfig.fontNumber.font,
          font_file: fontPaths.numberFontPath || designData.font_number.font_file
        }
      };
      
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
          
          const position = { x: 0, y: 0, scale: 1.0 };
          
          const logoPositionData = {
            logo_id: logo.id,
            x_position: position.x,
            y_position: position.y,
            scale: position.scale
          };
          
          finalDesignData = {
            ...finalDesignData,
            [`logo_${logo.position}`]: logoPositionData
          };
        }
      }
      
      finalDesignData.reference_images = referenceImagePaths;
      
      console.log("Inserting order with design_data:", finalDesignData);
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          team_name: teamName,
          status: 'new',
          total_cost: totalCost,
          design_image_front: frontPath,
          design_image_back: backPath,
          reference_images: referenceImagePaths,
          notes: notes,
          design_data: JSON.stringify(finalDesignData)
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
      
      const { error: printConfigError } = await supabase
        .from('print_configs')
        .insert({
          order_id: orderId,
          font: finalDesignData.font_text.font,
          font_file: finalDesignData.font_text.font_file,
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
        console.error("Error adding product lines:", linesError);
        throw linesError;
      }
      
      setIsSubmitting(false);
      toast.success("Đơn hàng đã được tạo thành công!");
      navigate("/order-confirmation", { 
        state: { 
          orderId,
          teamName,
          totalCost
        } 
      });
      
    } catch (err) {
      console.error("Error submitting order:", err);
      toast.error(`Lỗi khi tạo đơn hàng: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-2xl font-bold">Tạo đơn hàng mới</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="players">Cầu thủ</TabsTrigger>
            <TabsTrigger value="logos">Logo</TabsTrigger>
