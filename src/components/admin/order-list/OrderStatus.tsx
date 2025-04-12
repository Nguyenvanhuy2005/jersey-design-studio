
import { Badge } from "@/components/ui/badge";

type OrderStatusProps = {
  status: string;
};

export const OrderStatus = ({ status }: OrderStatusProps) => {
  switch (status) {
    case 'new':
      return <Badge className="bg-blue-500">Mới</Badge>;
    case 'processing':
      return <Badge className="bg-yellow-500">Đang xử lý</Badge>;
    case 'completed':
      return <Badge className="bg-green-500">Đã hoàn thành</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
};
