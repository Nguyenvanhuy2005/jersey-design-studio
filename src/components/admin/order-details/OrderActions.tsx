
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { OrderStatus } from "../order-list/OrderStatus";

interface OrderActionsProps {
  orderId: string | undefined;
  teamName: string;
  status: "new" | "processing" | "completed" | "delivered" | "cancelled";
  onStatusChange: (orderId: string, newStatus: 'new' | 'processing' | 'completed' | 'delivered' | 'cancelled') => void;
  onDeleteOrder: (orderId: string) => void;
}

export const OrderActions = ({
  orderId,
  teamName,
  status,
  onStatusChange,
  onDeleteOrder
}: OrderActionsProps) => {
  const [branch, setBranch] = useState<string>("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleConfirmSale = () => {
    if (orderId) {
      onStatusChange(orderId, 'completed');
      toast.success(`Đơn hàng ${teamName} đã được xác nhận bán`);
    }
  };
  
  const handleConfirmPrint = () => {
    toast.success(`Đã xác nhận in tất cả các sản phẩm cho đơn hàng: ${teamName}`);
  };
  
  const handleExportCSV = () => {
    toast.success(`Đã xuất file danh sách cầu thủ cho đơn hàng: ${teamName}`);
  };

  const handleStatusChange = (value: string) => {
    if (orderId && value !== status) {
      onStatusChange(orderId, value as 'new' | 'processing' | 'completed' | 'delivered' | 'cancelled');
      toast.success(`Đơn hàng ${teamName} đã chuyển sang "${
        value === 'new' ? 'Mới' :
        value === 'processing' ? 'Đang xử lý' :
        value === 'completed' ? 'Đã hoàn thành' :
        value === 'delivered' ? 'Đã giao hàng' : 'Đã hủy'
      }"`);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Button size="sm" variant="secondary" onClick={handleConfirmPrint}>
        Xác nhận in tất cả
      </Button>
      
      <Select value={status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue>
            <OrderStatus status={status} />
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

      <Select value={branch} onValueChange={setBranch}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Chọn nhánh" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="print">CÓ IN</SelectItem>
          <SelectItem value="noprint">KHÔNG IN</SelectItem>
        </SelectContent>
      </Select>
      
      <Button size="sm" variant="default" onClick={handleConfirmSale} disabled={!branch}>
        Xác nhận bán
      </Button>
      
      {/* Nút xóa */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive">Xóa đơn hàng</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa đơn hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đơn hàng <b>{teamName}</b>? Hành động này không thể hoàn tác!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if(orderId) onDeleteOrder(orderId); setOpenDeleteDialog(false); }}
            >
              Xóa đơn hàng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
