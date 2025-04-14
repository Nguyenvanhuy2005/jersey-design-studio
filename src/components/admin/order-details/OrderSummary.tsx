
import { Card } from "@/components/ui/card";
import { Order, Player } from "@/types";

interface OrderSummaryProps {
  order: Order;
}

export const OrderSummary = ({ order }: OrderSummaryProps) => {
  // Calculate print counts
  const calculatePrintCounts = (players: Player[]) => {
    const counts = {
      line_1: 0,
      line_2: 0,
      line_3: 0,
      chest_text: 0,
      chest_number: 0,
      pants_number: 0,
      logo_chest_left: 0,
      logo_chest_right: 0,
      logo_chest_center: 0,
      logo_sleeve_left: 0,
      logo_sleeve_right: 0,
      logo_pants: 0,
      pet_chest: 0,
      player_count: 0,
      goalkeeper_count: 0,
    };
    
    players.forEach(player => {
      // Count uniform types
      if (!player.uniform_type || player.uniform_type === 'player') {
        counts.player_count++;
      } else if (player.uniform_type === 'goalkeeper') {
        counts.goalkeeper_count++;
      }
      
      // Count print positions
      if (player.line_1) counts.line_1++;
      if (player.number) counts.line_2++;
      if (player.line_3) counts.line_3++;
      if (player.chest_text) counts.chest_text++;
      if (player.chest_number) counts.chest_number++;
      if (player.pants_number) counts.pants_number++;
      if (player.logo_chest_left) counts.logo_chest_left++;
      if (player.logo_chest_right) counts.logo_chest_right++;
      if (player.logo_chest_center) counts.logo_chest_center++;
      if (player.logo_sleeve_left) counts.logo_sleeve_left++;
      if (player.logo_sleeve_right) counts.logo_sleeve_right++;
      if (player.logo_pants) counts.logo_pants++;
      if (player.pet_chest) counts.pet_chest++;
    });
    
    return counts;
  };

  const printCounts = calculatePrintCounts(order.players);
  const printStyle = order.designData?.print_style || 'In chuyển nhiệt';
  
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-2">Tóm tắt đơn hàng</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <h4 className="font-medium text-sm">Số lượng quần áo:</h4>
          <ul className="text-sm pl-5 list-disc">
            <li>Cầu thủ: {printCounts.player_count} bộ</li>
            <li>Thủ môn: {printCounts.goalkeeper_count} bộ</li>
            <li>Tổng: {order.players.length} bộ</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-sm">Font chữ và in ấn:</h4>
          <ul className="text-sm pl-5 list-disc">
            <li>Font chữ: {order.designData?.font_text?.font || 'Arial'}</li>
            <li>Font số: {order.designData?.font_number?.font || 'Arial'}</li>
            <li>Kiểu in: {printStyle}</li>
            <li>Màu sắc in: {order.designData?.print_color || 'Đen'}</li>
          </ul>
        </div>
        
        <div className="col-span-1 md:col-span-2 mt-2">
          <h4 className="font-medium text-sm">Số lượng in ấn theo vị trí:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 mt-1">
            <div>
              <ul className="text-sm pl-5 list-disc">
                <li>IN DÒNG 1 (trên số): {printCounts.line_1}</li>
                <li>IN DÒNG 2 (số lưng): {printCounts.line_2}</li>
                <li>IN DÒNG 3 (dưới số): {printCounts.line_3}</li>
                <li>IN CHỮ NGỰC: {printCounts.chest_text}</li>
                <li>IN SỐ NGỰC: {printCounts.chest_number}</li>
              </ul>
            </div>
            <div>
              <ul className="text-sm pl-5 list-disc">
                <li>IN SỐ QUẦN: {printCounts.pants_number}</li>
                <li>IN PET NGỰC: {printCounts.pet_chest}</li>
                <li>LOGO NGỰC TRÁI: {printCounts.logo_chest_left}</li>
                <li>LOGO NGỰC PHẢI: {printCounts.logo_chest_right}</li>
                <li>LOGO NGỰC GIỮA: {printCounts.logo_chest_center}</li>
              </ul>
            </div>
            <div>
              <ul className="text-sm pl-5 list-disc">
                <li>LOGO TAY TRÁI: {printCounts.logo_sleeve_left}</li>
                <li>LOGO TAY PHẢI: {printCounts.logo_sleeve_right}</li>
                <li>LOGO QUẦN: {printCounts.logo_pants}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
