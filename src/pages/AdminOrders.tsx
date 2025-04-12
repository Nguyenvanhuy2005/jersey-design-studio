import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Layout } from "@/components/layout/layout";
import { Order, Player } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronDown, Mail, Eye, LogOut, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const mockOrders: Order[] = [
  {
    id: "order-1",
    teamName: "FC Barcelona",
    players: Array(11).fill(null).map((_, i) => ({
      id: `player-${i + 1}-1`,
      name: `Player ${i + 1}`,
      number: i + 1,
      size: i % 2 === 0 ? "M" : "L",
      printImage: i % 3 === 0
    })),
    printConfig: {
      font: "Arial",
      backMaterial: "In chuyển nhiệt",
      backColor: "Trắng",
      frontMaterial: "In chuyển nhiệt",
      frontColor: "Đen",
      sleeveMaterial: "In chuyển nhiệt",
      sleeveColor: "Đen",
      legMaterial: "In chuyển nhiệt",
      legColor: "Đen"
    },
    productLines: [
      {
        id: "product-1-1",
        product: "Áo thi đấu",
        position: "Lưng trên",
        material: "In chuyển nhiệt",
        size: "Trung bình",
        points: 1,
        content: "Tên cầu thủ"
      },
      {
        id: "product-1-2",
        product: "Áo thi đấu",
        position: "Lưng giữa",
        material: "In chuyển nhiệt",
        size: "Lớn",
        points: 1,
        content: "Số áo"
      }
    ],
    totalCost: 3500000,
    status: "new",
    designImage: "order-1/design.png",
    createdAt: new Date(2023, 3, 15)
  },
  {
    id: "order-2",
    teamName: "Manchester United",
    players: Array(15).fill(null).map((_, i) => ({
      id: `player-${i + 1}-2`,
      name: `Player ${i + 1}`,
      number: i + 1,
      size: i % 2 === 0 ? "L" : "XL",
      printImage: i % 2 === 0
    })),
    printConfig: {
      font: "Helvetica",
      backMaterial: "In trực tiếp",
      backColor: "Đen",
      frontMaterial: "In trực tiếp",
      frontColor: "Đen",
      sleeveMaterial: "In trực tiếp",
      sleeveColor: "Đen",
      legMaterial: "In trực tiếp",
      legColor: "Đen"
    },
    productLines: [
      {
        id: "product-2-1",
        product: "Áo thi đấu",
        position: "Lưng trên",
        material: "In trực tiếp",
        size: "Trung bình",
        points: 1,
        content: "Tên cầu thủ"
      },
      {
        id: "product-2-2",
        product: "Áo thi đấu",
        position: "Lưng giữa",
        material: "In trực tiếp",
        size: "Lớn",
        points: 1,
        content: "Số áo"
      }
    ],
    totalCost: 4200000,
    status: "processing",
    designImage: "order-2/design.png",
    createdAt: new Date(2023, 3, 20)
  },
  {
    id: "order-3",
    teamName: "Real Madrid",
    players: Array(18).fill(null).map((_, i) => ({
      id: `player-${i + 1}-3`,
      name: `Player ${i + 1}`,
      number: i + 1,
      size: i % 3 === 0 ? "S" : i % 3 === 1 ? "M" : "L",
      printImage: true
    })),
    printConfig: {
      font: "Roboto",
      backMaterial: "In chuyển nhiệt",
      backColor: "Đen",
      frontMaterial: "In chuyển nhiệt",
      frontColor: "Trắng",
      sleeveMaterial: "In chuyển nhiệt",
      sleeveColor: "Trắng",
      legMaterial: "In chuyển nhiệt",
      legColor: "Trắng"
    },
    productLines: [
      {
        id: "product-3-1",
        product: "Áo thi đấu",
        position: "Lưng trên",
        material: "In chuyển nhiệt",
        size: "Trung bình",
        points: 1,
        content: "Tên cầu thủ"
      },
      {
        id: "product-3-2",
        product: "Áo thi đấu",
        position: "Lưng giữa",
        material: "In chuyển nhiệt",
        size: "Lớn",
        points: 1,
        content: "Số áo"
      }
    ],
    totalCost: 5400000,
    status: "completed",
    designImage: "order-3/design.png",
    createdAt: new Date(2023, 2, 10)
  }
];

