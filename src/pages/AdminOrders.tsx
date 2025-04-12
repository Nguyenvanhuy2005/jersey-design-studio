
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";
import { Layout } from "@/components/layout/layout";
import { Order } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronDown, Mail, Eye } from "lucide-react";

// Mock data for demo
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
    createdAt: new Date(2023, 2, 10)
  }
];

const AdminOrders = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [branch, setBranch] = useState<string>("");
  
  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem("admin_authenticated");
    setIsAuthenticated(auth === "true");
    
    // Load orders
    // In a real app, this would fetch from Supabase
    setOrders(mockOrders);
  }, []);

  if (isAuthenticated === null) {
    // Still checking authentication
    return <div className="p-8 text-center">Loading...</div>;
  }
  
  if (isAuthenticated === false) {
    // Redirect to login if not authenticated
    return <Navigate to="/admin" replace />;
  }

  // Filter orders by status
  const filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const handleStatusChange = (orderId: string, newStatus: 'new' | 'processing' | 'completed') => {
    // Update order status
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    
    toast.success(`Trạng thái đơn hàng đã được cập nhật thành ${
      newStatus === 'new' ? 'Mới' : 
      newStatus === 'processing' ? 'Đang xử lý' : 
      'Đã hoàn thành'
    }`);
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
    // In a real app, this would generate and download a CSV file
    toast.success(`Đã xuất file danh sách cầu thủ cho đơn hàng: ${order.teamName}`);
  };

  const formatDate = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('vi-VN');
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
          
          <div className="flex gap-2">
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
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-t border-muted">
                      <td className="p-3">{order.id}</td>
                      <td className="p-3 font-medium">{order.teamName}</td>
                      <td className="p-3">{order.players.length}</td>
                      <td className="p-3">{order.totalCost.toLocaleString()} VNĐ</td>
                      <td className="p-3">{getStatusBadge(order.status)}</td>
                      <td className="p-3">{formatDate(order.createdAt)}</td>
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
                                
                                <div>
                                  <h3 className="font-semibold mb-2">Danh sách cầu thủ</h3>
                                  <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                      <thead className="bg-muted">
                                        <tr>
                                          <th className="p-2 text-left">Tên</th>
                                          <th className="p-2 text-left">Số áo</th>
                                          <th className="p-2 text-left">Kích thước</th>
                                          <th className="p-2 text-left">In hình</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {order.players.map((player, index) => (
                                          <tr key={player.id || index} className="border-b border-muted">
                                            <td className="p-2">{player.name}</td>
                                            <td className="p-2">{player.number}</td>
                                            <td className="p-2">{player.size}</td>
                                            <td className="p-2">{player.printImage ? "Có" : "Không"}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
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
                ) : (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                      Không có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminOrders;
