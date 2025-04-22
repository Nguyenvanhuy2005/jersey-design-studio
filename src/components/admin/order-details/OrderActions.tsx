
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

interface OrderActionsProps {
  orderId: string | undefined;
  teamName: string;
  status: "new" | "processing" | "completed" | "delivered";
  onStatusChange: (orderId: string, newStatus: 'new' | 'processing' | 'completed' | 'delivered') => void;
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
  const handleStatusToProcessing = () => {
    if (orderId) {
      onStatusChange(orderId, 'processing');
      toast.success(`Đơn hàng ${teamName} đã chuyển sang "Đang xử lý"`);
    }
  };
  const handleStatusToDelivered = () => {
    if (orderId) {
      onStatusChange(orderId, 'delivered');
      toast.success(`Đơn hàng ${teamName} đã chuyển sang "Đã giao hàng"`);
    }
  };

  return <div className="flex flex-wrap gap-2 items-center">
      <Button size="sm" variant="secondary" onClick={handleConfirmPrint}>
        Xác nhận in tất cả
      </Button>
      {(status === "new" || status === "completed") && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleStatusToProcessing}
          disabled={status === "processing"}
        >
          Chuyển sang "Đang xử lý"
        </Button>
      )}
      {(status === "processing" || status === "completed") && (
        <Button
          size="sm"
          variant="default"
          onClick={handleStatusToDelivered}
          disabled={status === "delivered"}
        >
          Chuyển sang "Đã giao hàng"
        </Button>
      )}

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
    </div>;
