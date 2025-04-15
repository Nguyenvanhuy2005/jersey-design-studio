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
import { ArrowLeft, Download, LoaderCircle, Printer, Shirt, Type } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Chi tiết đơn hàng</TabsTrigger>
          <TabsTrigger value="players">Danh sách cầu thủ</TabsTrigger>
          <TabsTrigger value="designs">Thiết kế</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Thông tin đơn hàng #{order.id}</CardTitle>
                    <CardDescription>
                      Ngày đặt: {createdAt.toLocaleDateString("vi-VN")}
                    </CardDescription>
                  </div>
                  {order.status && (
                    <Badge>{
                      order.status === 'new' ? 'Đơn mới' :
                      order.status === 'processing' ? 'Đang xử lý' :
                      order.status === 'completed' ? 'Hoàn thành' :
                      order.status
                    }</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Print Configuration */}
                <div>
                  <h3 className="font-medium flex items-center gap-2 mb-4">
                    <Printer className="h-4 w-4" />
                    Cấu hình in ấn
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Font chữ và kiểu in
                      </h4>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Font chữ/số</TableCell>
                            <TableCell>{order.printConfig?.font || "Arial"}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Shirt className="h-4 w-4" />
                        Chất liệu và màu sắc
                      </h4>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Chất liệu áo trước</TableCell>
                            <TableCell>{order.printConfig?.frontMaterial}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Màu áo trước</TableCell>
                            <TableCell>{order.printConfig?.frontColor}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Chất liệu áo sau</TableCell>
                            <TableCell>{order.printConfig?.backMaterial}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Màu áo sau</TableCell>
                            <TableCell>{order.printConfig?.backColor}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                {/* Print Lines */}
                <div>
                  <h3 className="font-medium mb-4">Danh sách in ấn</h3>
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
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Total Cost */}
                <div className="border-t pt-4">
                  <div className="text-right">
                    <span className="font-medium">Tổng tiền: </span>
                    <span className="text-lg font-bold">
                      {order.totalCost?.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
                      <TableHead>Tên cầu thủ</TableHead>
                      <TableHead>Số áo</TableHead>
                      <TableHead>Kích thước</TableHead>
                      <TableHead>Chi tiết in ấn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.players?.map((player, index) => (
                      <TableRow key={player.id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div>
                            <p>{player.name || "(Không có tên)"}</p>
                            {player.line_1 && (
                              <p className="text-xs text-muted-foreground">
                                Tên in: {player.line_1}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{player.number}</TableCell>
                        <TableCell>{player.size}</TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {player.chest_number && (
                              <p>- In số ngực</p>
                            )}
                            {player.chest_text && (
                              <p>- In chữ ngực: {player.chest_text}</p>
                            )}
                            {player.pants_number && (
                              <p>- In số quần</p>
                            )}
                            {player.logo_chest_left && (
                              <p>- Logo ngực trái</p>
                            )}
                            {player.logo_chest_right && (
                              <p>- Logo ngực phải</p>
                            )}
                            {player.logo_chest_center && (
                              <p>- Logo ngực giữa</p>
                            )}
                            {player.note && (
                              <p className="text-muted-foreground">Ghi chú: {player.note}</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="designs">
          <div className="grid gap-6">
            {(order.designImageFront || order.designImage || order.designImageBack) && (
              <Card>
                <CardHeader>
                  <CardTitle>Thiết kế áo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {(order.designImageFront || order.designImage) && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Mặt trước</h4>
                        <img
                          src={order.designImageFront || order.designImage}
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
                  </div>
                </CardContent>
              </Card>
            )}

            {order.referenceImages && order.referenceImages.length > 0 && (
              <Card>
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
