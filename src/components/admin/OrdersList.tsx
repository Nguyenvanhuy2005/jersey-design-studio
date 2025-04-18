
import { Order } from "@/types";
import { OrderTableRow } from "./order-list/OrderTableRow";
import { NoOrders } from "./order-list/NoOrders";

interface OrdersListProps {
  orders: Order[];
  statusFilter: string;
  onViewDetails: (order: Order) => void;
  onStatusChange: (orderId: string, newStatus: 'new' | 'processing' | 'completed') => void;
}

export const OrdersList = ({
  orders,
  statusFilter,
  onViewDetails,
  onStatusChange
}: OrdersListProps) => {
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
          onViewDetails={onViewDetails}
          onStatusChange={onStatusChange}
        />
      ))}
    </>
  );
};
