
import { Player, Customer } from "@/types";
import { toast } from "sonner";

interface OrderFormValidationProps {
  players: Player[];
  customerInfo: Customer;
}

export const validateOrderForm = ({ players, customerInfo }: OrderFormValidationProps): boolean => {
  if (players.length === 0) {
    toast.error("Vui lòng thêm ít nhất một cầu thủ vào danh sách");
    return false;
  }
  
  if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
    toast.error("Vui lòng nhập đầy đủ thông tin khách hàng");
    return false;
  }
  
  return true;
};
