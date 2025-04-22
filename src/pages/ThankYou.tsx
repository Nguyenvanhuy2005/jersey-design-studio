
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ThankYou = () => {
  const navigate = useNavigate();
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
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Button variant="outline" onClick={() => navigate("/")}>
              Về trang chủ
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

export default ThankYou;
