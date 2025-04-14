import { supabase } from "@/integrations/supabase/client";
import { Order, Customer, DesignData } from "@/types";
import { toast } from "sonner";

export const fetchOrders = async (): Promise<{ orders: Order[], error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        players(*), 
        product_lines(*), 
        print_configs(*),
        customers(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching orders:", error);
      return { 
        orders: [], 
        error: `Không thể tải dữ liệu đơn hàng: ${error.message}`
      };
    }
    
    if (!data || data.length === 0) {
      console.log("No orders found");
      return { orders: [], error: null };
    }
    
    const transformedOrders: Order[] = await Promise.all(data.map(async (order: any) => {
      // Transform customer data
      let customerInfo: Customer | undefined = undefined;
      if (order.customers) {
        if (Array.isArray(order.customers) && order.customers.length > 0) {
          const customerData = order.customers[0];
          if (customerData) {
            customerInfo = {
              id: customerData.id,
              name: customerData.name || '',
              address: customerData.address || '',
              phone: customerData.phone || '',
              delivery_note: customerData.delivery_note || '',
              created_at: customerData.created_at ? new Date(customerData.created_at) : undefined
            };
          }
        }
      }
      
      // Process reference images
      const processedReferenceImages: string[] = Array.isArray(order.reference_images)
        ? order.reference_images.filter((item: any) => typeof item === 'string')
        : [];
      
      // Process design data
      let typedDesignData: DesignData | undefined = undefined;
      if (order.design_data && typeof order.design_data === 'object') {
        const rawData: any = order.design_data;
        typedDesignData = {
          uniform_type: rawData.uniform_type as 'player' | 'goalkeeper' | 'mixed' | undefined,
          quantity: rawData.quantity,
          logos: Array.isArray(rawData.logos) ? rawData.logos.map((logo: any) => ({
            logo_id: logo.logo_id || '',
            position: logo.position || '',
            x_position: Number(logo.x_position) || 0,
            y_position: Number(logo.y_position) || 0,
            scale: Number(logo.scale) || 1.0,
          })) : undefined,
          // Other design data processing...
          font_text: rawData.font_text ? {
            font: rawData.font_text.font || 'Arial',
            font_file: rawData.font_text.font_file
          } : {
            font: 'Arial'
          },
          font_number: rawData.font_number ? {
            font: rawData.font_number.font || 'Arial',
            font_file: rawData.font_number.font_file
          } : {
            font: 'Arial'
          },
          print_style: rawData.print_style,
          print_color: rawData.print_color,
          reference_images: Array.isArray(rawData.reference_images) ? rawData.reference_images : []
        };
      }

      return {
        id: order.id,
        teamName: order.team_name || '',
        status: order.status as 'new' | 'processing' | 'completed',
        totalCost: order.total_cost,
        createdAt: new Date(order.created_at || ''),
        notes: order.notes || '',
        designImage: order.design_image || '',
        designImageFront: order.design_image_front || '',
        designImageBack: order.design_image_back || '',
        referenceImages: processedReferenceImages,
        customerInfo: customerInfo,
        customer_id: order.customer_id,
        players: order.players ? order.players.map((player: any) => ({
          id: player.id,
          name: player.name || '',
          number: player.number?.toString() || "0",
          size: player.size as 'S' | 'M' | 'L' | 'XL',
          printImage: player.print_image || false,
          jersey_color: player.jersey_color || '',
          uniform_type: player.uniform_type || 'player',
          line_1: player.line_1 || '',
          line_3: player.line_3 || '',
          chest_text: player.chest_text || '',
          chest_number: player.chest_number || false,
          pants_number: player.pants_number || false,
          logo_chest_left: player.logo_chest_left || false,
          logo_chest_right: player.logo_chest_right || false,
          logo_chest_center: player.logo_chest_center || false,
          logo_sleeve_left: player.logo_sleeve_left || false,
          logo_sleeve_right: player.logo_sleeve_right || false,
          pet_chest: player.pet_chest || '',
          logo_pants: player.logo_pants || false,
          note: player.note || ''
        })) : [],
        productLines: order.product_lines ? order.product_lines.map((line: any) => ({
          id: line.id,
          product: line.product,
          position: line.position,
          material: line.material,
          size: line.size,
          points: line.points || 0,
          content: line.content || ''
        })) : [],
        printConfig: order.print_configs && order.print_configs.length > 0 ? {
          id: order.print_configs[0].id,
          font: order.print_configs[0].font || 'Arial',
          backMaterial: order.print_configs[0].back_material || '',
          backColor: order.print_configs[0].back_color || '',
          frontMaterial: order.print_configs[0].front_material || '',
          frontColor: order.print_configs[0].front_color || '',
          sleeveMaterial: order.print_configs[0].sleeve_material || '',
          sleeveColor: order.print_configs[0].sleeve_color || '',
          legMaterial: order.print_configs[0].leg_material || '',
          legColor: order.print_configs[0].leg_color || ''
        } : {
          font: 'Arial',
          backMaterial: 'In chuyển nhiệt',
          backColor: 'Đen',
          frontMaterial: 'In chuyển nhiệt',
          frontColor: 'Đen',
          sleeveMaterial: 'In chuyển nhiệt',
          sleeveColor: 'Đen',
          legMaterial: 'In chuyển nhiệt',
          legColor: 'Đen'
        },
        designData: typedDesignData
      };
    }));
    
    return { orders: transformedOrders, error: null };
  } catch (e) {
    console.error("Exception in fetchOrders:", e);
    return { 
      orders: [], 
      error: `Có lỗi xảy ra khi tải dữ liệu: ${e instanceof Error ? e.message : 'Unknown error'}` 
    };
  }
};

export const updateOrderStatus = async (
  orderId: string, 
  newStatus: 'new' | 'processing' | 'completed'
): Promise<boolean> => {
  try {
    const { error } = await supabase.from('orders').update({
      status: newStatus
    }).eq('id', orderId);
    
    if (error) {
      console.error("Error updating order status:", error);
      toast.error("Không thể cập nhật trạng thái đơn hàng");
      return false;
    }
    
    toast.success(`Trạng thái đơn hàng đã được cập nhật thành ${
      newStatus === 'new' ? 'Mới' : 
      newStatus === 'processing' ? 'Đang xử lý' : 
      'Đã hoàn thành'
    }`);
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    toast.error("Không thể cập nhật trạng thái đơn hàng");
    return false;
  }
};
