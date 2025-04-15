import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Order } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseDateSafely } from "@/utils/format-utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, LoaderCircle, MapPin, Phone, Shirt, User, Type } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dbOrderToOrder } from "@/utils/adapters";
import { Separator } from "@/components/ui/separator";

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
        .select(`
          *,
          players (
            *
          ),
          print_configs (
            *
          ),
          product_lines (
            *
          ),
          customers (
            *
          )
        `)
        .eq("id", orderId)
        .eq("customer_id", user?.id)
        .single();
        
      if (orderError) {
        console.error("Error fetching order:", orderError);
        toast.error("Không thể tải thông tin đơn hàng");
        navigate("/customer/dashboard");
        return;
      }
      
      if (!orderData) {
        setLoading(false);
        return;
      }
      
      console.log("Complete order data:", orderData);
      const convertedOrder = dbOrderToOrder(orderData);
      setOrder(convertedOrder);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Có lỗi khi tải thông tin đơn hàng");
    } finally {
      setLoading(false);
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

  const getPlayerTypeMaterial = (type: 'player' | 'goalkeeper') => {
    if (!order?.printConfig) return 'Chưa cập nhật';
    return type === 'player' ? 
      order.printConfig.frontMaterial : 
      (order.printConfig.backMaterial || 'Chưa cập nhật');
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link to="/customer/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Link>
        </Button>
        <Badge variant={
          order.status === 'new' ? 'secondary' :
          order.status === 'processing' ? 'default' :
          order.status === 'completed' ? 'success' :
          'outline'
        }>
          {order.status === 'new' ? 'Đơn mới' :
           order.status === 'processing' ? 'Đang xử lý' :
           order.status === 'completed' ? 'Hoàn thành' :
           order.status}
        </Badge>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <CardTitle className="text-2xl">Đơn hàng #{order.id}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  Ngày đặt: {createdAt.toLocaleDateString("vi-VN")}
                </CardDescription>
              </div>
              {order.teamName && (
                <div className="bg-muted px-3 py-1 rounded-md text-sm">
                  Đội: <span className="font-semibold">{order.teamName}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin khách hàng
              </h3>
              <div className="grid gap-2 text-sm pl-7">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <span>{order?.customerName || "Không xác định"}</span>
                </div>
                {order?.customerPhone && (
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>{order.customerPhone}</span>
                  </div>
                )}
                {order?.customerAddress && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>{order.customerAddress}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Type className="h-5 w-5" />
                Thông tin chất liệu in
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Chất liệu in áo cầu thủ</TableCell>
                        <TableCell>{getPlayerTypeMaterial('player')}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Chất liệu in áo thủ môn</TableCell>
                        <TableCell>{getPlayerTypeMaterial('goalkeeper')}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            <Separator />

            {/* Players List */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Shirt className="h-5 w-5" />
                Danh sách cầu thủ ({order?.players.length || 0})
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>STT</TableHead>
                      <TableHead>Tên cầu thủ</TableHead>
                      <TableHead>Số áo</TableHead>
                      <TableHead>Kích thước</TableHead>
                      <TableHead>Chi tiết in ấn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order?.players.map((player, index) => (
                      <TableRow key={player.id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{player.name || "(Không có tên)"}</p>
                            {(player.line_1 || player.line_2 || player.line_3) && (
                              <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                                {player.line_1 && <p>Dòng trên: {player.line_1}</p>}
                                {player.line_2 && <p>Dòng giữa: {player.line_2}</p>}
                                {player.line_3 && <p>Dòng dưới: {player.line_3}</p>}
                              </div>
                            )}
                            {player.uniform_type === 'goalkeeper' && (
                              <Badge variant="outline" className="mt-1">Thủ môn</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{player.number}</TableCell>
                        <TableCell>{player.size}</TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {player.chest_number && <p>• Số ngực</p>}
                            {player.chest_text && <p>• Chữ ngực: {player.chest_text}</p>}
                            {player.pants_number && <p>• Số quần</p>}
                            {player.pet_chest && <p>• PET ngực: {player.pet_chest}</p>}
                            {player.print_style && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Kiểu in: {player.print_style}
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <Separator />

            {/* Total cost section */}
            <div className="pt-2">
              <div className="flex justify-end items-center gap-4">
                <span className="font-medium">Tổng tiền:</span>
                <span className="text-xl font-bold">
                  {order?.totalCost.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
