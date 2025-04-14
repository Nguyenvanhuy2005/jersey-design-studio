
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/layout";
import { Link } from "react-router-dom";
import { CanvasJersey } from "@/components/ui/canvas-jersey";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-secondary via-secondary to-background py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                Thiết kế áo đấu bóng đá của riêng bạn
              </h1>
              <p className="text-lg text-secondary-foreground mb-8">
                Dễ dàng thiết kế và đặt áo đấu cho đội bóng của bạn với công cụ thiết kế trực tuyến của chúng tôi.
                Chất lượng in ấn hàng đầu, giao hàng nhanh chóng.
              </p>
              <Link to="/create-order">
                <Button size="lg" className="text-lg px-8">
                  Tạo đơn hàng <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            <div className="flex justify-center">
              <div className="flex gap-4 relative">
                <div className="transform rotate-[-15deg]">
                  <CanvasJersey 
                    teamName="FOOTBALL TEAM" 
                    playerName="RONALDO" 
                    playerNumber="7" 
                    view="back"
                  />
                </div>
                <div className="transform rotate-[15deg]">
                  <CanvasJersey 
                    teamName="FOOTBALL TEAM" 
                    playerNumber="7" 
                    view="front"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn dịch vụ của chúng tôi?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-md">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Chất lượng cao</h3>
              <p className="text-muted-foreground">
                Chúng tôi sử dụng công nghệ in ấn tiên tiến và vải chất lượng cao để đảm bảo áo đấu bền, không phai màu sau nhiều lần giặt.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-md">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Giao hàng nhanh</h3>
              <p className="text-muted-foreground">
                Thời gian hoàn thành chỉ từ 5-7 ngày làm việc. Đảm bảo đội bóng của bạn có áo đấu trước trận đấu quan trọng.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-md">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tùy chỉnh hoàn toàn</h3>
              <p className="text-muted-foreground">
                Tự do thiết kế với nhiều lựa chọn về màu sắc, kiểu dáng, font chữ và thêm logo đội bóng của bạn.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-primary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng tạo áo đấu cho đội bóng của bạn?</h2>
          <p className="text-lg mb-8 max-w-xl mx-auto">
            Bắt đầu ngay để có được bộ áo đấu chuyên nghiệp cho đội bóng của bạn với chất lượng tốt nhất và giá cả hợp lý.
          </p>
          <Link to="/create-order">
            <Button size="lg" className="text-lg px-8">
              Tạo đơn hàng ngay
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
