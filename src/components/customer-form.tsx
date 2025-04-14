
import { useState, useEffect } from "react";
import { Customer } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomerFormLoading } from "./customer/loading-state";
import { CustomerFormUnauthenticated } from "./customer/unauthenticated-state";
import { CustomerFormFields } from "./customer/customer-form-fields";

interface CustomerFormProps {
  onCustomerInfoChange: (customerInfo: Customer) => void;
  initialCustomer?: Customer;
}

export function CustomerForm({ onCustomerInfoChange, initialCustomer }: CustomerFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [customerInfo, setCustomerInfo] = useState<Customer>({
    name: initialCustomer?.name || "",
    address: initialCustomer?.address || "",
    phone: initialCustomer?.phone || "",
    delivery_note: initialCustomer?.delivery_note || ""
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
        const customerData = {
          id: data.id,
          name: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          delivery_note: data.delivery_note || "",
          created_at: data.created_at ? new Date(data.created_at) : undefined
        };
        
        setCustomerInfo(customerData);
        onCustomerInfoChange(customerData);
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
    onCustomerInfoChange(updatedInfo);
  };

  const saveCustomerInfo = async () => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để lưu thông tin khách hàng");
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("customers")
        .upsert({
          id: user.id,
          name: customerInfo.name,
          address: customerInfo.address,
          phone: customerInfo.phone,
          delivery_note: customerInfo.delivery_note
        }, {
          onConflict: 'id'
        });
        
      if (error) {
        toast.error("Không thể lưu thông tin khách hàng");
        console.error("Error saving customer info:", error);
        return;
      }
      
      toast.success("Đã lưu thông tin khách hàng");
    } catch (error) {
      console.error("Error saving customer info:", error);
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

  if (!user) {
    return <CustomerFormUnauthenticated />;
  }

  if (loading) {
    return <CustomerFormLoading />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin khách hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CustomerFormFields 
          customerInfo={customerInfo}
          handleInputChange={handleInputChange}
        />
        
        <Button 
          type="button" 
          onClick={saveCustomerInfo} 
          disabled={saving || !isFormComplete()}
          className="w-full"
        >
          {saving ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : "Lưu thông tin khách hàng"}
        </Button>
      </CardContent>
    </Card>
  );
}