const AdminOrders = () => {
  const navigate = useNavigate();
  const { user, isLoading, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [branch, setBranch] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        console.log("Fetching orders data...");
        
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*, players(*), product_lines(*), print_configs(*)');
          
          if (error) {
            console.error("Error fetching orders:", error);
            toast.error("Không thể tải dữ liệu đơn hàng");
            setOrders(mockOrders);
          } else if (data && data.length > 0) {
            console.log("Raw orders data:", data);
            
            const transformedOrders: Order[] = data.map(order => ({
              id: order.id,
              teamName: order.team_name || '',
              status: order.status as 'new' | 'processing' | 'completed',
              totalCost: order.total_cost,
              createdAt: new Date(order.created_at || ''),
              notes: order.notes || '',
              designImage: order.design_image || '',
              referenceImages: order.design_data && typeof order.design_data === 'object' ? 
                (order.design_data as DesignData).reference_images || [] : [],
              players: order.players ? order.players.map((player: any) => ({
                id: player.id,
                name: player.name || '',
                number: player.number,
                size: player.size as 'S' | 'M' | 'L' | 'XL',
                printImage: player.print_image || false
              })) : [],
              productLines: order.product_lines ? order.product_lines.map((line: any) => ({
                id: line.id,
                product: line.product,
                position: line.position,
                material: line.material,
                size: line.size,
                points: line.points || 0,
                content: line.content || ''
              })) : [],
              printConfig: order.print_configs && order.print_configs.length > 0 ? {
                id: order.print_configs[0].id,
                font: order.print_configs[0].font || 'Arial',
                backMaterial: order.print_configs[0].back_material || '',
                backColor: order.print_configs[0].back_color || '',
                frontMaterial: order.print_configs[0].front_material || '',
                frontColor: order.print_configs[0].front_color || '',
                sleeveMaterial: order.print_configs[0].sleeve_material || '',
                sleeveColor: order.print_configs[0].sleeve_color || '',
                legMaterial: order.print_configs[0].leg_material || '',
                legColor: order.print_configs[0].leg_color || ''
              } : {
                font: 'Arial',
                backMaterial: 'In chuyển nhiệt',
                backColor: 'Đen',
                frontMaterial: 'In chuyển nhiệt',
                frontColor: 'Đen',
                sleeveMaterial: 'In chuyển nhiệt',
                sleeveColor: 'Đen',
                legMaterial: 'In chuyển nhiệt',
                legColor: 'Đen'
              }
            }));
            
            console.log("Transformed orders:", transformedOrders);
            setOrders(transformedOrders);
          } else {
            console.log("No orders found, using mock data");
            setOrders(mockOrders);
          }
        } catch (e) {
          console.error("Exception in fetchOrders:", e);
          toast.error("Có lỗi xảy ra khi tải dữ liệu");
          setOrders(mockOrders);
        }
      };
      
      fetchOrders();
    }
  }, [user]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  const handleStatusChange = (orderId: string, newStatus: 'new' | 'processing' | 'completed') => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    
    supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .then(({ error }) => {
        if (error) {
          console.error("Error updating order status:", error);
          toast.error("Không thể cập nhật trạng thái đơn hàng");
        } else {
          toast.success(`Trạng thái đơn hàng đã được cập nhật thành ${
            newStatus === 'new' ? 'Mới' : 
            newStatus === 'processing' ? 'Đang xử lý' : 
            'Đã hoàn thành'
          }`);
        }
      });
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Đã đăng xuất khỏi hệ thống");
    navigate("/admin");
  };

  const handleSendEmail = (order: Order) => {
    toast.success(`Email đã được gửi đến khách hàng về đơn hàng: ${order.teamName}`);
  };

  const handleConfirmSale = (order: Order) => {
    handleStatusChange(order.id!, 'completed');
    toast.success(`Đơn hàng ${order.teamName} đã được xác nhận bán`);
  };

  const handleConfirmPrint = (order: Order) => {
    toast.success(`Đã xác nhận in tất cả các sản phẩm cho đơn hàng: ${order.teamName}`);
  };

  const handleExportCSV = (order: Order) => {
    toast.success(`Đã xuất file danh sách cầu thủ cho đơn hàng: ${order.teamName}`);
  };

  const formatDate = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getDesignImageUrl = (designImage?: string) => {
    if (!designImage) return null;
    
    try {
      if (designImage.startsWith('http')) {
        return designImage;
      }
      
      const { data } = supabase.storage
        .from('design_images')
        .getPublicUrl(designImage);
        
      return data.publicUrl;
    } catch (error) {
      console.error("Error getting design image URL:", error);
      return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-500">Mới</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-500">Đang xử lý</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Đã hoàn thành</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
          
          <div className="flex gap-2 items-center">
            {user && (
              <div className="flex items-center mr-4">
                <span className="text-sm mr-2">{user.email}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" /> Đăng xuất
                </Button>
              </div>
            )}
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="new">Mới</SelectItem>
                <SelectItem value="processing">Đang xử lý</SelectItem>
                <SelectItem value="completed">Đã hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="bg-card rounded-md shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Tên đội</th>
                  <th className="p-3 text-left">Số lượng áo</th>
                  <th className="p-3 text-left">Tổng chi phí</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-left">Ngày tạo</th>
                  <th className="p-3 text-left">Thiết kế</th>
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {
                  statusFilter === "all"
                  ? orders.map((order) => (
                    <tr key={order.id} className="border-t border-muted">
                      <td className="p-3">{order.id}</td>
                      <td className="p-3 font-medium">{order.teamName}</td>
                      <td className="p-3">{order.players.length}</td>
                      <td className="p-3">{order.totalCost.toLocaleString()} VNĐ</td>
                      <td className="p-3">{getStatusBadge(order.status)}</td>
                      <td className="p-3">{formatDate(order.createdAt)}</td>
                      <td className="p-3">
                        {order.designImage && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedImage(getDesignImageUrl(order.designImage))}
                            className="flex items-center gap-1"
                          >
                            <ImageIcon className="h-4 w-4" /> Xem
                          </Button>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="h-4 w-4 mr-1" /> Chi tiết
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Chi tiết đơn hàng: {order.teamName}</DialogTitle>
                              </DialogHeader>
                              
                              <div className="space-y-4 my-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-semibold">Thông tin cơ bản</h3>
                                    <p><span className="text-muted-foreground">ID:</span> {order.id}</p>
                                    <p><span className="text-muted-foreground">Tên đội:</span> {order.teamName}</p>
                                    <p><span className="text-muted-foreground">Số lượng áo:</span> {order.players.length}</p>
                                    <p><span className="text-muted-foreground">Tổng chi phí:</span> {order.totalCost.toLocaleString()} VNĐ</p>
                                    <p><span className="text-muted-foreground">Trạng thái:</span> {getStatusBadge(order.status)}</p>
                                    <p><span className="text-muted-foreground">Ngày tạo:</span> {formatDate(order.createdAt)}</p>
                                  </div>
                                  
                                  <div>
                                    <h3 className="font-semibold">Cấu hình in</h3>
                                    <p><span className="text-muted-foreground">Font:</span> {order.printConfig.font}</p>
                                    <p><span className="text-muted-foreground">Chất liệu in lưng:</span> {order.printConfig.backMaterial}</p>
                                    <p><span className="text-muted-foreground">Màu in lưng:</span> {order.printConfig.backColor}</p>
                                    <p><span className="text-muted-foreground">Chất liệu in mặt trước:</span> {order.printConfig.frontMaterial}</p>
                                    <p><span className="text-muted-foreground">Màu in mặt trước:</span> {order.printConfig.frontColor}</p>
                                  </div>
                                </div>
                                
                                {order.designImage && (
                                  <div>
                                    <h3 className="font-semibold mb-2">Hình ảnh thiết kế</h3>
                                    <div className="border rounded p-2 flex justify-center">
                                      <img 
                                        src={getDesignImageUrl(order.designImage)} 
                                        alt="Design Preview" 
                                        className="max-h-64 object-contain"
                                      />
                                    </div>
                                  </div>
                                )}
                                
                                <div>
                                  <h3 className="font-semibold mb-2">Danh sách cầu thủ</h3>
                                  <div className="overflow-x-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Tên</TableHead>
                                          <TableHead>Số áo</TableHead>
                                          <TableHead>Kích thước</TableHead>
                                          <TableHead>In hình</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {order.players.map((player, index) => {
                                          return (
                                            <TableRow key={player.id || index}>
                                              <TableCell>{player.name}</TableCell>
                                              <TableCell>{player.number}</TableCell>
                                              <TableCell>{player.size}</TableCell>
                                              <TableCell>{player.printImage ? "Có" : "Không"}</TableCell>
                                            </TableRow>
                                          );
                                        })}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                                
                                <div>
                                  <h3 className="font-semibold mb-2">Sản phẩm in</h3>
                                  <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                      <thead className="bg-muted">
                                        <tr>
                                          <th className="p-2 text-left">Sản phẩm</th>
                                          <th className="p-2 text-left">Vị trí</th>
                                          <th className="p-2 text-left">Chất liệu</th>
                                          <th className="p-2 text-left">Kích thước</th>
                                          <th className="p-2 text-left">Nội dung</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {order.productLines.map((line) => (
                                          <tr key={line.id} className="border-b border-muted">
                                            <td className="p-2">{line.product}</td>
                                            <td className="p-2">{line.position}</td>
                                            <td className="p-2">{line.material}</td>
                                            <td className="p-2">{line.size}</td>
                                            <td className="p-2">{line.content}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                  <Button size="sm" onClick={() => handleExportCSV(order)}>
                                    Tải danh sách cầu thủ
                                  </Button>
                                  
                                  <Button size="sm" variant="secondary" onClick={() => handleConfirmPrint(order)}>
                                    Xác nhận in tất cả
                                  </Button>
                                  
                                  <Select value={branch} onValueChange={setBranch}>
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Chọn nhánh" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="print">CÓ IN</SelectItem>
                                      <SelectItem value="noprint">KHÔNG IN</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  
                                  <Button size="sm" variant="default" onClick={() => handleConfirmSale(order)} disabled={!branch}>
                                    Xác nhận bán
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {order.status === 'new' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id!, 'processing')}>
                                  Chuyển sang "Đang xử lý"
                                </DropdownMenuItem>
                              )}
                              {order.status === 'processing' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id!, 'completed')}>
                                  Chuyển sang "Đã hoàn thành"
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleSendEmail(order)}>
                                <Mail className="h-4 w-4 mr-2" /> Gửi email
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                  : orders.filter(order => order.status === statusFilter).map((order) => (
                    <tr key={order.id} className="border-t border-muted">
                      <td className="p-3">{order.id}</td>
                      <td className="p-3 font-medium">{order.teamName}</td>
                      <td className="p-3">{order.players.length}</td>
                      <td className="p-3">{order.totalCost.toLocaleString()} VNĐ</td>
                      <td className="p-3">{getStatusBadge(order.status)}</td>
                      <td className="p-3">{formatDate(order.createdAt)}</td>
                      <td className="p-3">
                        {order.designImage && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedImage(getDesignImageUrl(order.designImage))}
                            className="flex items-center gap-1"
                          >
                            <ImageIcon className="h-4 w-4" /> Xem
                          </Button>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="h-4 w-4 mr-1" /> Chi tiết
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {order.status === 'new' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id!, 'processing')}>
                                  Chuyển sang "Đang xử lý"
                                </DropdownMenuItem>
                              )}
                              {order.status === 'processing' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id!, 'completed')}>
                                  Chuyển sang "Đã hoàn thành"
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleSendEmail(order)}>
                                <Mail className="h-4 w-4 mr-2" /> Gửi email
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                }
                {(statusFilter === "all" ? orders.length === 0 : orders.filter(order => order.status === statusFilter).length === 0) && (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-muted-foreground">
                      Không có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <Dialog>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Chi tiết đơn hàng: {selectedOrder.teamName}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 my-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Thông tin cơ bản</h3>
                    <p><span className="text-muted-foreground">ID:</span> {selectedOrder.id}</p>
                    <p><span className="text-muted-foreground">Tên đội:</span> {selectedOrder.teamName}</p>
                    <p><span className="text-muted-foreground">Số lượng áo:</span> {selectedOrder.players.length}</p>
                    <p><span className="text-muted-foreground">Tổng chi phí:</span> {selectedOrder.totalCost.toLocaleString()} VNĐ</p>
                    <p><span className="text-muted-foreground">Trạng thái:</span> {getStatusBadge(selectedOrder.status)}</p>
                    <p><span className="text-muted-foreground">Ngày tạo:</span> {formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">Cấu hình in</h3>
                    <p><span className="text-muted-foreground">Font:</span> {selectedOrder.printConfig.font}</p>
                    <p><span className="text-muted-foreground">Chất liệu in lưng:</span> {selectedOrder.printConfig.backMaterial}</p>
                    <p><span className="text-muted-foreground">Màu in lưng:</span> {selectedOrder.printConfig.backColor}</p>
                    <p><span className="text-muted-foreground">Chất liệu in mặt trước:</span> {selectedOrder.printConfig.frontMaterial}</p>
                    <p><span className="text-muted-foreground">Màu in mặt trước:</span> {selectedOrder.printConfig.frontColor}</p>
                  </div>
                </div>
                
                {selectedOrder.designImage && (
                  <div>
                    <h3 className="font-semibold mb-2">Hình ảnh thiết kế</h3>
                    <div className="border rounded p-2 flex justify-center">
                      <img 
                        src={getDesignImageUrl(selectedOrder.designImage)} 
                        alt="Design Preview" 
                        className="max-h-64 object-contain"
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold mb-2">Danh sách cầu thủ</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tên</TableHead>
                          <TableHead>Số áo</TableHead>
                          <TableHead>Kích thước</TableHead>
                          <TableHead>In hình</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.players.map((player, index) => {
                          return (
                            <TableRow key={player.id || index}>
                              <TableCell>{player.name}</TableCell>
                              <TableCell>{player.number}</TableCell>
                              <TableCell>{player.size}</TableCell>
                              <TableCell>{player.printImage ? "Có" : "Không"}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Sản phẩm in</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-2 text-left">Sản phẩm</th>
                          <th className="p-2 text-left">Vị trí</th>
                          <th className="p-2 text-left">Chất liệu</th>
                          <th className="p-2 text-left">Kích thước</th>
                          <th className="p-2 text-left">Nội dung</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.productLines.map((line) => (
                          <tr key={line.id} className="border-b border-muted">
                            <td className="p-2">{line.product}</td>
                            <td className="p-2">{line.position}</td>
                            <td className="p-2">{line.material}</td>
                            <td className="p-2">{line.size}</td>
                            <td className="p-2">{line.content}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => handleExportCSV(selectedOrder)}>
                    Tải danh sách cầu thủ
                  </Button>
                  
                  <Button size="sm" variant="secondary" onClick={() => handleConfirmPrint(selectedOrder)}>
                    Xác nhận in tất cả
                  </Button>
                  
                  <Select value={branch} onValueChange={setBranch}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Chọn nhánh" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="print">CÓ IN</SelectItem>
                      <SelectItem value="noprint">KHÔNG IN</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button size="sm" variant="default" onClick={() => handleConfirmSale(selectedOrder)} disabled={!branch}>
                    Xác nhận bán
                  </Button>
                </div>
              </div>

              {selectedOrder.referenceImages && selectedOrder.referenceImages.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Hình ảnh tham khảo</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.referenceImages.map((imagePath, index) => {
                      const imageUrl = supabase.storage
                        .from('reference_images')
                        .getPublicUrl(imagePath).data.publicUrl;
                      
                      return (
                        <img
                          key={index}
                          src={imageUrl}
                          alt={`Reference Image ${index + 1}`}
                          className="h-16 w-16 object-cover cursor-pointer rounded border hover:opacity-80"
                          onClick={() => setSelectedImage(imageUrl)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Xem thiết kế</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center p-4">
              <img 
                src={selectedImage} 
                alt="Jersey Design" 
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
};

export default AdminOrders;
