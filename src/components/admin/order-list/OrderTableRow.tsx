
import { Order } from "@/types";
import { OrderStatus } from "./OrderStatus";
import { OrderImageButtons } from "./OrderImageButtons";
import { OrderActions } from "./OrderActions";

type OrderTableRowProps = {
  order: Order;
  imageAvailability: Record<string, {front: boolean, back: boolean}>;
  isCheckingImages?: boolean;
  onViewDetails: (order: Order) => void;
  onViewImage: (imageUrl: string | null) => void;
  onStatusChange: (orderId: string, newStatus: 'new' | 'processing' | 'completed') => void;
};

export const OrderTableRow = ({
  order,
  imageAvailability,
  isCheckingImages = false,
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
    <tr key={order.id} className="border-t border-muted">
      <td className="p-3">{order.id}</td>
      <td className="p-3 font-medium">{order.customerInfo?.name || "—"}</td>
      <td className="p-3">{totalCount} bộ (Cầu thủ: {playerCount}, Thủ môn: {goalkeeperCount})</td>
      <td className="p-3">
        <OrderStatus status={order.status} />
      </td>
      <td className="p-3">{formatDate(order.createdAt)}</td>
      <td className="p-3">
        {(order.designImageFront || order.designImage || order.designImageBack) ? (
          <OrderImageButtons 
            orderId={order.id}
            frontDesignImage={order.designImageFront || order.designImage}
            backDesignImage={order.designImageBack}
            imageAvailability={orderAvailability}
            isCheckingImages={isCheckingImages}
            onViewImage={onViewImage}
          />
        ) : (
          <span className="text-muted-foreground text-sm">Không có</span>
        )}
      </td>
      <td className="p-3">
        <OrderActions 
          order={order}
          onViewDetails={onViewDetails}
          onStatusChange={onStatusChange}
        />
      </td>
    </tr>
  );
};
