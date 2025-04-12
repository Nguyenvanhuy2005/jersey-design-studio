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
  const [designImagesLoaded, setDesignImagesLoaded] = useState({
    front: false,
    back: false
  });
  const [referenceImagesLoaded, setReferenceImagesLoaded] = useState(
    Array.isArray(order.referenceImages) ? Array(order.referenceImages.length).fill(false) : []
  );
  
  const [frontDesignImageUrl, setFrontDesignImageUrl] = useState<string | null>(null);
  const [backDesignImageUrl, setBackDesignImageUrl] = useState<string | null>(null);
  const [designImagesExist, setDesignImagesExist] = useState({
    front: false,
    back: false
  });
  const [referenceImageUrls, setReferenceImageUrls] = useState<string[]>([]);
  
  useEffect(() => {
    const initializeImages = async () => {
      const frontImagePath = order.designImageFront || order.designImage;
      if (frontImagePath) {
        const exists = await checkDesignImageExists(frontImagePath);
        setDesignImagesExist(prev => ({ ...prev, front: exists }));
        console.log(`Front design image exists check for ${frontImagePath}: ${exists}`);
        
        const url = getDesignImageUrl(frontImagePath);
        setFrontDesignImageUrl(url);
        console.log(`Front design image URL for ${frontImagePath}: ${url}`);
      }
      
      if (order.designImageBack) {
        const exists = await checkDesignImageExists(order.designImageBack);
        setDesignImagesExist(prev => ({ ...prev, back: exists }));
        console.log(`Back design image exists check for ${order.designImageBack}: ${exists}`);
        
        const url = getDesignImageUrl(order.designImageBack);
        setBackDesignImageUrl(url);
        console.log(`Back design image URL for ${order.designImageBack}: ${url}`);
      }
      
      if (Array.isArray(order.referenceImages) && order.referenceImages.length > 0) {
        const urls = getReferenceImageUrls(order.referenceImages);
        setReferenceImageUrls(urls);
        console.log(`Generated ${urls.length} reference image URLs`);
      }
    };
    
    initializeImages();
  }, [order.designImageFront, order.designImage, order.designImageBack, order.referenceImages]);
  
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

  const handleImageLoad = (type: 'front' | 'back' | 'reference', index?: number) => {
    if (type === 'front') {
      setDesignImagesLoaded(prev => ({ ...prev, front: true }));
    } else if (type === 'back') {
      setDesignImagesLoaded(prev => ({ ...prev, back: true }));
    } else if (type === 'reference' && typeof index === 'number') {
      setReferenceImagesLoaded(prev => {
        const newLoaded = [...prev];
        newLoaded[index] = true;
        return newLoaded;
      });
    }
  };

  const handleImageError = (type: 'front' | 'back' | 'reference', imagePath?: string, index?: number) => {
    console.error(`Failed to load ${type} image:`, imagePath);
    if (type === 'front') {
      setDesignImagesLoaded(prev => ({ ...prev, front: false }));
    } else if (type === 'back') {
      setDesignImagesLoaded(prev => ({ ...prev, back: false }));
    } else if (type === 'reference' && typeof index === 'number') {
      setReferenceImagesLoaded(prev => {
        const newLoaded = [...prev];
        newLoaded[index] = false;
        return newLoaded;
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
  
  const getFrontDesignImageUrl = (): string => {
    const imagePath = order.designImageFront || order.designImage;
    if (!imagePath) return getFallbackImageUrl('design');
    return frontDesignImageUrl || getFallbackImageUrl('design');
  };
  
  const getBackDesignImageUrl = (): string => {
    if (!order.designImageBack) return getFallbackImageUrl('design');
    return backDesignImageUrl || getFallbackImageUrl('design');
  };
  
  const hasFrontDesign = !!(order.designImageFront || order.designImage);
  const hasBackDesign = !!order.designImageBack;
  
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
        
        {(hasFrontDesign || hasBackDesign) && (
          <div>
            <h3 className="font-semibold mb-2">Hình ảnh thiết kế</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hasFrontDesign && (
                <div className="border rounded p-3">
                  <h4 className="font-medium text-sm mb-2">Mặt trước</h4>
                  <div className="relative">
                    <img 
                      src={getFrontDesignImageUrl()} 
                      alt="Front Design Preview" 
                      className="max-h-64 object-contain cursor-pointer w-full"
                      onClick={() => {
                        onViewImage(getFrontDesignImageUrl());
                      }}
                      onLoad={() => handleImageLoad('front')}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getFallbackImageUrl('design');
                        handleImageError('front', order.designImageFront || order.designImage);
                      }}
                    />
                    
                    {(!designImagesExist.front || !designImagesLoaded.front) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-red-500/70 text-white p-1 text-sm flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Có vấn đề với hình ảnh thiết kế
                      </div>
                    )}
                  </div>
                  <p className="text-xs mt-1 text-muted-foreground break-all">
                    {order.designImageFront || order.designImage || "N/A"}
                  </p>
                </div>
              )}
              
              {hasBackDesign && (
                <div className="border rounded p-3">
                  <h4 className="font-medium text-sm mb-2">Mặt sau</h4>
                  <div className="relative">
                    <img 
                      src={getBackDesignImageUrl()} 
                      alt="Back Design Preview" 
                      className="max-h-64 object-contain cursor-pointer w-full"
                      onClick={() => {
                        onViewImage(getBackDesignImageUrl());
                      }}
                      onLoad={() => handleImageLoad('back')}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getFallbackImageUrl('design');
                        handleImageError('back', order.designImageBack);
                      }}
                    />
                    
                    {(!designImagesExist.back || !designImagesLoaded.back) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-red-500/70 text-white p-1 text-sm flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Có vấn đề với hình ảnh thiết kế
                      </div>
                    )}
                  </div>
                  <p className="text-xs mt-1 text-muted-foreground break-all">
                    {order.designImageBack || "N/A"}
                  </p>
                </div>
              )}
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
            {referenceImagesLoaded.some(loaded => !loaded) && (
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
