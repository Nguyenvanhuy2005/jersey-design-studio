
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Customer } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export function useCustomers() {
  const { user, isAdmin } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching customers with auth state:", { user, isAdmin });

      if (!user) {
        setError("Vui lòng đăng nhập để xem danh sách khách hàng");
        setCustomers([]);
        setLoading(false);
        return;
      }

      if (!isAdmin) {
        setError("Bạn không có quyền xem danh sách khách hàng");
        setCustomers([]);
        setLoading(false);
        return;
      }

      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      console.log("Customers query result:", { customersData, customersError });

      if (customersError) {
        console.error("Error fetching customers:", customersError);
        throw customersError;
      }

      setCustomers(customersData as Customer[] || []);
    } catch (err: any) {
      console.error("Error fetching customers:", err);
      setError(`Không thể tải dữ liệu khách hàng: ${err.message}`);
      toast.error("Có lỗi khi tải dữ liệu khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log("User auth state changed, fetching customers...", { user, isAdmin });
      fetchCustomers();
    } else {
      setCustomers([]);
      setLoading(false);
    }
  }, [user, isAdmin]);

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .insert([customerData])
        .select()
        .single();

      if (error) throw error;

      toast.success("Đã thêm khách hàng mới");
      await fetchCustomers();
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
      await fetchCustomers();
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

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    resetPassword
  };
}

