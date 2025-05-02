
import { useState, useEffect } from "react";
import { Customer } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { debounce } from "lodash";

export function useCustomerForm(initialCustomer?: Customer) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [customerInfo, setCustomerInfo] = useState<Customer>({
    id: initialCustomer?.id || '',
    name: initialCustomer?.name || "",
    address: initialCustomer?.address || "",
    phone: initialCustomer?.phone || "",
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
    const updatedInfo = { ...customerInfo, [field]: value };
    setCustomerInfo(updatedInfo);
    debouncedSaveCustomerInfo(updatedInfo);
  };

  const saveCustomerInfo = async (info: Customer) => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Kiểm tra xem khách hàng có tồn tại không
      const { data: existingCustomer, error: checkError } = await supabase
        .from("customers")
        .select("id")
        .eq("id", user.id)
        .single();
      
      let error;
      
      // Nếu khách hàng không tồn tại, thực hiện insert
      if (checkError && checkError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from("customers")
          .insert({
            id: user.id,
            name: info.name,
            address: info.address,
            phone: info.phone,
            email: info.email || null
          });
        error = insertError;
      } 
      // Nếu khách hàng đã tồn tại, thực hiện update
      else {
        const { error: updateError } = await supabase
          .from("customers")
          .update({
            name: info.name,
            address: info.address,
            phone: info.phone,
            email: info.email || null
          })
          .eq("id", user.id);
        error = updateError;
      }
        
      if (error) {
        console.error("Error saving customer info:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in saveCustomerInfo:", error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Debounce the save function to avoid too many API calls
  const debouncedSaveCustomerInfo = debounce(saveCustomerInfo, 1000);
  
  const isFormComplete = () => {
    return customerInfo.name.trim() !== "" && 
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
