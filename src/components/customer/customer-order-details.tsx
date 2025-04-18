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
import { ArrowLeft, LoaderCircle, Printer, Shirt, Type } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dbOrderToOrder } from "@/utils/adapters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssetViewer } from "./AssetViewer";

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
      setLoading(true);
      
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(`
          *,
          customer:customers!orders_customer_id_fkey(
            name,
            phone,
            address,
            delivery_note
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

      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("*")
        .eq("order_id", orderId);

      if (playersError) {
        console.error("Error fetching players:", playersError);
      }

      const { data: productLinesData, error: productLinesError } = await supabase
        .from("product_lines")
        .select("*")
        .eq("order_id", orderId);

      if (productLinesError) {
        console.error("Error fetching product lines:", productLinesError);
      }

      const { data: printConfigData, error: printConfigError } = await supabase
        .from("print_configs")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();

      if (printConfigError) {
        console.error("Error fetching print config:", printConfigError);
      }

      console.log("Complete order data:", {
        order: orderData,
        players: playersData,
        productLines: productLinesData,
        printConfig: printConfigData
      });
      
      const convertedOrder = dbOrderToOrder(
        orderData,
        orderData.customer,
        playersData || [],
        productLinesData || [],
        printConfigData
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

  const getAssets = () => {
    const assets = [];

    if (order.referenceImages && order.referenceImages.length > 0) {
      assets.push({
        type: 'images' as const,
        title: 'Hình ảnh tham khảo',
        items: order.referenceImages.map((url, index) => ({
          url,
          name: `reference-image-${index + 1}.jpg`,
          type: 'image' as const
        }))
      });
    }

    if (order.logo_url) {
      assets.push({
        type: 'logos' as const,
        title: 'Logo',
        items: [{
          url: order.logo_url,
          name: 'team-logo.png',
          type: 'image' as const
        }]
      });
    }

    if (order.printConfig?.font) {
      assets.push({
        type: 'fonts' as const,
        title: 'Font chữ/số',
        items: [{
          url: `/fonts/${order.printConfig.font}.ttf`,
          name: `${order.printConfig.font}.ttf`,
          type: 'font' as const
        }]
      });
    }

    return assets;
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
        </TabsList>

        <TabsContent value="details">
          <div className="space-y-6">
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

            {getAssets().map((assetGroup, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <AssetViewer
                    title={assetGroup.title}
                    assets={assetGroup.items}
                    gridCols={assetGroup.type === 'images' ? 4 : 2}
                  />
                </CardContent>
              </Card>
            ))}
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
      </Tabs>
    </div>
  );
}
