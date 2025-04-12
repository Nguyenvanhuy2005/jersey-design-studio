
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Order } from "@/types";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order as Order | undefined;
  
  // Redirect if no order data (e.g. if user accessed this page directly)
  if (!order) {
    return <Navigate to="/" replace />;
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
                <p className="font-medium">{order.teamName}</p>
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
    </Layout>
  );
};

export default OrderConfirmation;
