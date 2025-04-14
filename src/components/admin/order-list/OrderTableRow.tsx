
import { Order } from "@/types";
import { OrderStatus } from "./OrderStatus";
import { OrderImageButtons } from "./OrderImageButtons";
import { OrderActions } from "./OrderActions";
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";

type OrderTableRowProps = {
  order: Order;
  imageAvailability: Record<string, {front: boolean, back: boolean}>;
  onViewDetails: (order: Order) => void;
  onViewImage: (imageUrl: string | null) => void;
  onStatusChange: (orderId: string, newStatus: 'new' | 'processing' | 'completed') => void;
};

export const OrderTableRow = ({
  order,
  imageAvailability,
  onViewDetails,
  onViewImage,
  onStatusChange
}: OrderTableRowProps) => {
  const formatDate = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const orderAvailability = order.id ? imageAvailability[order.id] : { front: false, back: false };
  
  // Calculate player and goalkeeper counts
  const playerCount = order.players.filter(p => !p.uniform_type || p.uniform_type === 'player').length;
  const goalkeeperCount = order.players.filter(p => p.uniform_type === 'goalkeeper').length;
  const totalCount = order.players.length;
  
  return (
    <TableRow key={order.id}>
      <TableCell>{order.id}</TableCell>
      <TableCell className="font-medium">{order.customerInfo?.name || "—"}</TableCell>
      <TableCell>{totalCount} bộ (Cầu thủ: {playerCount}, Thủ môn: {goalkeeperCount})</TableCell>
      <TableCell>
        <OrderStatus status={order.status} />
      </TableCell>
      <TableCell>{formatDate(order.createdAt)}</TableCell>
      <TableCell>
        {(order.designImageFront || order.designImage || order.designImageBack) ? (
          <OrderImageButtons 
            orderId={order.id}
            frontDesignImage={order.designImageFront || order.designImage}
            backDesignImage={order.designImageBack}
            imageAvailability={orderAvailability}
            onViewImage={onViewImage}
          />
        ) : (
          <span className="text-muted-foreground text-sm">Không có</span>
        )}
      </TableCell>
      <TableCell>
        <OrderActions 
          order={order}
          onViewDetails={onViewDetails}
          onStatusChange={onStatusChange}
        />
      </TableCell>
    </TableRow>
  );
};
