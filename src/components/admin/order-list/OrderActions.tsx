
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Mail, Eye } from "lucide-react";
import { toast } from "sonner";
import { Order } from "@/types";

type OrderActionsProps = {
  order: Order;
  onViewDetails: (order: Order) => void;
  onStatusChange: (orderId: string, newStatus: 'new' | 'processing' | 'completed') => void;
};

export const OrderActions = ({
  order,
  onViewDetails,
  onStatusChange
}: OrderActionsProps) => {
  const handleSendEmail = (order: Order) => {
    toast.success(`Email đã được gửi đến khách hàng về đơn hàng: ${order.teamName}`);
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
          <DropdownMenuItem onClick={() => handleSendEmail(order)}>
            <Mail className="h-4 w-4 mr-2" /> Gửi email
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
