
import { Badge } from "@/components/ui/badge";
import { Check, Clock, ArrowRight, Plus, Package, X } from "lucide-react";

type OrderStatusProps = {
  status: string;
};

export const OrderStatus = ({ status }: OrderStatusProps) => {
  switch (status) {
    case 'new':
      return <Badge className="bg-blue-500 flex items-center gap-1"><Plus className="w-3 h-3" /> Mới</Badge>;
    case 'processing':
      return <Badge className="bg-yellow-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Đang xử lý</Badge>;
    case 'completed':
      return <Badge className="bg-green-500 flex items-center gap-1"><Check className="w-3 h-3" /> Đã hoàn thành</Badge>;
    case 'delivered':
      return <Badge className="bg-purple-500 flex items-center gap-1"><Package className="w-3 h-3" /> Đã giao hàng</Badge>;
    default:
      return <Badge><X className="w-3 h-3" /> Unknown</Badge>;
  }
};
