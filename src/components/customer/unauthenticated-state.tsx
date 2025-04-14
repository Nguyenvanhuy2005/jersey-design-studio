
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CustomerFormUnauthenticated() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin khách hàng</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 text-center bg-yellow-50 rounded-md">
          <p className="text-yellow-800">Bạn cần đăng nhập để tiếp tục đặt đơn hàng.</p>
          <Button variant="outline" className="mt-2" asChild>
            <a href="/login">Đăng nhập</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
