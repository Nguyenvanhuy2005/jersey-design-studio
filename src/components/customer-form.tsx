
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Customer } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

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

  // Fetch customer info when component mounts
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
        console.error("Error fetching customer info:", error);
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
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thông tin khách hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center bg-yellow-50 rounded-md">
            <p className="text-yellow-800">Bạn cần đăng nhập để tiếp tục đặt đơn hàng.</p>
            <Button variant="outline" className="mt-2" asChild>
              <a href="/login">Đăng nhập</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thông tin khách hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <LoaderCircle className="h-6 w-6 animate-spin" />
            <span className="ml-2">Đang tải thông tin...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin khách hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Họ tên</Label>
          <Input 
            id="name"
            value={customerInfo.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Nhập họ tên khách hàng"
          />
        </div>
        
        <div>
          <Label htmlFor="address">Địa chỉ</Label>
          <Input 
            id="address"
            value={customerInfo.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Nhập địa chỉ giao hàng"
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input 
            id="phone"
            value={customerInfo.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Nhập số điện thoại liên hệ"
          />
        </div>
        
        <div>
          <Label htmlFor="delivery_note">Ghi chú giao hàng</Label>
          <Textarea 
            id="delivery_note"
            value={customerInfo.delivery_note || ""}
            onChange={(e) => handleInputChange('delivery_note', e.target.value)}
            placeholder="Nhập ghi chú về việc giao hàng (không bắt buộc)"
            rows={3}
          />
        </div>
        
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
