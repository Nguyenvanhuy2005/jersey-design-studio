
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player, Logo, DesignData, ProductLine, Customer } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { 
  createStorageBucketsIfNeeded, 
  uploadDesignImage,
  checkFileExistsInStorage
} from '@/utils/image-utils';

interface OrderSubmissionProps {
  user: any;
  players: Player[];
  logos: Logo[];
  designData: Partial<DesignData>;
  notes: string;
  customerInfo: Customer;
  productLines: ProductLine[];
  referenceImages: File[];
  totalCost: number;
  setIsSubmitting: (value: boolean) => void;
  fontText: string;
  fontNumber: string;
  printStyle: string;
  printColor: string;
}

export const useOrderSubmission = ({
  user,
  players,
  logos,
  designData,
  notes,
  customerInfo,
  productLines,
  referenceImages,
  totalCost,
  setIsSubmitting,
  fontText,
  fontNumber,
  printStyle,
  printColor
}: OrderSubmissionProps) => {
  const navigate = useNavigate();
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);

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

  const generateOrderDesignImages = async (orderId: string, jerseyCanvasRef: React.RefObject<HTMLCanvasElement>, pantCanvasRef: React.RefObject<HTMLCanvasElement>): Promise<{ frontPath: string; backPath: string; pantsPath: string; }> => {
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

  const uploadReferenceImages = async (orderId: string, referenceImages: File[]): Promise<string[]> => {
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

  const submitOrder = async (jerseyCanvasRef: React.RefObject<HTMLCanvasElement>, pantCanvasRef: React.RefObject<HTMLCanvasElement>) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt đơn hàng");
      return;
    }
    
    if (players.length === 0) {
      toast.error("Vui lòng thêm ít nhất một cầu thủ vào danh sách");
      return;
    }
    
    if (!customerInfo.name || !customerInfo.address || !customerInfo.phone) {
      toast.error("Vui lòng nhập đầy đủ thông tin khách hàng");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createStorageBucketsIfNeeded();
      
      const orderId = uuidv4();
      const logoUrls: string[] = [];
      
      console.log("Starting design images generation...");
      const { frontPath, backPath, pantsPath } = await generateOrderDesignImages(orderId, jerseyCanvasRef, pantCanvasRef);
      
      if (!frontPath && !backPath) {
        console.warn("No design images were generated, but continuing with order submission");
        toast.warning("Không thể tạo ảnh thiết kế, nhưng vẫn tiếp tục đơn hàng của bạn.");
      } else {
        console.log("Design images generated successfully:", { frontPath, backPath, pantsPath });
      }
      
      const referenceImagePaths = await uploadReferenceImages(orderId, referenceImages);
      
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
      
      const playerCount = players.filter(p => (p as any).uniform_type !== 'goalkeeper').length;
      const goalkeeperCount = players.filter(p => (p as any).uniform_type === 'goalkeeper').length;
      
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
      
      toast.success("Đơn hàng đã được tạo thành công!");
      navigate('/orders');
      
    } catch (err) {
      console.error(`Error submitting order:`, err);
      toast.error(`Có lỗi khi đặt đơn hàng: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isGeneratingDesign,
    submitOrder
  };
};
