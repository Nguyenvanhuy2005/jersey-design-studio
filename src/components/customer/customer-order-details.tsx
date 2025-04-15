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
import { ArrowLeft, Calendar, LoaderCircle, MapPin, Phone, Printer, Shirt, Type, User } from "lucide-react";
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
      
      const { data: printConfigData, error: printConfigError } = await supabase
        .from("print_configs")
        .select("*")
        .eq("order_id", orderId)
        .single();
        
      if (printConfigError && printConfigError.code !== 'PGRST116') {
        console.error("Error fetching print config:", printConfigError);
      }
      
      const { data: productLinesData, error: productLinesError } = await supabase
        .from("product_lines")
        .select("*")
        .eq("order_id", orderId);
        
      if (productLinesError) {
        console.error("Error fetching product lines:", productLinesError);
      }
      
      const { data: logosData, error: logosError } = await supabase
        .from("logos")
        .select("*")
        .eq("order_id", orderId);
        
      if (logosError) {
        console.error("Error fetching logos:", logosError);
      }
      
      const completeOrder = {
        ...orderData,
        players: playersData || [],
        printConfig: printConfigData || {},
        productLines: productLinesData || [],
        logos: logosData || []
      };
      
      console.log("Complete order data:", completeOrder);
      const convertedOrder = dbOrderToOrder(completeOrder as any);
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
                  <span>{order.customerName || "Không xác định"}</span>
                </div>
                {order.customerPhone && (
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>{order.customerPhone}</span>
                  </div>
                )}
                {order.customerAddress && (
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
                Cấu hình in ấn
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
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
                      <TableRow>
                        <TableCell className="font-medium">Chất liệu tay áo</TableCell>
                        <TableCell>{order.printConfig?.sleeveMaterial}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Màu tay áo</TableCell>
                        <TableCell>{order.printConfig?.sleeveColor}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Chất liệu quần</TableCell>
                        <TableCell>{order.printConfig?.legMaterial}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Màu quần</TableCell>
                        <TableCell>{order.printConfig?.legColor}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            <Separator />

            {(order.designImageFront || order.designImage || order.designImageBack) && (
              <div>
                <h3 className="font-semibold mb-3">Thiết kế áo đấu</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {(order.designImageFront || order.designImage) && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Mặt trước</h4>
                      <img
                        src={order.designImageFront || order.designImage}
                        alt="Thiết kế mặt trước"
                        className="w-full rounded-md border aspect-[3/4] object-contain bg-muted"
                      />
                    </div>
                  )}
                  {order.designImageBack && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Mặt sau</h4>
                      <img
                        src={order.designImageBack}
                        alt="Thiết kế mặt sau"
                        className="w-full rounded-md border aspect-[3/4] object-contain bg-muted"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {order.referenceImages && order.referenceImages.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Hình ảnh tham khảo</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {order.referenceImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Tham khảo ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-md border"
                    />
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Shirt className="h-5 w-5" />
                Danh sách cầu thủ ({order.players.length})
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
                    {order.players.map((player, index) => (
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
                            <div className="space-y-1">
                              {player.chest_number && <p>• In số ngực</p>}
                              {player.chest_text && <p>• In chữ ngực: {player.chest_text}</p>}
                              {player.pants_number && <p>• In số quần</p>}
                              {player.pet_chest && <p>• PET ngực: {player.pet_chest}</p>}
                            </div>
                            {(player.logo_chest_left || 
                              player.logo_chest_right || 
                              player.logo_chest_center || 
                              player.logo_sleeve_left || 
                              player.logo_sleeve_right || 
                              player.logo_pants) && (
                              <div className="mt-2">
                                <p className="font-medium text-xs text-muted-foreground mb-1">Vị trí logo:</p>
                                <div className="space-y-0.5 ml-2">
                                  {player.logo_chest_left && <p>• Logo ngực trái</p>}
                                  {player.logo_chest_right && <p>• Logo ngực phải</p>}
                                  {player.logo_chest_center && <p>• Logo ngực giữa</p>}
                                  {player.logo_sleeve_left && <p>• Logo tay trái</p>}
                                  {player.logo_sleeve_right && <p>• Logo tay phải</p>}
                                  {player.logo_pants && <p>• Logo quần</p>}
                                </div>
                              </div>
                            )}
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground">Kiểu in: {player.print_style || "In chuyển nhiệt"}</p>
                            </div>
                            {player.note && (
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground">Ghi chú: {player.note}</p>
                              </div>
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

            {order.productLines && order.productLines.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  Danh sách in ấn ({order.productLines.length} vị trí)
                </h3>
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
                        <TableHead>Điểm</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.productLines.map((line, index) => (
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
                          <TableCell>{line.points}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {order.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Ghi chú đơn hàng</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {order.notes}
                  </p>
                </div>
              </>
            )}

            <Separator />
            <div className="pt-2">
              <div className="flex justify-end items-center gap-4">
                <span className="font-medium">Tổng tiền:</span>
                <span className="text-xl font-bold">
                  {order.totalCost.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
