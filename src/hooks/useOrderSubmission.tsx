
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player, Logo, DesignData, ProductLine, Customer } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { createStorageBucketsIfNeeded } from '@/utils/image-utils';

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

  const submitOrder = async () => {
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
    setIsGeneratingDesign(true);
    
    try {
      const { error: customerError } = await supabase
        .from('customers')
        .upsert({
          id: user.id,
          name: customerInfo.name,
          address: customerInfo.address,
          phone: customerInfo.phone,
          delivery_note: customerInfo.delivery_note
        }, {
          onConflict: 'id'
        });
          
      if (customerError) {
        console.error("Error updating customer info:", customerError);
        toast.error("Không thể cập nhật thông tin khách hàng");
        return;
      }

      await createStorageBucketsIfNeeded();
      
      const orderId = uuidv4();
      const logoStorageEntries: {
        file_path: string;
        position: string;
      }[] = [];

      const referenceImagePaths = await uploadReferenceImages(orderId, referenceImages);
      
      if (logos.length > 0) {
        for (const logo of logos) {
          if (!logo.file) continue;
          const fileExt = logo.file.name.split('.').pop();
          const filePath = `${orderId}/${Date.now()}-${logo.position}.${fileExt}`;
          
          const { data, error: uploadError } = await supabase.storage
            .from('logos')
            .upload(filePath, logo.file, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (uploadError) {
            console.error("Error uploading logo:", uploadError);
            throw uploadError;
          }

          if (!data) {
            console.error("No data returned from logo upload");
            continue;
          }

          logoStorageEntries.push({
            file_path: filePath,
            position: logo.position
          });
        }

        const { error: insertLogosError } = await supabase
          .from('logos')
          .insert(
            logoStorageEntries.map(item => ({
              file_path: item.file_path,
              order_id: orderId,
              position: item.position
            }))
          );
          
        if (insertLogosError) {
          console.error("Error inserting logo records:", insertLogosError);
          toast.error("Không thể lưu thông tin logo vào đơn hàng");
        }
      }

      // Define logoUrls as let instead of const since we'll reassign it
      let logoUrls: string[] = [];
      if (logoStorageEntries.length > 0) {
        logoUrls = logoStorageEntries.map(item => {
          const { data: urlData } = supabase.storage
            .from('logos')
            .getPublicUrl(item.file_path);
          return urlData.publicUrl;
        });
      }

      const playerCount = players.filter(p => p.uniform_type !== 'goalkeeper').length;
      const goalkeeperCount = players.filter(p => p.uniform_type === 'goalkeeper').length;
      
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
        print_style: printStyle
      };

      const designDataJson = prepareDesignDataForStorage(finalDesignData);

      const teamName = players.length > 0 
        ? (players[0].line_3 || players[0].name?.split(' ')?.[0] || "Team") 
        : "Team";

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          team_name: teamName,
          logo_url: logoUrls.length > 0 ? logoUrls[0] : null,
          status: 'new',
          total_cost: totalCost,
          notes: notes,
          design_data: designDataJson,
          reference_images: referenceImagePaths,
          customer_id: user.id
        });
        
      if (orderError) {
        console.error("Error creating order:", orderError);
        throw orderError;
      }

      if (players.length > 0) {
        const playersToInsert = players.map(p => ({
          order_id: orderId,
          name: p.name || null,
          number: parseInt(p.number) || 0,
          size: p.size,
          print_image: p.printImage || false,
          uniform_type: p.uniform_type || 'player',
          line_1: p.line_1 || null,
          line_3: p.line_3 || null,
          chest_number: p.chest_number || false,
          pants_number: p.pants_number || false,
          logo_chest_left: p.logo_chest_left || false,
          logo_chest_right: p.logo_chest_right || false,
          logo_chest_center: p.logo_chest_center || false,
          logo_sleeve_left: p.logo_sleeve_left || false,
          logo_sleeve_right: p.logo_sleeve_right || false,
          logo_pants: p.logo_pants || false,
          note: p.note || null,
          print_style: p.print_style || printStyle,
        }));
        
        const { error: playersError, data: insertedPlayers } = await supabase
          .from('players')
          .insert(playersToInsert)
          .select();
          
        if (playersError) {
          console.error("Error inserting players:", playersError);
          throw new Error(`Error saving player data: ${playersError.message}`);
        }

        console.log("Successfully inserted players:", insertedPlayers);
      }
      
      if (productLines.length > 0) {
        const productLinesToInsert = productLines.map(pl => ({
          ...pl,
          order_id: orderId
        }));
        
        const { error: productLinesError } = await supabase
          .from('product_lines')
          .insert(productLinesToInsert);
          
        if (productLinesError) {
          console.error("Error inserting product lines:", productLinesError);
          toast.warning("Có lỗi khi lưu thông tin sản phẩm in, vui lòng kiểm tra lại");
        }
      }
      
      if (printStyle) {
        const { error: printConfigError } = await supabase
          .from('print_configs')
          .insert({
            order_id: orderId,
            font: fontText,
            back_material: printStyle,
            front_material: printStyle,
            sleeve_material: printStyle,
            leg_material: printStyle
          });
          
        if (printConfigError) {
          console.error("Error inserting print config:", printConfigError);
          toast.warning("Có lỗi khi lưu cấu hình in, vui lòng kiểm tra lại");
        }
      }
      
      toast.success("Đơn hàng đã được tạo thành công!");
      navigate('/orders');
      
    } catch (err) {
      console.error(`Error submitting order:`, err);
      toast.error(`Có lỗi khi đặt đơn hàng: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
      setIsGeneratingDesign(false);
    }
  };

  return {
    isGeneratingDesign,
    submitOrder
  };
};
