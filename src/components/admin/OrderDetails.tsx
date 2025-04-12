
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Order } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon } from "lucide-react";

interface OrderDetailsProps {
  order: Order;
  onViewImage: (imageUrl: string) => void;
  onStatusChange: (orderId: string, newStatus: 'new' | 'processing' | 'completed') => void;
}

export const OrderDetails = ({ 
  order, 
  onViewImage,
  onStatusChange
}: OrderDetailsProps) => {
  const [branch, setBranch] = useState<string>("");
  
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
  
  const handleConfirmSale = () => {
    onStatusChange(order.id!, 'completed');
    toast.success(`Đơn hàng ${order.teamName} đã được xác nhận bán`);
  };

  const handleConfirmPrint = () => {
    toast.success(`Đã xác nhận in tất cả các sản phẩm cho đơn hàng: ${order.teamName}`);
  };

  const handleExportCSV = () => {
    toast.success(`Đã xuất file danh sách cầu thủ cho đơn hàng: ${order.teamName}`);
  };
  
  return (
    <>
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
          <Button size="sm" onClick={handleExportCSV}>
            Tải danh sách cầu thủ
          </Button>
          
          <Button size="sm" variant="secondary" onClick={handleConfirmPrint}>
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
          
          <Button size="sm" variant="default" onClick={handleConfirmSale} disabled={!branch}>
            Xác nhận bán
          </Button>
        </div>

        {order.referenceImages && order.referenceImages.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Hình ảnh tham khảo</h3>
            <div className="flex flex-wrap gap-2">
              {order.referenceImages.map((imagePath, index) => {
                const imageUrl = supabase.storage
                  .from('reference_images')
                  .getPublicUrl(imagePath).data.publicUrl;
                
                return (
                  <img
                    key={index}
                    src={imageUrl}
                    alt={`Reference Image ${index + 1}`}
                    className="h-16 w-16 object-cover cursor-pointer rounded border hover:opacity-80"
                    onClick={() => onViewImage(imageUrl)}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
