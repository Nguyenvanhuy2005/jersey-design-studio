
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Customer } from "@/types";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: customersData, error: customersError } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (customersError) {
        throw customersError;
      }

      if (!customersData) {
        setCustomers([]);
        return;
      }

      // Get orders count for each customer
      const customersWithOrderCounts = await Promise.all(
        customersData.map(async (customer) => {
          const { count } = await supabase
            .from("orders")
            .select("id", { count: 'exact', head: true })
            .eq("customer_id", customer.id);
          
          return {
            ...customer,
            order_count: count || 0
          } as Customer & { order_count: number };
        })
      );

      setCustomers(customersWithOrderCounts);
    } catch (err: any) {
      console.error("Error fetching customers:", err);
      setError(`Không thể tải dữ liệu khách hàng: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'created_at'>) => {
    try {
      console.log("Creating customer with data:", customerData);
      
      const { data, error } = await supabase.functions.invoke('create-customer', {
        body: { customerData }
      });

      console.log("Edge function response:", data, error);

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(`Không thể tạo khách hàng: ${error.message}`);
      }

      if (!data?.customer) {
        const errorMsg = data?.error || "Không nhận được dữ liệu khách hàng";
        console.error("Invalid response from edge function:", data);
        throw new Error(`Lỗi máy chủ: ${errorMsg}`);
      }

      toast.success("Đã tạo khách hàng thành công");
      await fetchCustomers(); // Refresh the customers list
      return data.customer;
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

      if (error) {
        throw error;
      }

      toast.success("Đã cập nhật thông tin khách hàng");
      await fetchCustomers(); // Refresh the customers list
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

      if (error) {
        throw error;
      }

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
