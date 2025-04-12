
import { useCallback, useMemo } from "react";
import { Order, Player, ProductLine } from "@/types";

interface OrderSummaryProps {
  teamName: string;
  players: Player[];
  productLines: ProductLine[];
}

export function OrderSummary({ teamName, players, productLines }: OrderSummaryProps) {
  // Calculate costs
  const calculateCost = useCallback((position: string): number => {
    switch (position) {
      case "Lưng trên":
      case "Lưng giữa": 
      case "Lưng dưới":
      case "Tay":
      case "Ống quần":
        return 10000; // 10,000 VND
      default:
        return 0;
    }
  }, []);

  // Calculate logo cost - assuming there's a logo if any player has printImage = true
  const logoPrice = 20000; // 20,000 VND
  const hasLogo = useMemo(() => players.some(p => p.printImage), [players]);
  const logoCost = hasLogo ? logoPrice : 0;

  // Calculate product line costs
  const productLineCosts = useMemo(() => {
    return productLines.map(line => ({
      description: `${line.position} (${line.product})`,
      quantity: players.length,
      unitPrice: calculateCost(line.position),
      total: players.length * calculateCost(line.position)
    }));
  }, [players.length, productLines, calculateCost]);

  // Total cost
  const totalCost = useMemo(() => {
    const lineTotal = productLineCosts.reduce((sum, item) => sum + item.total, 0);
    return lineTotal + logoCost;
  }, [productLineCosts, logoCost]);

  return (
    <div className="bg-secondary/10 rounded-md p-4 space-y-4">
      <h2 className="text-xl font-semibold">Tổng kết đơn hàng</h2>
      
      <div className="space-y-2">
        <p>
          <span className="font-semibold">Tên đội:</span> {teamName}
        </p>
        <p>
          <span className="font-semibold">Số lượng áo:</span> {players.length}
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
              
              {hasLogo && (
                <tr className="border-b">
                  <td className="p-2">Logo</td>
                  <td className="text-center p-2">1</td>
                  <td className="text-right p-2">{logoPrice.toLocaleString()} VNĐ</td>
                  <td className="text-right p-2">{logoCost.toLocaleString()} VNĐ</td>
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
