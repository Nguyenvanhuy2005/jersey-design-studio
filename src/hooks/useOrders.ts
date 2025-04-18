import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { dbOrderToOrder } from '@/utils/adapters';

interface UseOrdersProps {
  statusFilter: string;
  customerFilter: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export const useOrders = ({ statusFilter, customerFilter, dateRange }: UseOrdersProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchingData, setFetchingData] = useState(true);

  const fetchOrders = async () => {
    setFetchingData(true);
    setFetchError(null);
    console.log("Fetching orders data...");
    
    try {
      let query = supabase
        .from('orders')
        .select('*');
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (customerFilter && customerFilter !== 'all') {
        query = query.eq('customer_id', customerFilter);
      }
      
      if (dateRange.from) {
        const fromDate = format(dateRange.from, 'yyyy-MM-dd');
        query = query.gte('created_at', `${fromDate}T00:00:00`);
      }
      
      if (dateRange.to) {
        const toDate = format(dateRange.to, 'yyyy-MM-dd');
        query = query.lte('created_at', `${toDate}T23:59:59`);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data: ordersData, error: ordersError } = await query;
      
      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        setFetchError(`Không thể tải dữ liệu đơn hàng: ${ordersError.message}`);
        setOrders([]);
        setFetchingData(false);
        return;
      }
      
      if (!ordersData || ordersData.length === 0) {
        console.log("No orders found");
        setOrders([]);
        setFetchingData(false);
        return;
      }

      const transformedOrders: Order[] = await Promise.all(ordersData.map(async order => {
        let customerName = "Không xác định";
        let customerEmail = undefined;
        let customerPhone = undefined;
        let customerAddress = undefined;
        
        if (order.customer_id) {
          const { data: customerData } = await supabase
            .from('customers')
            .select('name, phone, address')
            .eq('id', order.customer_id)
            .single();
            
          if (customerData) {
            customerName = customerData.name || "Không xác định";
            customerPhone = customerData.phone;
            customerAddress = customerData.address;
          }
        }
        
        const { data: playersData } = await supabase
          .from('players')
          .select('*')
          .eq('order_id', order.id);
          
        const players = playersData ? playersData.map(player => {
          return {
            id: player.id,
            name: player.name || "",
            number: String(player.number),
            size: player.size as 'S' | 'M' | 'L' | 'XL',
            printImage: player.print_image || false,
            uniform_type: player.uniform_type as 'player' | 'goalkeeper' || 'player',
            line_1: player.line_1 || undefined,
            line_2: String(player.number),
            line_3: player.line_3 || undefined,
            chest_number: player.chest_number || false,
            pants_number: player.pants_number || false,
            logo_chest_left: player.logo_chest_left || false,
            logo_chest_right: player.logo_chest_right || false,
            logo_chest_center: player.logo_chest_center || false,
            logo_sleeve_left: player.logo_sleeve_left || false,
            logo_sleeve_right: player.logo_sleeve_right || false,
            logo_pants: player.logo_pants || false,
            note: player.note || undefined,
            print_style: player.print_style || undefined
          };
        }) : [];
        
        const { data: productLinesData } = await supabase
          .from('product_lines')
          .select('*')
          .eq('order_id', order.id);
          
        const productLines = productLinesData ? productLinesData.map(line => ({
          id: line.id,
          product: line.product,
          position: line.position,
          material: line.material,
          size: line.size,
          points: line.points || 0,
          content: line.content || ''
        })) : [];
        
        const { data: printConfigData } = await supabase
          .from('print_configs')
          .select('*')
          .eq('order_id', order.id)
          .single();
          
        let refImages: string[] = [];
        if (order.reference_images) {
          if (typeof order.reference_images === 'string') {
            try {
              refImages = JSON.parse(order.reference_images);
            } catch (e) {
              refImages = [];
            }
          } else if (Array.isArray(order.reference_images)) {
            refImages = order.reference_images.filter(item => typeof item === 'string').map(item => String(item));
          }
        }
        
        let teamName = '';
        if (order.team_name) {
          teamName = order.team_name;
        } else if (order.design_data && typeof order.design_data === 'object') {
          teamName = (order.design_data as any)?.team_name || '';
        }
        
        return {
          id: order.id,
          status: order.status as 'new' | 'processing' | 'completed',
          totalCost: order.total_cost,
          createdAt: new Date(order.created_at || ''),
          notes: order.notes || '',
          referenceImages: refImages,
          customerName: customerName,
          customerId: order.customer_id,
          customerEmail: customerEmail,
          customerPhone: customerPhone,
          customerAddress: customerAddress,
          teamName: teamName,
          players: players,
          productLines: productLines,
          printConfig: printConfigData ? {
            id: printConfigData.id,
            font: printConfigData.font || 'Arial',
            backMaterial: printConfigData.back_material || 'In chuyển nhiệt',
            backColor: printConfigData.back_color || 'Đen',
            frontMaterial: printConfigData.front_material || 'In chuyển nhiệt',
            frontColor: printConfigData.front_color || 'Đen',
            sleeveMaterial: printConfigData.sleeve_material || 'In chuyển nhiệt',
            sleeveColor: printConfigData.sleeve_color || 'Đen',
            legMaterial: printConfigData.leg_material || 'In chuyển nhiệt',
            legColor: printConfigData.leg_color || 'Đen'
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
          designData: order.design_data
        };
      }));
      
      setOrders(transformedOrders);
    } catch (e) {
      console.error("Exception in fetchOrders:", e);
      setFetchError(`Có lỗi xảy ra khi tải dữ liệu: ${e instanceof Error ? e.message : 'Unknown error'}`);
      setOrders([]);
    } finally {
      setFetchingData(false);
    }
  };

  return {
    orders,
    fetchError,
    fetchingData,
    fetchOrders
  };
};
