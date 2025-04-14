
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Logo, Customer, Player } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface UseOrderSubmissionProps {
  user: any;
  players: Player[];
  logos: Logo[];
  designData: any;
  notes: string;
  customerInfo: Customer;
  productLines: any[];
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
}: UseOrderSubmissionProps) => {
  const navigate = useNavigate();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  const submitOrder = async (jerseyCanvasRef: any, pantCanvasRef: any) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt đơn hàng");
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      // Create order reference
      const orderId = uuidv4();
      console.log(`Creating order with ID: ${orderId}`);
      
      // Step 1: Upload reference images to storage
      const referenceImagePaths = [];
      setUploadProgress(5);
      
      for (let i = 0; i < referenceImages.length; i++) {
        const file = referenceImages[i];
        const fileExt = file.name.split('.').pop();
        const filePath = `${orderId}/${Date.now()}-ref-${i}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('reference_images')
          .upload(filePath, file);
        
        if (uploadError) {
          console.error(`Error uploading reference image ${i}:`, uploadError);
          continue;
        }
        
        referenceImagePaths.push(filePath);
        setUploadProgress(5 + Math.floor((i + 1) * 15 / referenceImages.length));
      }
      
      // Step 2: Upload jersey design previews from canvas
      const designImages: Record<string, string> = {};
      setUploadProgress(20);
      
      if (jerseyCanvasRef.current) {
        // Front view
        const frontImageUrl = jerseyCanvasRef.current.toDataURL('image/png');
        const frontBlob = await fetch(frontImageUrl).then(r => r.blob());
        const frontFilePath = `${orderId}/jersey-front.png`;
        
        const { error: frontUploadError } = await supabase.storage
          .from('design_images')
          .upload(frontFilePath, frontBlob);
          
        if (frontUploadError) {
          console.error("Error uploading front design image:", frontUploadError);
        } else {
          designImages.front = frontFilePath;
        }
        
        setUploadProgress(30);
        
        // Back view (changing canvas content and capturing again)
        // ... (assuming you have logic to switch to back view)
        const backImageUrl = jerseyCanvasRef.current.toDataURL('image/png');
        const backBlob = await fetch(backImageUrl).then(r => r.blob());
        const backFilePath = `${orderId}/jersey-back.png`;
        
        const { error: backUploadError } = await supabase.storage
          .from('design_images')
          .upload(backFilePath, backBlob);
          
        if (backUploadError) {
          console.error("Error uploading back design image:", backUploadError);
        } else {
          designImages.back = backFilePath;
        }
        
        setUploadProgress(40);
      }
      
      // Upload pants design if available
      if (pantCanvasRef.current) {
        const pantsImageUrl = pantCanvasRef.current.toDataURL('image/png');
        const pantsBlob = await fetch(pantsImageUrl).then(r => r.blob());
        const pantsFilePath = `${orderId}/pants.png`;
        
        const { error: pantsUploadError } = await supabase.storage
          .from('design_images')
          .upload(pantsFilePath, pantsBlob);
          
        if (pantsUploadError) {
          console.error("Error uploading pants design image:", pantsUploadError);
        } else {
          designImages.pants = pantsFilePath;
        }
      }
      
      setUploadProgress(50);
      
      // Step 3: Insert order data
      const enhancedDesignData = {
        ...designData,
        uniform_type: players.some(p => p.uniform_type === 'goalkeeper') ? 'mixed' : 'player',
        quantity: players.length,
        font_text: { font: fontText },
        font_number: { font: fontNumber },
        print_style: printStyle,
        print_color: printColor,
        reference_images: referenceImagePaths
      };
      
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          customer_id: user.id,
          team_name: customerInfo.name,
          total_cost: totalCost,
          status: 'new',
          notes: notes,
          design_image_front: designImages.front || null,
          design_image_back: designImages.back || null,
          reference_images: referenceImagePaths,
          design_data: enhancedDesignData
        });
        
      if (orderError) {
        throw new Error(`Error creating order: ${orderError.message}`);
      }
      
      setUploadProgress(60);
      
      // Step 4: Insert print config
      const { error: printConfigError } = await supabase
        .from('print_configs')
        .insert({
          order_id: orderId,
          font: fontText,
          back_material: printStyle,
          back_color: printColor,
          front_material: printStyle,
          front_color: printColor,
          sleeve_material: printStyle,
          sleeve_color: printColor,
          leg_material: printStyle,
          leg_color: printColor
        });
        
      if (printConfigError) {
        console.error("Error creating print config:", printConfigError);
      }
      
      setUploadProgress(70);
      
      // Step 5: Insert players
      // Convert string numbers to integers for database compatibility
      const playersData = players.map(player => ({
        order_id: orderId,
        name: player.name,
        number: parseInt(player.number) || 0, // Convert string to number
        size: player.size,
        print_image: player.printImage,
        jersey_color: player.jersey_color,
        uniform_type: player.uniform_type,
        line_1: player.line_1 || player.name,
        line_3: player.line_3,
        chest_text: player.chest_text,
        chest_number: player.chest_number,
        pants_number: player.pants_number,
        logo_chest_left: player.logo_chest_left,
        logo_chest_right: player.logo_chest_right,
        logo_chest_center: player.logo_chest_center,
        logo_sleeve_left: player.logo_sleeve_left,
        logo_sleeve_right: player.logo_sleeve_right,
        pet_chest: player.pet_chest,
        logo_pants: player.logo_pants,
        note: player.note
      }));
      
      const { error: playersError } = await supabase
        .from('players')
        .insert(playersData);
        
      if (playersError) {
        console.error("Error adding players:", playersError);
      }
      
      setUploadProgress(80);
      
      // Step 6: Insert product lines
      if (productLines.length > 0) {
        const productLineData = productLines.map(line => ({
          ...line,
          order_id: orderId
        }));
        
        const { error: productLinesError } = await supabase
          .from('product_lines')
          .insert(productLineData);
          
        if (productLinesError) {
          console.error("Error adding product lines:", productLinesError);
        }
      }
      
      setUploadProgress(90);
      
      // If we made it this far, consider the order successful
      toast.success("Đơn hàng đã được tạo thành công!");
      navigate('/order-confirmation', { 
        state: { 
          orderId, 
          playerCount: players.length,
          customerName: customerInfo.name
        }
      });
      
      setUploadProgress(100);
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitOrder, uploadProgress };
};
