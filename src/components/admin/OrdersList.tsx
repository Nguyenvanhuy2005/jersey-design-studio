
import { useState } from "react";
import { Order } from "@/types";
import { Loader2 } from "lucide-react";
import { OrderTableRow } from "./order-list/OrderTableRow";
import { NoOrders } from "./order-list/NoOrders";

interface OrdersListProps {
  orders: Order[];
  statusFilter: string;
  onViewDetails: (order: Order) => void;
  onViewImage: (imageUrl: string | null) => void;
  onStatusChange: (orderId: string, newStatus: 'new' | 'processing' | 'completed') => void;
}

export const OrdersList = ({
  orders,
  statusFilter,
  onViewDetails,
  onViewImage,
  onStatusChange
}: OrdersListProps) => {
  const [imageAvailability, setImageAvailability] = useState<Record<string, {front: boolean, back: boolean}>>({});
  
  // Filter orders based on statusFilter
  const filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  if (filteredOrders.length === 0) {
    return <NoOrders />;
  }

  return (
    <>
      {filteredOrders.map((order) => (
        <OrderTableRow
          key={order.id}
          order={order}
          imageAvailability={imageAvailability}
          onViewDetails={onViewDetails}
          onViewImage={onViewImage}
          onStatusChange={onStatusChange}
        />
      ))}
    </>
  );
};
