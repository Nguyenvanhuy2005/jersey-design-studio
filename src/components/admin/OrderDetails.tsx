
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Order } from "@/types";
import { toast } from "sonner";
import { ImageIcon } from "lucide-react";
import { getDesignImageUrl, getReferenceImageUrls } from "@/utils/image-utils";

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
  const [imagesLoaded, setImagesLoaded] = useState({
    design: false,
    references: Array.isArray(order.referenceImages) ? Array(order.referenceImages.length).fill(false) : []
  });
  
  const formatDate = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('vi-VN');
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

  const handleImageLoad = (type: 'design' | 'reference', index?: number) => {
    if (type === 'design') {
      setImagesLoaded(prev => ({ ...prev, design: true }));
    } else if (type === 'reference' && typeof index === 'number') {
      setImagesLoaded(prev => {
        const newReferences = [...prev.references];
        newReferences[index] = true;
        return { ...prev, references: newReferences };
      });
    }
  };

  const handleImageError = (type: 'design' | 'reference', imagePath?: string, index?: number) => {
    console.error(`Failed to load ${type} image:`, imagePath);
    if (type === 'design') {
      setImagesLoaded(prev => ({ ...prev, design: false }));
    } else if (type === 'reference' && typeof index === 'number') {
      setImagesLoaded(prev => {
        const newReferences = [...prev.references];
        newReferences[index] = false;
        return { ...prev, references: newReferences };
      });
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
  
  // Prepare reference image URLs
  const referenceImageUrls = Array.isArray(order.referenceImages) 
    ? getReferenceImageUrls(order.referenceImages) 
    : [];
  
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
                src={getDesignImageUrl(order.designImage) || 'https://via.placeholder.com/400x300?text=Không+thể+tải+hình+ảnh'}
                alt="Design Preview" 
                className="max-h-64 object-contain cursor-pointer"
                onClick={() => {
                  const imageUrl = getDesignImageUrl(order.designImage);
                  if (imageUrl) onViewImage(imageUrl);
                }}
                onLoad={() => handleImageLoad('design')}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/400x300?text=Không+thể+tải+hình+ảnh';
                  handleImageError('design', order.designImage);
                }}
              />
            </div>
            {!imagesLoaded.design && (
              <p className="text-center text-sm text-red-500 mt-2">
                Không thể tải hình ảnh thiết kế. Vui lòng kiểm tra quyền truy cập.
              </p>
            )}
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
                {order.players.map((player, index) => (
                  <TableRow key={player.id || index}>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>{player.number}</TableCell>
                    <TableCell>{player.size}</TableCell>
                    <TableCell>{player.printImage ? "Có" : "Không"}</TableCell>
                  </TableRow>
                ))}
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

        {referenceImageUrls.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Hình ảnh tham khảo</h3>
            <div className="flex flex-wrap gap-2">
              {referenceImageUrls.map((imageUrl, index) => (
                <div 
                  key={index}
                  className="group relative h-16 w-16 overflow-hidden rounded border border-muted"
                >
                  <img
                    src={imageUrl}
                    alt={`Reference ${index + 1}`}
                    className="h-full w-full object-cover cursor-pointer transition-transform group-hover:scale-110"
                    onClick={() => onViewImage(imageUrl)}
                    onLoad={() => handleImageLoad('reference', index)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/150?text=Error';
                      handleImageError('reference', order.referenceImages?.[index], index);
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <ImageIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              ))}
            </div>
            {imagesLoaded.references.some(loaded => !loaded) && (
              <p className="text-center text-sm text-red-500 mt-2">
                Một số hình ảnh không thể tải. Vui lòng kiểm tra quyền truy cập.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};
