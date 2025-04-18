
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Customer } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export function useCustomers() {
  const { user, isAdmin } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [hasMore, setHasMore] = useState<boolean>(true);

  // This is needed to avoid refetching when component remounts but data hasn't changed
  const [initialFetchDone, setInitialFetchDone] = useState<boolean>(false);

  const fetchCustomers = useCallback(async ({
    page = 1,
    pageSize = 10,
    search = "",
    forceRefresh = false
  } = {}) => {
    if (!user || !isAdmin) {
      if (!user) {
        setError("Vui lòng đăng nhập để xem danh sách khách hàng");
      } else if (!isAdmin) {
        setError("Bạn không có quyền xem danh sách khách hàng");
      }
      setCustomers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching customers with params:", { page, pageSize, search });
      
      // Calculate range for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Build the query
      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' });
      
      // Add search filter if provided
      if (search && search.trim()) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,address.ilike.%${search}%`);
      }
      
      // Execute the query with range
      const { data: customersData, error: customersError, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      console.log("Customers query result:", { customersData, customersError, count });

      if (customersError) {
        console.error("Error fetching customers:", customersError);
        throw customersError;
      }

      setCustomers(customersData as Customer[] || []);
      
      // Update total count and has more
      if (count !== null) {
        setTotalCount(count);
        setHasMore(from + customersData.length < count);
      }
      
      setInitialFetchDone(true);
    } catch (err: any) {
      console.error("Error fetching customers:", err);
      setError(`Không thể tải dữ liệu khách hàng: ${err.message}`);
      toast.error("Có lỗi khi tải dữ liệu khách hàng");
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    // Only fetch on initial mount or when auth state changes
    if (user && !initialFetchDone) {
      console.log("Initial fetch or auth state changed, fetching customers...");
      fetchCustomers({ page, pageSize, search: searchTerm });
    } else if (!user) {
      setCustomers([]);
      setLoading(false);
    }
  }, [user, isAdmin, fetchCustomers, initialFetchDone, page, pageSize, searchTerm]);

  // Debounced search function
  const handleSearch = useCallback((search: string) => {
    setSearchTerm(search);
    setPage(1); // Reset to first page when searching
    fetchCustomers({ page: 1, pageSize, search });
  }, [fetchCustomers, pageSize]);

  // Page change handler
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    fetchCustomers({ page: newPage, pageSize, search: searchTerm });
  }, [fetchCustomers, pageSize, searchTerm]);

  // Page size change handler
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
    fetchCustomers({ page: 1, pageSize: newPageSize, search: searchTerm });
  }, [fetchCustomers, searchTerm]);

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'created_at'>) => {
    try {
      // Generate UUID for new customer
      const customerUuid = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from("customers")
        .insert({
          id: customerUuid,
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          delivery_note: customerData.delivery_note
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Đã thêm khách hàng mới");
      await fetchCustomers({ page, pageSize, search: searchTerm, forceRefresh: true });
      return data;
    } catch (err: any) {
      console.error("Error creating customer:", err);
      toast.error(`Không thể tạo khách hàng: ${err.message}`);
      throw err;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .update({
          name: customerData.name,
          phone: customerData.phone,
          address: customerData.address,
          delivery_note: customerData.delivery_note
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      toast.success("Đã cập nhật thông tin khách hàng");
      await fetchCustomers({ page, pageSize, search: searchTerm, forceRefresh: true });
      return data;
    } catch (err: any) {
      console.error("Error updating customer:", err);
      toast.error(`Không thể cập nhật khách hàng: ${err.message}`);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/customer/reset-password`,
      });

      if (error) throw error;

      toast.success("Email đặt lại mật khẩu đã được gửi");
    } catch (err: any) {
      console.error("Error resetting password:", err);
      toast.error(`Không thể gửi email đặt lại mật khẩu: ${err.message}`);
      throw err;
    }
  };

  // Get customer by ID with orders count
  const getCustomerWithOrdersCount = async (id: string): Promise<Customer & { order_count: number }> => {
    try {
      // Get customer details
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single();
        
      if (customerError) throw customerError;
      
      // Get order count for this customer
      const { count, error: countError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("customer_id", id);
        
      if (countError) throw countError;
      
      return { 
        ...customer, 
        order_count: count || 0 
      } as Customer & { order_count: number };
    } catch (err: any) {
      console.error("Error fetching customer with order count:", err);
      toast.error(`Không thể tải thông tin khách hàng: ${err.message}`);
      throw err;
    }
  };

  return {
    customers,
    loading,
    error,
    totalCount,
    page,
    pageSize,
    hasMore,
    searchTerm,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    resetPassword,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    getCustomerWithOrdersCount
  };
}
