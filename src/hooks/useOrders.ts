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

      const transformedOrders: Order[] = await Promise.all(
        ordersData.map(async (dbOrder) => {
          const { data: customerData } = await supabase
            .from('customers')
            .select('*')
            .eq('id', dbOrder.customer_id)
            .single();
            
          const { data: playersData } = await supabase
            .from('players')
            .select('*')
            .eq('order_id', dbOrder.id);
            
          const { data: productLinesData } = await supabase
            .from('product_lines')
            .select('*')
            .eq('order_id', dbOrder.id);
            
          const { data: printConfigData } = await supabase
            .from('print_configs')
            .select('*')
            .eq('order_id', dbOrder.id)
            .single();
          
          return dbOrderToOrder(
            dbOrder, 
            customerData || undefined, 
            playersData || undefined, 
            productLinesData || undefined,
            printConfigData || undefined
          );
        })
      );
      
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
