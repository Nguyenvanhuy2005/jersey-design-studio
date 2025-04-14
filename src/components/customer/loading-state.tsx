
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderCircle } from "lucide-react";

export function CustomerFormLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin khách hàng</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center p-4">
          <LoaderCircle className="h-6 w-6 animate-spin" />
          <span className="ml-2">Đang tải thông tin...</span>
        </div>
      </CardContent>
    </Card>
  );
}
