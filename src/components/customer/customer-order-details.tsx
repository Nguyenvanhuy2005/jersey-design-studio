import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Order } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseDateSafely } from "@/utils/format-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { dbOrderToOrder } from "@/utils/adapters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          customer:customers(
            name,
            phone,
            address,
            delivery_note
          ),
          players(
            *
          ),
          print_configs(
            *
          ),
          product_lines(
            *
          ),
          logos(
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
      
      const convertedOrder = dbOrderToOrder(
        orderData,
        orderData.customer,
        orderData.players,
        orderData.product_lines,
        orderData.print_configs?.[0]
      );
      
      setOrder(convertedOrder);
      
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
        {formatStatus(order.status)}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <CardTitle className="text-2xl">Đơn hàng #{order.id}</CardTitle>
              <CardDescription>
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
      </Card>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details" className="flex-1">Chi tiết đơn hàng</TabsTrigger>
          <TabsTrigger value="players" className="flex-1">Danh sách cầu thủ</TabsTrigger>
          <TabsTrigger value="printList" className="flex-1">Danh sách in ấn</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Cấu hình in ấn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Font chữ/số
                  </h4>
                  <div className="grid gap-2">
                    <div className="text-sm">
                      {order.printConfig?.font || "Arial"}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Shirt className="h-4 w-4" />
                    Chất liệu in ấn
                  </h4>
                  <div className="grid gap-2">
                    <div className="text-sm">
                      <p>Áo trước: {order.printConfig?.frontMaterial || "In chuyển nhiệt"}</p>
                      <p>Áo sau: {order.printConfig?.backMaterial || "In chuyển nhiệt"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t mt-6 pt-4">
                <div className="text-right">
                  <span className="font-medium">Tổng tiền: </span>
                  <span className="text-lg font-bold">
                    {order.totalCost?.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="players">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách cầu thủ ({order.players?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>STT</TableHead>
                      <TableHead>In dòng trên số lưng</TableHead>
                      <TableHead>In dòng dưới số lưng</TableHead>
                      <TableHead>Số áo</TableHead>
                      <TableHead>Kích thước</TableHead>
                      <TableHead>Chi tiết in ấn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.players?.map((player, index) => (
                      <TableRow key={player.id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{player.line_1 || "-"}</TableCell>
                        <TableCell>{player.line_3 || "-"}</TableCell>
                        <TableCell className="font-semibold">{player.number}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Shirt className="h-4 w-4" />
                            {player.size}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {player.chest_number && (<p>- In số ngực</p>)}
                            {player.pants_number && (<p>- In số quần</p>)}
                            {(player.logo_chest_left || 
                              player.logo_chest_right || 
                              player.logo_chest_center || 
                              player.logo_sleeve_left || 
                              player.logo_sleeve_right || 
                              player.logo_pants) && (
                              <p className="font-medium mt-1">Vị trí logo:</p>
                            )}
                            {player.logo_chest_left && (<p>- Logo ngực trái</p>)}
                            {player.logo_chest_right && (<p>- Logo ngực phải</p>)}
                            {player.logo_chest_center && (<p>- Logo ngực giữa</p>)}
                            {player.logo_sleeve_left && (<p>- Logo tay trái</p>)}
                            {player.logo_sleeve_right && (<p>- Logo tay phải</p>)}
                            {player.logo_pants && (<p>- Logo quần</p>)}
                            <p className="font-medium mt-1">
                              <span className="inline-flex items-center gap-1">
                                <Printer className="h-4 w-4" />
                                Kiểu in: {player.print_style || "In chuyển nhiệt"}
                              </span>
                            </p>
                            {player.note && (
                              <p className="text-muted-foreground mt-1">Ghi chú: {player.note}</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!order.players || order.players.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          Không có cầu thủ nào trong danh sách
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="printList">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách in ấn ({order.productLines?.length || 0} vị trí)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>STT</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Vị trí</TableHead>
                      <TableHead>Chất liệu</TableHead>
                      <TableHead>Kích thước</TableHead>
                      <TableHead>Nội dung</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.productLines?.map((line, index) => (
                      <TableRow key={line.id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{line.product}</TableCell>
                        <TableCell>{line.position}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Printer className="h-4 w-4" />
                            {line.material}
                          </div>
                        </TableCell>
                        <TableCell>{line.size}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {line.content || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!order.productLines || order.productLines.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          Không có thông tin in ấn
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {order.referenceImages && order.referenceImages.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Hình ảnh tham khảo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {order.referenceImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Tham khảo ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-md border"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
