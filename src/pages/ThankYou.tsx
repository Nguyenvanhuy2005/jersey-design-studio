
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, ExternalLink } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ThankYou = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;

  const handleCopyId = async () => {
    if (!orderId) return;
    
    try {
      await navigator.clipboard.writeText(orderId);
      toast.success("Đã sao chép ID đơn hàng");
    } catch (err) {
      toast.error("Không thể sao chép ID đơn hàng");
      console.error("Copy failed:", err);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 max-w-lg">
        <div className="bg-card rounded-xl p-8 shadow-lg text-center">
          <div className="flex flex-col items-center justify-center mb-6">
            <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </span>
            <h1 className="text-3xl font-bold mt-4 mb-2">Cảm ơn bạn!</h1>
            <p className="text-muted-foreground">
              Đơn hàng của bạn đã được hoàn tất. Chúng tôi sẽ liên hệ trong thời gian sớm nhất.
            </p>
          </div>

          {orderId && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">ID đơn hàng của bạn:</p>
              <div className="flex items-center justify-center gap-2">
                <code className="bg-background px-3 py-1 rounded text-sm">{orderId}</code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyId}
                  title="Sao chép ID"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Vui lòng sao chép ID đơn hàng và gửi cho chúng tôi qua nhóm Zalo để được hỗ trợ chi tiết
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              Về trang chủ
            </Button>
            <Button onClick={() => navigate("/create-order")}>
              Tạo đơn hàng mới
            </Button>
            <Button 
              variant="secondary"
              onClick={() => window.open("https://zalo.me/g/fquqpn860", "_blank")}
            >
              Demo chi tiết <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ThankYou;
