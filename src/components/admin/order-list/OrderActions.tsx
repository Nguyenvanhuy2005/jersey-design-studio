
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Mail, Eye, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Order } from "@/types";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderStatus } from "./OrderStatus";

type OrderActionsProps = {
  order: Order;
  onViewDetails: (order: Order) => void;
  onStatusChange: (orderId: string, newStatus: 'new' | 'processing' | 'completed' | 'delivered' | 'cancelled') => void;
  onDeleteOrder: (orderId: string) => void;
};

export const OrderActions = ({
  order,
  onViewDetails,
  onStatusChange,
  onDeleteOrder
}: OrderActionsProps) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleSendEmail = (order: Order) => {
    toast.success(`Email đã được gửi đến khách hàng về đơn hàng: ${order.teamName || 'Không có tên'}`);
  };

  const handleStatusChange = (value: string) => {
    if (order.id && value !== order.status) {
      onStatusChange(order.id, value as 'new' | 'processing' | 'completed' | 'delivered' | 'cancelled');
    }
  };

  return (
    <div className="flex justify-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onViewDetails(order)}
      >
        <Eye className="h-4 w-4 mr-1" /> Chi tiết
      </Button>
      
      <Select value={order.status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue>
            <OrderStatus status={order.status} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">Mới</SelectItem>
          <SelectItem value="processing">Đang xử lý</SelectItem>
          <SelectItem value="completed">Đã hoàn thành</SelectItem>
          <SelectItem value="delivered">Đã giao hàng</SelectItem>
          <SelectItem value="cancelled">Đã hủy</SelectItem>
        </SelectContent>
      </Select>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleSendEmail(order)}>
            <Mail className="h-4 w-4 mr-2" /> Gửi email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDeleteDialog(true)} className="text-red-600 focus:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2" /> Xóa đơn hàng
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Dialog xác nhận xóa */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa đơn hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa đơn hàng <b>{order.teamName}</b>? Hành động sẽ không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if(order.id) onDeleteOrder(order.id); setOpenDeleteDialog(false); }}>Xóa đơn hàng</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
