
import { useCallback, useMemo } from "react";
import { Logo, Player, ProductLine } from "@/types";

interface OrderSummaryProps {
  teamName: string;
  players: Player[];
  logos?: Logo[];
  productLines: ProductLine[];
}

export function OrderSummary({ teamName, players, logos = [], productLines }: OrderSummaryProps) {
  // Calculate costs based on position
  const calculateCost = useCallback((position: string): number => {
    if (position.includes("logo")) {
      return 20000; // 20,000 VND for logo positions
    } else {
      return 10000; // 10,000 VND for number/text positions
    }
  }, []);

  // Calculate product line costs
  const productLineCosts = useMemo(() => {
    return productLines.map(line => ({
      description: line.position,
      quantity: players.length,
      unitPrice: calculateCost(line.position),
      total: players.length * calculateCost(line.position)
    }));
  }, [players.length, productLines, calculateCost]);

  // Logo costs - now calculated based on number of logos
  const logosCost = useMemo(() => {
    return logos.length * 20000; // 20,000 VND per logo
  }, [logos.length]);

  // Total cost
  const totalCost = useMemo(() => {
    const lineTotal = productLineCosts.reduce((sum, item) => sum + item.total, 0);
    return lineTotal + logosCost;
  }, [productLineCosts, logosCost]);

  return (
    <div className="bg-secondary/10 rounded-md p-4 space-y-4">
      <h2 className="text-xl font-semibold">Tổng kết đơn hàng</h2>
      
      <div className="space-y-2">
        <p>
          <span className="font-semibold">Tên đội:</span> {teamName || "(Không có)"}
        </p>
        <p>
          <span className="font-semibold">Số lượng áo:</span> {players.length}
        </p>
        <p>
          <span className="font-semibold">Số lượng logo:</span> {logos.length}
        </p>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Chi phí chi tiết:</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Mô tả</th>
                <th className="text-center p-2">Số lượng</th>
                <th className="text-right p-2">Đơn giá</th>
                <th className="text-right p-2">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {productLineCosts.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{item.description}</td>
                  <td className="text-center p-2">{item.quantity}</td>
                  <td className="text-right p-2">{item.unitPrice.toLocaleString()} VNĐ</td>
                  <td className="text-right p-2">{item.total.toLocaleString()} VNĐ</td>
                </tr>
              ))}
              
              {logos.length > 0 && (
                <tr className="border-b">
                  <td className="p-2">Logo ({logos.length})</td>
                  <td className="text-center p-2">{logos.length}</td>
                  <td className="text-right p-2">20,000 VNĐ</td>
                  <td className="text-right p-2">{logosCost.toLocaleString()} VNĐ</td>
                </tr>
              )}
              
              <tr className="font-semibold">
                <td className="p-2" colSpan={3}>Tổng cộng</td>
                <td className="text-right p-2">{totalCost.toLocaleString()} VNĐ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
