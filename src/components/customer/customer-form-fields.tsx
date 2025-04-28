
import { Customer } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CustomerFormFieldsProps {
  customerInfo: Customer;
  handleInputChange: (field: keyof Customer, value: string) => void;
}

export function CustomerFormFields({ customerInfo, handleInputChange }: CustomerFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Họ tên</Label>
        <Input 
          id="name"
          value={customerInfo.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Nhập họ tên khách hàng"
        />
      </div>
      
      <div>
        <Label htmlFor="address">Địa chỉ</Label>
        <Input 
          id="address"
          value={customerInfo.address || ''}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Nhập địa chỉ giao hàng"
        />
      </div>
      
      <div>
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input 
          id="phone"
          value={customerInfo.phone || ''}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="Nhập số điện thoại liên hệ"
        />
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email"
          value={customerInfo.email || ''}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="Nhập địa chỉ email (không bắt buộc)"
          type="email"
        />
      </div>
      
      <div>
        <Label htmlFor="delivery_note">Ghi chú giao hàng</Label>
        <Textarea 
          id="delivery_note"
          value={customerInfo.delivery_note || ''}
          onChange={(e) => handleInputChange('delivery_note', e.target.value)}
          placeholder="Nhập ghi chú về việc giao hàng (không bắt buộc)"
          rows={3}
        />
      </div>
    </div>
  );
}
