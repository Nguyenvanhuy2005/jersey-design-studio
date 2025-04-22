

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Mail, Eye, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Order } from "@/types";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useState } from "react";

type OrderActionsProps = {
  order: Order;
  onViewDetails: (order: Order) => void;
  onStatusChange: (orderId: string, newStatus: 'new' | 'processing' | 'completed' | 'delivered') => void;
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

  // Thêm nút chuyển trạng thái delivered
  const handleStatusForward = () => {
    if (!order.id) return;
    let nextStatus: 'processing' | 'completed' | 'delivered' | null = null;
    if (order.status === 'new') nextStatus = 'processing';
    else if (order.status === 'processing') nextStatus = 'completed';
    else if (order.status === 'completed') nextStatus = 'delivered';
    if (nextStatus)
      onStatusChange(order.id, nextStatus);
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
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {order.status === 'new' && (
            <DropdownMenuItem onClick={() => order.id && onStatusChange(order.id, 'processing')}>
              Chuyển sang "Đang xử lý"
            </DropdownMenuItem>
          )}
          {order.status === 'processing' && (
            <DropdownMenuItem onClick={() => order.id && onStatusChange(order.id, 'completed')}>
              Chuyển sang "Đã hoàn thành"
            </DropdownMenuItem>
          )}
          {order.status === 'completed' && (
            <DropdownMenuItem onClick={() => order.id && onStatusChange(order.id, 'delivered')}>
              Chuyển sang "Đã giao hàng"
            </DropdownMenuItem>
          )}
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
