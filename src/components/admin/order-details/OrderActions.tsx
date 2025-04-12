
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface OrderActionsProps {
  orderId: string | undefined;
  teamName: string;
  onStatusChange: (orderId: string, newStatus: 'new' | 'processing' | 'completed') => void;
}

export const OrderActions = ({ orderId, teamName, onStatusChange }: OrderActionsProps) => {
  const [branch, setBranch] = useState<string>("");
  
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

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" onClick={handleExportCSV}>
        Tải danh sách cầu thủ
      </Button>
      
      <Button size="sm" variant="secondary" onClick={handleConfirmPrint}>
        Xác nhận in tất cả
      </Button>
      
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
    </div>
  );
};
