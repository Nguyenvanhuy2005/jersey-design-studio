
import { useState, useEffect } from "react";
import { Customer } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useCustomerForm(initialCustomer?: Customer) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [customerInfo, setCustomerInfo] = useState<Customer>({
    id: initialCustomer?.id || '',
    name: initialCustomer?.name || "",
    address: initialCustomer?.address || "",
    phone: initialCustomer?.phone || "",
    delivery_note: initialCustomer?.delivery_note || "",
    email: initialCustomer?.email || ""
  });

  useEffect(() => {
    if (user) {
      fetchCustomerInfo();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCustomerInfo = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (error) {
        if (error.code !== 'PGRST116') {
          console.error("Error fetching customer info:", error);
          toast.error("Không thể tải thông tin khách hàng");
        }
        setLoading(false);
        return;
      }
      
      if (data) {
        const customerData: Customer = {
          id: data.id,
          name: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          delivery_note: data.delivery_note || "",
          email: data.email || "",
          created_at: data.created_at
        };
        
        setCustomerInfo(customerData);
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
      toast.error("Có lỗi khi tải thông tin khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Customer, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const saveCustomerInfo = async () => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để lưu thông tin khách hàng");
      return;
    }
    
    setSaving(true);
    try {
      // Kiểm tra xem khách hàng có tồn tại không
      const { data: existingCustomer, error: checkError } = await supabase
        .from("customers")
        .select("id")
        .eq("id", user.id)
        .single();
        
      console.log("Checking existing customer:", existingCustomer, checkError);
      
      let error;
      
      // Nếu khách hàng không tồn tại, thực hiện insert
      if (checkError && checkError.code === 'PGRST116') {
        console.log("Customer doesn't exist, inserting new record");
        const { error: insertError } = await supabase
          .from("customers")
          .insert({
            id: user.id,
            name: customerInfo.name,
            address: customerInfo.address,
            phone: customerInfo.phone,
            delivery_note: customerInfo.delivery_note,
            email: customerInfo.email || null
          });
        error = insertError;
      } 
      // Nếu khách hàng đã tồn tại, thực hiện update
      else {
        console.log("Customer exists, updating record");
        const { error: updateError } = await supabase
          .from("customers")
          .update({
            name: customerInfo.name,
            address: customerInfo.address,
            phone: customerInfo.phone,
            delivery_note: customerInfo.delivery_note,
            email: customerInfo.email || null
          })
          .eq("id", user.id);
        error = updateError;
      }
        
      if (error) {
        console.error("Error saving customer info:", error);
        toast.error("Không thể lưu thông tin khách hàng");
        return;
      }
      
      toast.success("Đã lưu thông tin khách hàng thành công");
    } catch (error) {
      console.error("Error in saveCustomerInfo:", error);
      toast.error("Không thể lưu thông tin khách hàng");
    } finally {
      setSaving(false);
    }
  };
  
  const isFormComplete = () => {
    return customerInfo.name.trim() !== "" && 
           customerInfo.address.trim() !== "" && 
           customerInfo.phone.trim() !== "";
  };

  return {
    loading,
    saving,
    customerInfo,
    handleInputChange,
    saveCustomerInfo,
    isFormComplete
  };
}
