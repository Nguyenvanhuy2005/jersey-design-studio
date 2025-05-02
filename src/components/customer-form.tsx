
import { useEffect } from "react";
import { Customer } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerFormLoading } from "./customer/loading-state";
import { CustomerFormUnauthenticated } from "./customer/unauthenticated-state";
import { CustomerFormFields } from "./customer/customer-form-fields";
import { useCustomerForm } from "@/hooks/useCustomerForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface CustomerFormProps {
  onCustomerInfoChange: (customerInfo: Customer) => void;
  initialCustomer?: Customer;
}

export function CustomerForm({ onCustomerInfoChange, initialCustomer }: CustomerFormProps) {
  const { user } = useAuth();
  const { 
    loading, 
    customerInfo, 
    handleInputChange,
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
        
        {!isFormComplete() && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Vui lòng điền đầy đủ thông tin</AlertTitle>
            <AlertDescription>
              Họ tên và số điện thoại là bắt buộc để xác nhận thông tin khách hàng.
            </AlertDescription>
          </Alert>
        )}
        
        <p className="text-sm text-muted-foreground">
          Thông tin này được lưu theo tài khoản của bạn và sẽ được tự động cập nhật.
        </p>
      </CardContent>
    </Card>
  );
}
