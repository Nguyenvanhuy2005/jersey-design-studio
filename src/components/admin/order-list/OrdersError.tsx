
import { AlertTriangle } from "lucide-react";

interface OrdersErrorProps {
  error: string;
}

export const OrdersError = ({ error }: OrdersErrorProps) => {
  return (
    <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-4">
      <div className="flex gap-2">
        <AlertTriangle className="h-5 w-4 text-red-500" />
        <div>
          <h3 className="font-medium text-red-800">Lỗi tải dữ liệu</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    </div>
  );
};
