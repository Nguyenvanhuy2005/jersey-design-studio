
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, ImageIcon } from "lucide-react";
import { Order } from "@/types";
import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { getReferenceImageUrls } from "@/utils/image-utils";
import { toast } from "sonner";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order as Order | undefined;
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [referenceImageUrls, setReferenceImageUrls] = useState<string[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState({
    references: [] as boolean[]
  });
  
  if (!order) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    if (Array.isArray(order.referenceImages) && order.referenceImages.length > 0) {
      const urls = getReferenceImageUrls(order.referenceImages);
      setReferenceImageUrls(urls);
      setImagesLoaded(prev => ({
        ...prev,
        references: Array(urls.length).fill(false)
      }));
      console.log("Reference image URLs in OrderConfirmation:", urls);
    }
  }, [order.referenceImages]);

  const openImageDialog = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsImageDialogOpen(true);
  };

  const handleImageLoad = (type: 'reference', index?: number) => {
    if (type === 'reference' && typeof index === 'number') {
      setImagesLoaded(prev => {
        const newReferences = [...prev.references];
        newReferences[index] = true;
        return { ...prev, references: newReferences };
      });
    }
  };

  const handleImageError = (type: 'reference', imagePath?: string, index?: number) => {
    console.error(`Failed to load ${type} image in OrderConfirmation:`, imagePath);
    if (type === 'reference' && typeof index === 'number') {
      setImagesLoaded(prev => {
        const newReferences = [...prev.references];
        newReferences[index] = false;
        return { ...prev, references: newReferences };
      });
    }
  };

  try {
    const orderId = order.id;
    toast.success("Đơn hàng đã được tạo thành công!");
    navigate('/thank-you', { state: { orderId } });
  } catch (err) {
    toast.error("Có lỗi xảy ra khi tạo đơn hàng");
    console.error("Error creating order:", err);
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="bg-card rounded-xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold mb-2">Đặt đơn hàng thành công!</h1>
            <p className="text-muted-foreground">
              Cảm ơn bạn đã đặt đơn hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.
            </p>
          </div>
          
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold">Chi tiết đơn hàng</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tên đội</p>
                <p className="font-medium">{order.teamName || "Không có tên"}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Số lượng áo</p>
                <p className="font-medium">{order.players.length}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Tổng chi phí</p>
                <p className="font-semibold text-lg">{order.totalCost.toLocaleString()} VNĐ</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <p className="font-medium">
                  <span className="inline-block px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                    Đã gửi đơn
                  </span>
                </p>
              </div>
            </div>

            {referenceImageUrls.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3">Hình ảnh tham khảo</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {referenceImageUrls.map((url, index) => (
                    <div 
                      key={index}
                      className="cursor-pointer" 
                      onClick={() => openImageDialog(url)}
                    >
                      <img 
                        src={url} 
                        alt={`Hình tham khảo ${index + 1}`} 
                        className="w-24 h-24 object-cover rounded-md border shadow-sm" 
                        onLoad={() => handleImageLoad('reference', index)}
                        onError={() => handleImageError('reference', Array.isArray(order.referenceImages) ? order.referenceImages[index] : undefined, index)}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-center text-xs text-muted-foreground mt-1">
                  (Nhấp để xem kích thước đầy đủ)
                </p>
                {imagesLoaded.references.some(loaded => !loaded) && (
                  <p className="text-center text-sm text-red-500 mt-2">
                    Một số hình ảnh không thể tải. Vui lòng kiểm tra quyền truy cập.
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-muted p-4 rounded-md mb-8">
            <h3 className="font-semibold mb-2">Thông tin tiếp theo</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Bạn sẽ nhận được email xác nhận đơn hàng trong vòng 15 phút.</li>
              <li>Đội ngũ của chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ để xác nhận chi tiết.</li>
              <li>Sau khi xác nhận, đơn hàng sẽ được sản xuất trong vòng 5-7 ngày làm việc.</li>
              <li>Bạn sẽ nhận được thông báo khi đơn hàng sẵn sàng để giao.</li>
            </ol>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              Quay lại trang chủ
            </Button>
            <Button onClick={() => navigate("/create-order")}>
              Tạo đơn hàng mới
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Xem hình ảnh</DialogTitle>
            <DialogDescription>
              Xem chi tiết hình ảnh thiết kế
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center">
            {selectedImageUrl && (
              <img 
                src={selectedImageUrl} 
                alt="Hình ảnh" 
                className="max-w-full max-h-[70vh] rounded-md" 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default OrderConfirmation;
