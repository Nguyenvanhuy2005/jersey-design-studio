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

  const uploadLogos = async (orderId: string, logos: Logo[]): Promise<{
    logoUrls: string[];
    logoStorageEntries: { file_path: string; position: string }[];
  }> => {
    const logoStorageEntries: { file_path: string; position: string }[] = [];
    const logoUrls: string[] = [];

    if (logos.length === 0) {
      console.log("[Upload logo] Không có logo nào để upload");
      return { logoUrls, logoStorageEntries };
    }

    for (const logo of logos) {
      if (!logo.file) {
        console.log("Logo không có file tại vị trí:", logo.position, logo);
        continue;
      }
      const fileExt = logo.file.name.split('.').pop();
      const filePath = `${orderId}/${Date.now()}-${logo.position}.${fileExt}`;

      console.log(`[Upload logo] Bắt đầu upload logo vị trí: ${logo.position}, path: ${filePath}`);

      const { data, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, logo.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("[Upload logo] Lỗi upload logo vị trí:", logo.position, uploadError);
        toast.error(`Không thể tải lên logo vị trí ${logo.position}: ${uploadError.message}`);
        continue;
      }

      if (!data) {
        console.error("[Upload logo] Không có data trả về sau khi upload logo vị trí:", logo.position);
        continue;
      }

      logoStorageEntries.push({
        file_path: filePath,
        position: logo.position
      });

      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        logoUrls.push(urlData.publicUrl);
      }

      toast.success(`[Upload logo] Đã upload thành công logo vị trí: ${logo.position}`);
      console.log(`[Upload logo] Đã upload xong logo vị trí: ${logo.position}, file_path: ${filePath}`);
    }

    return { logoUrls, logoStorageEntries };
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
      // Step 1: Ensure storage buckets exist
      await createStorageBucketsIfNeeded();
      
      // Step 2: Update customer info
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
        setIsSubmitting(false);
        setIsGeneratingDesign(false);
        return;
      }

      // Generate a new order ID
      const orderId = uuidv4();
      
      // Step 3: Upload reference images
      const referenceImagePaths = await uploadReferenceImages(orderId, referenceImages);

      // Step 4: Calculate order details
      const playerCount = players.filter(p => p.uniform_type !== 'goalkeeper').length;
      const goalkeeperCount = players.filter(p => p.uniform_type === 'goalkeeper').length;
      
      const teamName = players.length > 0 
        ? (players[0].line_3 || players[0].name?.split(' ')?.[0] || "Team") 
        : "Team";
        
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

      // Step 5: CRITICAL CHANGE - Create order record BEFORE handling logos
      console.log("[Create order] Creating order record with ID:", orderId);
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          team_name: teamName,
          status: 'new',
          total_cost: totalCost,
          notes: notes,
          design_data: designDataJson,
          reference_images: referenceImagePaths,
          customer_id: user.id,
          logo_urls: [] // Initialize with empty array, will update after logo upload
        });
        
      if (orderError) {
        console.error("[Create order] Error creating order:", orderError);
        toast.error(`Không thể tạo đơn hàng: ${orderError.message}`);
        setIsSubmitting(false);
        setIsGeneratingDesign(false);
        return;
      }
      
      toast.success("Đã tạo đơn hàng thành công, đang xử lý dữ liệu...");

      // Step 6: Upload logos AFTER order creation
      const { logoUrls, logoStorageEntries } = await uploadLogos(orderId, logos);

      // Step 7: Insert logo records AFTER order creation and logo upload
      if (logoStorageEntries.length > 0) {
        console.log("[Insert logo] Chuẩn bị insert các logo vào bảng logos:", logoStorageEntries);
        
        const { error: insertLogosError } = await supabase
          .from('logos')
          .insert(
            logoStorageEntries.map(item => ({
              file_path: item.file_path,
              order_id: orderId, // Now we can safely reference the created order
              position: item.position
            }))
          );
          
        if (insertLogosError) {
          console.error("[Insert logo] Lỗi insert logo vào database:", insertLogosError);
          toast.error(`Không thể lưu thông tin logo vào đơn hàng: ${insertLogosError.message}`);
          // Continue with order creation even if logo insertion fails
        } else {
          toast.success(`[Insert logo] Đã lưu thành công ${logoStorageEntries.length} logo vào database`);
          
          // Update order with logo urls if logos were uploaded successfully
          if (logoUrls.length > 0) {
            const { error: updateOrderError } = await supabase
              .from('orders')
              .update({ 
                logo_url: logoUrls[0], // First logo as primary
                logo_urls: logoUrls 
              })
              .eq('id', orderId);
              
            if (updateOrderError) {
              console.error("[Update order] Error updating order with logo URLs:", updateOrderError);
              toast.warning("Đã tải lên logo nhưng không thể cập nhật vào đơn hàng");
            }
          }
        }
      }

      // Step 8: Insert players
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
        
        const { error: playersError } = await supabase
          .from('players')
          .insert(playersToInsert);
          
        if (playersError) {
          console.error("[Insert players] Error inserting players:", playersError);
          toast.error(`Không thể lưu thông tin cầu thủ: ${playersError.message}`);
          // Continue with order creation even if player insertion fails
        } else {
          toast.success("Đã lưu thông tin cầu thủ thành công");
        }
      }
      
      // Step 9: Insert product lines
      if (productLines.length > 0) {
        const productLinesToInsert = productLines.map(pl => ({
          ...pl,
          order_id: orderId
        }));
        
        const { error: productLinesError } = await supabase
          .from('product_lines')
          .insert(productLinesToInsert);
          
        if (productLinesError) {
          console.error("[Insert product lines] Error inserting product lines:", productLinesError);
          toast.warning("Có lỗi khi lưu thông tin sản phẩm in");
          // Continue with order creation even if product line insertion fails
        } else {
          toast.success("Đã lưu thông tin sản phẩm in thành công");
        }
      }
      
      // Step 10: Insert print config
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
          console.error("[Insert print config] Error inserting print config:", printConfigError);
          toast.warning("Có lỗi khi lưu cấu hình in");
          // Continue with order creation even if print config insertion fails
        }
      }
      
      toast.success("Đơn hàng đã được tạo thành công!");
      navigate('/thank-you');
      
    } catch (err) {
      console.error(`[submitOrder] Error submitting order:`, err);
      toast.error(`Có lỗi khi đặt đơn hàng: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
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
