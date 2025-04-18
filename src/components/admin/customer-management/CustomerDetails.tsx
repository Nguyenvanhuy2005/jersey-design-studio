
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types";
import { CalendarIcon, PhoneIcon, MapPinIcon, FileTextIcon, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface CustomerDetailsProps {
  customer: Customer & { order_count?: number };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onResetPassword: () => void;
}

export function CustomerDetails({
  customer,
  open,
  onOpenChange,
  onEdit,
  onResetPassword
}: CustomerDetailsProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="min-w-[400px]">
        <SheetHeader>
          <SheetTitle>Chi tiết khách hàng</SheetTitle>
          <SheetDescription>
            Thông tin chi tiết về khách hàng và các đơn hàng liên quan.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium">{customer.name}</h3>
            
            {customer.email && (
              <div className="flex items-center mt-2 text-sm">
                <Mail className="mr-2 h-4 w-4 opacity-70" />
                <span>{customer.email}</span>
              </div>
            )}
            
            {customer.phone && (
              <div className="flex items-center mt-2 text-sm">
                <PhoneIcon className="mr-2 h-4 w-4 opacity-70" />
                <span>{customer.phone}</span>
              </div>
            )}

            {customer.address && (
              <div className="flex items-center mt-2 text-sm">
                <MapPinIcon className="mr-2 h-4 w-4 opacity-70" />
                <span>{customer.address}</span>
              </div>
            )}

            {customer.created_at && (
              <div className="flex items-center mt-2 text-sm">
                <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                <span>Tham gia: {format(new Date(customer.created_at), 'dd/MM/yyyy')}</span>
              </div>
            )}

            {customer.delivery_note && (
              <div className="mt-4">
                <p className="text-sm font-medium">Ghi chú giao hàng:</p>
                <p className="text-sm mt-1 bg-secondary/50 p-2 rounded">{customer.delivery_note}</p>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium">Số đơn hàng: <span className="font-bold">{customer.order_count || 0}</span></p>
          </div>

          <SheetFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={onEdit} className="w-full sm:w-auto">
              Chỉnh sửa thông tin
            </Button>
            {customer.email && (
              <Button onClick={onResetPassword} className="w-full sm:w-auto">
                Đặt lại mật khẩu
              </Button>
            )}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
