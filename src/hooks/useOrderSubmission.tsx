
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { createStorageBucketsIfNeeded } from "@/utils/image-utils";
import { Player, Logo, PrintConfig, ProductLine, DesignData } from "@/types";
import { useOrderCanvasUtils } from "@/components/order/OrderCanvasUtils";
import { useOrderFileUploaders } from "@/components/order/OrderFileUploaders";

interface OrderSubmissionParams {
  players: Player[];
  logos: Logo[];
  teamName: string;
  printConfig: PrintConfig;
  productLines: ProductLine[];
  designData: DesignData;
  calculateTotalCost: () => number;
  notes: string;
  referenceImages: File[];
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setPreviewView: (view: 'front' | 'back') => void;
}

export const useOrderSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);
  const navigate = useNavigate();
  const { generateOrderDesignImages } = useOrderCanvasUtils();
  const { uploadReferenceImages, uploadFontFiles } = useOrderFileUploaders();

  const submitOrder = async ({
    players,
    logos,
    teamName,
    printConfig,
    productLines,
    designData,
    calculateTotalCost,
    notes,
    referenceImages,
    canvasRef,
    setPreviewView
  }: OrderSubmissionParams) => {
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
      const { frontPath, backPath } = await generateOrderDesignImages(
        orderId,
        canvasRef,
        setPreviewView,
        setIsGeneratingDesign
      );
      
      if (!frontPath && !backPath) {
        console.warn("No design images were generated, but continuing with order submission");
        toast.warning("Không thể tạo ảnh thiết kế, nhưng vẫn tiếp tục đơn hàng của bạn.");
      } else {
        console.log("Design images generated successfully:", { frontPath, backPath });
      }
      
      const referenceImagePaths = await uploadReferenceImages(orderId, referenceImages);
      
      const fontPaths = await uploadFontFiles(orderId, printConfig);
      
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

  return {
    submitOrder,
    isSubmitting,
    isGeneratingDesign,
    setIsGeneratingDesign
  };
};
