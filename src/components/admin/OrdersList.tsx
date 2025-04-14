
import { useState, useEffect } from "react";
import { Order } from "@/types";
import { Loader2 } from "lucide-react";
import { OrderTableRow } from "./order-list/OrderTableRow";
import { NoOrders } from "./order-list/NoOrders";
import { checkFileExistsInStorage } from "@/utils/storage/file-utils";

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
  const [isCheckingImages, setIsCheckingImages] = useState<boolean>(false);
  
  // Filter orders based on statusFilter
  const filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  // Check image availability when orders change
  useEffect(() => {
    const checkImages = async () => {
      if (orders.length === 0) return;
      
      setIsCheckingImages(true);
      const availability: Record<string, {front: boolean, back: boolean}> = {};
      
      try {
        for (const order of orders) {
          if (order.id) {
            const frontImagePath = order.designImageFront || order.designImage || '';
            const backImagePath = order.designImageBack || '';
            
            // Only check if paths exist
            const frontExists = frontImagePath 
              ? await checkFileExistsInStorage('design_images', frontImagePath)
              : false;
              
            const backExists = backImagePath
              ? await checkFileExistsInStorage('design_images', backImagePath) 
              : false;
              
            availability[order.id] = { front: frontExists, back: backExists };
            console.log(`Checked images for order ${order.id}:`, { frontExists, backExists });
          }
        }
        
        setImageAvailability(availability);
      } catch (error) {
        console.error("Error checking image availability:", error);
        // In case of error, assume images don't exist
      } finally {
        setIsCheckingImages(false);
      }
    };
    
    if (orders.length > 0) {
      checkImages();
    }
  }, [orders]);

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
          isCheckingImages={isCheckingImages}
          onViewDetails={onViewDetails}
          onViewImage={onViewImage}
          onStatusChange={onStatusChange}
        />
      ))}
    </>
  );
};
