
import React from "react";
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { OrderStatus } from "@/components/admin/order-list/OrderStatus";

interface CustomerOrdersListProps {
  orders: Order[];
}

export function CustomerOrdersList({ orders }: CustomerOrdersListProps) {
  const navigate = useNavigate();

  if (orders.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        Bạn chưa có đơn hàng nào
      </div>
    );
  }

  // Helper function to calculate the total number of shirts in an order
  const getShirtCount = (order: Order): number => {
    // If players array exists and has items, return its length
    if (order.players && Array.isArray(order.players)) {
      return order.players.length;
    }
    
    // Default fallback
    return 0;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              STT
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày đặt
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tên đội
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Số lượng
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tổng tiền
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order, index) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {order.teamName || "Con có"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {getShirtCount(order)} áo
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {order.totalCost?.toLocaleString("vi-VN")} đ
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <OrderStatus status={order.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/customer/orders/${order.id}`)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Xem
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
