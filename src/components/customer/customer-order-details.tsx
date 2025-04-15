
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Order, Player } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseDateSafely } from "@/utils/format-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, LoaderCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dbOrderToOrder } from "@/utils/adapters";

export function CustomerOrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/customer/auth");
      return;
    }

    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [orderId, user]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("customer_id", user?.id)
        .single();
        
      if (orderError) {
        console.error("Error fetching order:", orderError);
        toast.error("Không thể tải thông tin đơn hàng");
        navigate("/customer/dashboard");
        return;
      }
      
      if (orderData) {
        console.log("Raw order data:", orderData);
        // Convert database order to application Order type
        const convertedOrder = dbOrderToOrder(orderData as any);
        setOrder(convertedOrder);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Có lỗi khi tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="secondary">Đơn mới</Badge>;
      case "processing":
        return <Badge variant="default">Đang xử lý</Badge>;
      case "completed":
        return <Badge variant="success" className="bg-green-500">Hoàn thành</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="flex flex-col items-center py-10">
            <h2 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h2>
            <p className="text-muted-foreground mb-6">
              Đơn hàng không tồn tại hoặc bạn không có quyền truy cập
            </p>
            <Button asChild>
              <Link to="/customer/dashboard">Quay lại trang khách hàng</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const createdAt = parseDateSafely(order.createdAt);

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link to="/customer/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Link>
        </Button>
        
        {order.designImageFront && (
          <Button variant="outline" asChild>
            <a href={order.designImageFront} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Tải thiết kế
            </a>
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Chi tiết đơn hàng</CardTitle>
                <CardDescription>
                  Ngày đặt: {createdAt.toLocaleDateString("vi-VN")}
                </CardDescription>
              </div>
              {formatStatus(order.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Thông tin đơn hàng</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Mã đơn hàng:</span> {order.id}</p>
                  <p><span className="text-muted-foreground">Tên đội:</span> {order.teamName || "Không có"}</p>
                  <p><span className="text-muted-foreground">Số lượng áo:</span> {order.players.length}</p>
                  <p><span className="text-muted-foreground">Tổng tiền:</span> {order.totalCost?.toLocaleString("vi-VN")} đ</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Ghi chú đơn hàng</h3>
                <p className="text-sm">
                  {order.notes || "Không có ghi chú"}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-4">Danh sách áo đấu</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>STT</TableHead>
                      <TableHead>Tên cầu thủ</TableHead>
                      <TableHead>Số áo</TableHead>
                      <TableHead>Kích cỡ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.players.length > 0 ? (
                      order.players.map((player, index) => (
                        <TableRow key={player.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{player.name || "Không có tên"}</TableCell>
                          <TableCell>{player.number}</TableCell>
                          <TableCell>{player.size}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">Không có dữ liệu</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          {order.designImageFront && (
            <Card>
              <CardHeader>
                <CardTitle>Thiết kế áo</CardTitle>
              </CardHeader>
              <CardContent>
                {order.designImageFront && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Mặt trước</h4>
                    <img 
                      src={order.designImageFront} 
                      alt="Thiết kế mặt trước" 
                      className="w-full rounded-md border" 
                    />
                  </div>
                )}
                
                {order.designImageBack && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Mặt sau</h4>
                    <img 
                      src={order.designImageBack} 
                      alt="Thiết kế mặt sau" 
                      className="w-full rounded-md border" 
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                    1
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium">Đặt đơn hàng</h4>
                    <p className="text-sm text-muted-foreground">
                      {createdAt.toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full ${order.status === "processing" || order.status === "completed" ? "bg-green-500" : "bg-gray-300"} flex items-center justify-center text-white`}>
                    2
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium">Đang xử lý</h4>
                    <p className="text-sm text-muted-foreground">
                      {order.status === "processing" || order.status === "completed" 
                        ? "Đơn hàng đang được sản xuất" 
                        : "Chờ xử lý"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full ${order.status === "completed" ? "bg-green-500" : "bg-gray-300"} flex items-center justify-center text-white`}>
                    3
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium">Hoàn thành</h4>
                    <p className="text-sm text-muted-foreground">
                      {order.status === "completed" 
                        ? "Đơn hàng đã hoàn thành" 
                        : "Chưa hoàn thành"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
