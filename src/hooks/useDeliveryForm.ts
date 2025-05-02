
import { useState, useEffect } from "react";
import { DeliveryInformation } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDeliveryForm(initialDelivery?: DeliveryInformation) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deliveryInfoList, setDeliveryInfoList] = useState<DeliveryInformation[]>([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInformation>({
    recipient_name: initialDelivery?.recipient_name || "",
    address: initialDelivery?.address || "",
    phone: initialDelivery?.phone || "",
    delivery_note: initialDelivery?.delivery_note || "",
  });
  
  // Fetch saved delivery information for this customer
  useEffect(() => {
    if (user) {
      fetchDeliveryInformation();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDeliveryInformation = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("delivery_information")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Error fetching delivery information:", error);
        toast.error("Không thể tải thông tin giao hàng");
        return;
      }
      
      if (data && data.length > 0) {
        setDeliveryInfoList(data);
        // Pre-select the most recently used delivery info
        setSelectedDeliveryId(data[0].id);
        setDeliveryInfo({
          recipient_name: data[0].recipient_name,
          address: data[0].address,
          phone: data[0].phone,
          delivery_note: data[0].delivery_note || "",
        });
      }
    } catch (error) {
      console.error("Error in fetchDeliveryInformation:", error);
      toast.error("Có lỗi khi tải thông tin giao hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof DeliveryInformation, value: string) => {
    setDeliveryInfo(prev => ({ ...prev, [field]: value }));
    // When user starts editing, clear the selected delivery ID
    if (selectedDeliveryId) {
      setSelectedDeliveryId(null);
    }
  };

  const selectSavedDelivery = (id: string) => {
    const selected = deliveryInfoList.find(item => item.id === id);
    if (selected) {
      setDeliveryInfo({
        recipient_name: selected.recipient_name,
        address: selected.address,
        phone: selected.phone,
        delivery_note: selected.delivery_note || "",
      });
      setSelectedDeliveryId(id);
    }
  };

  const saveDeliveryInfo = async () => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để lưu thông tin giao hàng");
      return;
    }
    
    if (!deliveryInfo.recipient_name || !deliveryInfo.address || !deliveryInfo.phone) {
      toast.error("Vui lòng điền đầy đủ tên, địa chỉ và số điện thoại người nhận");
      return false;
    }
    
    setSaving(true);
    try {
      const newDeliveryInfo = {
        ...deliveryInfo,
        customer_id: user.id
      };
      
      const { data, error } = await supabase
        .from("delivery_information")
        .insert(newDeliveryInfo)
        .select("*")
        .single();
        
      if (error) {
        console.error("Error saving delivery info:", error);
        toast.error("Không thể lưu thông tin giao hàng");
        return false;
      }
      
      toast.success("Đã lưu thông tin giao hàng thành công");
      
      // Update the list and select the new delivery info
      setDeliveryInfoList([data, ...deliveryInfoList]);
      setSelectedDeliveryId(data.id);
      
      return data;
    } catch (error) {
      console.error("Error in saveDeliveryInfo:", error);
      toast.error("Không thể lưu thông tin giao hàng");
      return false;
    } finally {
      setSaving(false);
    }
  };
  
  const isFormComplete = () => {
    return deliveryInfo.recipient_name.trim() !== "" && 
           deliveryInfo.address.trim() !== "" && 
           deliveryInfo.phone.trim() !== "";
  };

  return {
    loading,
    saving,
    deliveryInfo,
    deliveryInfoList,
    selectedDeliveryId,
    handleInputChange,
    selectSavedDelivery,
    saveDeliveryInfo,
    isFormComplete
  };
}
