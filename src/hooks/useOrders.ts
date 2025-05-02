
import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { dbOrderToOrder } from '@/utils/adapters';
import { useAuth } from '@/contexts/AuthContext';

interface UseOrdersProps {
  statusFilter: string;
  customerFilter: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export const useOrders = ({ statusFilter, customerFilter, dateRange }: UseOrdersProps) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchingData, setFetchingData] = useState(true);
  
  const fetchOrders = async () => {
    setFetchingData(true);
    setFetchError(null);
    console.log("Fetching orders data...");
    
    try {
      if (!user) {
        console.log("No authenticated user found");
        setFetchError("Vui lòng đăng nhập để xem dữ liệu đơn hàng");
        setOrders([]);
        setFetchingData(false);
        return;
      }
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          customers!orders_customer_id_fkey (
            id,
            name,
            phone,
            address
          ),
          players (*),
          print_configs (*),
          product_lines (*),
          logos (*),
          delivery_information (*)
        `);
      
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

      console.log("Raw orders data:", ordersData);

      const transformedOrders: Order[] = ordersData.map(order => {
        return dbOrderToOrder(
          order,
          order.customers,
          order.players,
          order.product_lines,
          order.print_configs,
          order.logos,
          order.delivery_information[0] // Pass first delivery information if exists
        );
      });
      
      console.log("Transformed orders:", transformedOrders);
      setOrders(transformedOrders);
    } catch (e) {
      console.error("Exception in fetchOrders:", e);
      setFetchError(`Có lỗi xảy ra khi tải dữ liệu: ${e instanceof Error ? e.message : 'Unknown error'}`);
      setOrders([]);
    } finally {
      setFetchingData(false);
    }
  };

  // Automatically fetch orders when user or filters change
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, statusFilter, customerFilter, dateRange.from, dateRange.to]);

  return {
    orders,
    fetchError,
    fetchingData,
    fetchOrders
  };
};
