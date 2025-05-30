import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player, Logo, DesignData, ProductLine, Customer, DeliveryInformation } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { createStorageBucketsIfNeeded } from '@/utils/image-utils';
import { uploadReferenceImage } from '@/utils/images/reference-image-utils';
import { createBucketIfNeeded } from '@/utils/storage/file-utils';

interface OrderSubmissionProps {
  user: any;
  players: Player[];
  logos: Logo[];
  designData: Partial<DesignData>;
  notes: string;
  customerInfo: Customer;
  deliveryInfo: DeliveryInformation;
  productLines: ProductLine[];
  referenceImages: File[];
  totalCost: number;
  setIsSubmitting: (value: boolean) => void;
  fontText: string;
  fontNumber: string;
  printStyle: string;
  printColor: string;
  isAdminMode?: boolean;
  selectedCustomer?: Customer | null;
}

export const useOrderSubmission = ({
  user,
  players,
  logos,
  designData,
  notes,
  customerInfo,
  deliveryInfo,
  productLines,
  referenceImages,
  totalCost,
  setIsSubmitting,
  fontText,
  fontNumber,
  printStyle,
  printColor,
  isAdminMode = false,
  selectedCustomer = null
}: OrderSubmissionProps) => {
  const navigate = useNavigate();
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);

  const validateProductLine = (productLine: ProductLine): boolean => {
    if (!productLine.id || typeof productLine.id !== 'string') {
      console.error("[Validation] Product line missing valid ID:", productLine);
      return false;
    }
    
    if (!productLine.product || typeof productLine.product !== 'string') {
      console.error("[Validation] Product line missing valid product:", productLine);
      return false;
    }
    
    if (!productLine.position || typeof productLine.position !== 'string') {
      console.error("[Validation] Product line missing valid position:", productLine);
      return false;
    }
    
    if (!productLine.material || typeof productLine.material !== 'string') {
      console.error("[Validation] Product line missing valid material:", productLine);
      return false;
    }
    
    if (!productLine.size || typeof productLine.size !== 'string') {
      console.error("[Validation] Product line missing valid size:", productLine);
      return false;
    }
    
    return true;
  };

  const uploadReferenceImages = async (orderId: string, referenceImages: File[]): Promise<string[]> => {
    if (referenceImages.length === 0) return [];
    
    const uploadedPaths: string[] = [];
    let uploadProgress = 0;
    
    // Ensure reference_images bucket exists
    try {
      await createBucketIfNeeded('reference_images');
    } catch (bucketErr) {
      console.error("Error ensuring reference_images bucket exists:", bucketErr);
      // Continue with uploads as bucket might already exist
    }
    
    toast.info(`Đang tải lên hình ảnh tham khảo (0/${referenceImages.length})...`);
    
    for (const [index, file] of referenceImages.entries()) {
      try {
        // Log file type information to help debug JPG issues
        const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
        console.log(`Uploading reference image ${index}: ${file.name}, type: ${file.type}, extension: ${fileExt}`);
        
        // Special handling for JPG files
        if (fileExt === 'jpg' || fileExt === 'jpeg') {
          console.log(`Special handling for JPG file: ${file.name}`);
        }
        
        const path = await uploadReferenceImage(orderId, file, index);
        if (path) {
          uploadedPaths.push(path);
          uploadProgress++;
          toast.info(`Đang tải lên hình ảnh tham khảo (${uploadProgress}/${referenceImages.length})...`);
        }
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

    // Ensure logos bucket exists
    try {
      await createBucketIfNeeded('logos');
    } catch (bucketErr) {
      console.error("Error ensuring logos bucket exists:", bucketErr);
      // Continue with uploads as bucket might already exist
    }

    let uploadedLogoCount = 0;
    const totalLogos = logos.filter(logo => logo.file).length;
    
    if (totalLogos > 0) {
      toast.info(`Đang tải lên logo (0/${totalLogos})...`);
    }

    for (const logo of logos) {
      if (!logo.file) {
        console.log("Logo không có file tại vị trí:", logo.position, logo);
        continue;
      }
      
      const fileExt = logo.file.name.split('.').pop();
      const filePath = `${orderId}/${Date.now()}-${logo.position}.${fileExt}`;

      console.log(`[Upload logo] Bắt đầu upload logo vị trí: ${logo.position}, path: ${filePath}`);

      try {
        // Set appropriate content type based on file extension
        let contentType: string;
        if (fileExt === 'jpg' || fileExt === 'jpeg') {
          contentType = 'image/jpeg';
        } else if (fileExt === 'png') {
          contentType = 'image/png';
        } else {
          contentType = logo.file.type || 'application/octet-stream';
        }
        
        console.log(`Using content type ${contentType} for logo file: ${logo.file.name}`);
        
        const { data, error: uploadError } = await supabase.storage
          .from('logos')
          .upload(filePath, logo.file, {
            cacheControl: '3600',
            upsert: false,
            contentType: contentType
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

        uploadedLogoCount++;
        toast.info(`Đang tải lên logo (${uploadedLogoCount}/${totalLogos})...`);
        
        console.log(`[Upload logo] Đã upload xong logo vị trí: ${logo.position}, file_path: ${filePath}`);
      } catch (err) {
        console.error(`[Upload logo] Lỗi không xác định khi upload logo vị trí: ${logo.position}`, err);
        toast.error(`Có lỗi khi tải lên logo vị trí ${logo.position}`);
      }
    }

    if (uploadedLogoCount > 0) {
      toast.success(`[Upload logo] Đã tải lên thành công ${uploadedLogoCount}/${totalLogos} logo`);
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
    
    // In admin mode, use selected customer info
    const finalCustomerInfo = isAdminMode && selectedCustomer ? selectedCustomer : customerInfo;
    
    if (!finalCustomerInfo.name || !finalCustomerInfo.phone) {
      toast.error("Vui lòng nhập đầy đủ thông tin khách hàng");
      return;
    }
    
    if (!deliveryInfo.recipient_name || !deliveryInfo.address || !deliveryInfo.phone) {
      toast.error("Vui lòng nhập đầy đủ thông tin giao hàng");
      return;
    }
    
    setIsSubmitting(true);
    setIsGeneratingDesign(true);
    
    try {
      // Ensure all required buckets exist
      try {
        await createBucketIfNeeded('design_images');
        await createBucketIfNeeded('reference_images');
        await createBucketIfNeeded('logos');
      } catch (bucketErr) {
        console.error("Error ensuring buckets exist:", bucketErr);
        // Continue with order creation as buckets might already exist
      }
      
      // Update customer info if needed - for admin mode, use selected customer's ID
      const customerId = isAdminMode && selectedCustomer ? selectedCustomer.id : user.id;
      
      const { error: customerError } = await supabase
        .from('customers')
        .upsert({
          id: customerId,
          name: finalCustomerInfo.name,
          phone: finalCustomerInfo.phone,
          address: finalCustomerInfo.address,
          email: finalCustomerInfo.email
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

      const orderId = uuidv4();
      
      // Create order FIRST before linking delivery information
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
        font_text: {
          font: fontText
        },
        font_number: {
          font: fontNumber
        },
        print_style: printStyle
      };

      const designDataJson = prepareDesignDataForStorage(finalDesignData);

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
          customer_id: customerId // Use the determined customer ID
        });
        
      if (orderError) {
        console.error("[Create order] Error creating order:", orderError);
        toast.error(`Không thể tạo đơn hàng: ${orderError.message}`);
        setIsSubmitting(false);
        setIsGeneratingDesign(false);
        return;
      }
      
      toast.success("Đã tạo đơn hàng thành công, đang xử lý dữ liệu...");

      // AFTER creating order, now create delivery information linked to the order
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('delivery_information')
        .insert({
          customer_id: customerId, // Use the determined customer ID
          order_id: orderId,  // Now the order exists, so this reference is valid
          recipient_name: deliveryInfo.recipient_name,
          address: deliveryInfo.address,
          phone: deliveryInfo.phone,
          delivery_note: deliveryInfo.delivery_note
        })
        .select('id')
        .single();
      
      if (deliveryError) {
        console.error("Error creating delivery information:", deliveryError);
        toast.error("Không thể tạo thông tin giao hàng");
        // Continue with the order creation process even if delivery info fails
      }

      // Upload reference images
      const referenceImagePaths = await uploadReferenceImages(orderId, referenceImages);
      
      // Update the reference images in the order
      if (referenceImagePaths.length > 0) {
        const { error: updateRefImagesError } = await supabase
          .from('orders')
          .update({ reference_images: referenceImagePaths })
          .eq('id', orderId);
          
        if (updateRefImagesError) {
          console.error("Error updating reference images:", updateRefImagesError);
          toast.warning("Có lỗi khi cập nhật hình ảnh tham khảo");
        }
      }

      // Upload logos
      const { logoUrls, logoStorageEntries } = await uploadLogos(orderId, logos);

      let insertedLogoIds: string[] = [];
      if (logoStorageEntries.length > 0) {
        console.log("[Insert logo] Chuẩn bị insert các logo vào bảng logos:", logoStorageEntries);

        const { data: insertedLogos, error: insertLogosError } = await supabase
          .from('logos')
          .insert(
            logoStorageEntries.map(item => ({
              file_path: item.file_path,
              order_id: orderId,
              position: item.position
            }))
          )
          .select("id");
        if (insertLogosError) {
          console.error("[Insert logo] Lỗi insert logo vào database:", insertLogosError);
          toast.error(`Không thể lưu thông tin logo vào đơn hàng: ${insertLogosError.message}`);
        } else {
          toast.success(`[Insert logo] Đã lưu thành công ${logoStorageEntries.length} logo vào database`);
          if (Array.isArray(insertedLogos)) {
            insertedLogoIds = insertedLogos.map(log => log.id);
          }
        }
      }

      if (insertedLogoIds.length > 0) {
        const { error: logoIdsUpdateError } = await supabase
          .from('orders')
          .update({ logo_ids: insertedLogoIds })
          .eq('id', orderId);
        if (logoIdsUpdateError) {
          console.error("[Update logo_ids] Lỗi khi cập nhật logo_ids cho đơn hàng:", logoIdsUpdateError);
          toast.warning("Có lỗi khi liên kết logo với đơn hàng (logo_ids)!");
        } else {
          console.log(`[Update logo_ids] Đã cập nhật logo_ids cho đơn hàng:`, insertedLogoIds);
        }
      }

      if (players.length > 0) {
        const playersToInsert = players.map(p => ({
          order_id: orderId,
          name: p.name || null,
          number: p.number,
          size: p.size,
          print_image: p.printImage || false,
          uniform_type: p.uniform_type || 'player',
          line_1: p.line_1 || null,
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
          note: p.note || null,
          print_style: p.print_style || printStyle,
        }));
        
        const { error: playersError } = await supabase
          .from('players')
          .insert(playersToInsert);
          
        if (playersError) {
          console.error("[Insert players] Error inserting players:", playersError);
          toast.error(`Không thể lưu thông tin cầu thủ: ${playersError.message}`);
        } else {
          toast.success("Đã lưu thông tin cầu thủ thành công");
        }
      }
      
      if (productLines.length > 0) {
        const validProductLines = productLines.filter(validateProductLine);
        
        if (validProductLines.length < productLines.length) {
          console.warn(`[Insert product lines] Found ${productLines.length - validProductLines.length} invalid product lines that will be skipped`);
        }
        
        if (validProductLines.length === 0) {
          console.error("[Insert product lines] No valid product lines to insert");
          toast.warning("Không có sản phẩm in nào hợp lệ để lưu");
        } else {
          const productLinesToInsert = validProductLines.map(pl => ({
            product: pl.product,
            position: pl.position,
            material: pl.material,
            size: pl.size,
            points: pl.points || 0,
            content: pl.content || "",
            order_id: orderId
          }));

          console.log("[Insert product lines] Preparing to insert product lines:", productLinesToInsert);
          
          try {
            const { error: productLinesError } = await supabase
              .from('product_lines')
              .insert(productLinesToInsert);
              
            if (productLinesError) {
              console.error("[Insert product lines] Error inserting product lines:", productLinesError);
              toast.warning(`Có lỗi khi lưu thông tin sản phẩm in: ${productLinesError.message}`);
            } else {
              toast.success(`Đã lưu thành công ${productLinesToInsert.length} sản phẩm in`);
            }
          } catch (err) {
            console.error("[Insert product lines] Exception when inserting product lines:", err);
            toast.warning("Có lỗi khi lưu thông tin sản phẩm in");
          }
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
          console.error("[Insert print config] Error inserting print config:", printConfigError);
          toast.warning("Có lỗi khi lưu cấu hình in");
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
