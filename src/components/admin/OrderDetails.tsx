
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Order } from "@/types";
import { toast } from "sonner";
import { ImageIcon, AlertTriangle } from "lucide-react";
import { 
  getDesignImageUrl, 
  getReferenceImageUrls, 
  checkDesignImageExists,
  checkReferenceImageExists,
  getFallbackImageUrl 
} from "@/utils/image-utils";

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
  const [designImageUrl, setDesignImageUrl] = useState<string | null>(null);
  const [designImageExists, setDesignImageExists] = useState<boolean>(false);
  const [referenceImageUrls, setReferenceImageUrls] = useState<string[]>([]);
  
  // Check image existences and generate URLs when component mounts
  useEffect(() => {
    const initializeImages = async () => {
      // Check if design image exists
      if (order.designImage) {
        const exists = await checkDesignImageExists(order.designImage);
        setDesignImageExists(exists);
        console.log(`Design image exists check for ${order.designImage}: ${exists}`);
        
        // Generate URL regardless, we'll handle fallback in UI
        const url = getDesignImageUrl(order.designImage);
        setDesignImageUrl(url);
        console.log(`Design image URL for ${order.designImage}: ${url}`);
      }
      
      // Generate reference image URLs
      if (Array.isArray(order.referenceImages) && order.referenceImages.length > 0) {
        const urls = getReferenceImageUrls(order.referenceImages);
        setReferenceImageUrls(urls);
        console.log(`Generated ${urls.length} reference image URLs`);
      }
    };
    
    initializeImages();
  }, [order.designImage, order.referenceImages]);
  
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
  
  // Get design image URL with fallback handling
  const getDisplayDesignImageUrl = (): string => {
    if (!order.designImage) return getFallbackImageUrl('design');
    return designImageUrl || getFallbackImageUrl('design');
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
            <p>
              <span className="text-muted-foreground">Design Image Path:</span> 
              <span className="text-xs ml-1 font-mono">{order.designImage || "N/A"}</span>
            </p>
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
              <div className="relative">
                <img 
                  src={getDisplayDesignImageUrl()} 
                  alt="Design Preview" 
                  className="max-h-64 object-contain cursor-pointer"
                  onClick={() => {
                    onViewImage(getDisplayDesignImageUrl());
                  }}
                  onLoad={() => handleImageLoad('design')}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getFallbackImageUrl('design');
                    handleImageError('design', order.designImage);
                  }}
                />
                
                {(!designImageExists || !imagesLoaded.design) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-500/70 text-white p-1 text-sm flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Có vấn đề với hình ảnh thiết kế
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-2 bg-yellow-50 p-2 rounded text-sm">
              <p>
                <strong>Tình trạng:</strong> {designImageExists ? 'Hình ảnh tồn tại' : 'Hình ảnh không tồn tại trong storage'}
              </p>
              <p>
                <strong>URL:</strong> <span className="text-xs font-mono break-all">{designImageUrl || 'Không có URL'}</span>
              </p>
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
            <h3 className="font-semibold mb-2">Hình ảnh tham khảo ({referenceImageUrls.length})</h3>
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
