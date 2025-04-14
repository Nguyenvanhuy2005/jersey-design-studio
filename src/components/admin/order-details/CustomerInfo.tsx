
import { Card } from "@/components/ui/card";
import { Customer } from "@/types";

interface CustomerInfoProps {
  customer?: Customer;
}

export const CustomerInfo = ({ customer }: CustomerInfoProps) => {
  if (!customer) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold">Thông tin khách hàng</h3>
        <p className="text-muted-foreground italic">Không có thông tin khách hàng</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold">Thông tin khách hàng</h3>
      <div className="mt-2 space-y-1">
        <p><span className="text-muted-foreground">Họ tên:</span> {customer.name}</p>
        <p><span className="text-muted-foreground">Địa chỉ:</span> {customer.address}</p>
        <p><span className="text-muted-foreground">Số điện thoại:</span> {customer.phone}</p>
        {customer.delivery_note && (
          <p><span className="text-muted-foreground">Ghi chú giao hàng:</span> {customer.delivery_note}</p>
        )}
      </div>
    </Card>
  );
};
