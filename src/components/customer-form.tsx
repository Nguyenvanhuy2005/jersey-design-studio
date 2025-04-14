import { useEffect } from "react";
import { Customer } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { LoaderCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomerFormLoading } from "./customer/loading-state";
import { CustomerFormUnauthenticated } from "./customer/unauthenticated-state";
import { CustomerFormFields } from "./customer/customer-form-fields";
import { useCustomerForm } from "@/hooks/useCustomerForm";

interface CustomerFormProps {
  onCustomerInfoChange: (customerInfo: Customer) => void;
  initialCustomer?: Customer;
}

export function CustomerForm({ onCustomerInfoChange, initialCustomer }: CustomerFormProps) {
  const { user } = useAuth();
  const { 
    loading, 
    saving, 
    customerInfo, 
    handleInputChange, 
    saveCustomerInfo, 
    isFormComplete 
  } = useCustomerForm(initialCustomer);

  useEffect(() => {
    onCustomerInfoChange(customerInfo);
  }, [customerInfo, onCustomerInfoChange]);

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
