
import { Customer } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CustomerFormFieldsProps {
  customerInfo: Customer;
  handleInputChange: (field: keyof Customer, value: string) => void;
  showOptionalFields?: boolean;
}

export function CustomerFormFields({ 
  customerInfo, 
  handleInputChange, 
  showOptionalFields = false 
}: CustomerFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="name">Họ tên</Label>
          <Badge variant="outline" className="text-xs">Tài khoản</Badge>
        </div>
        <Input
          id="name"
          placeholder="Nhập họ tên"
          value={customerInfo.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="phone">Số điện thoại</Label>
          <Badge variant="outline" className="text-xs">Tài khoản</Badge>
        </div>
        <Input
          id="phone"
          placeholder="Nhập số điện thoại"
          value={customerInfo.phone || ''}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          required
          type="tel"
        />
      </div>

      {showOptionalFields && (
        <>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="Nhập email (không bắt buộc)"
              value={customerInfo.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              type="email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              placeholder="Nhập địa chỉ (không bắt buộc)"
              value={customerInfo.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
}
