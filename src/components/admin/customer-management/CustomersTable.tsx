
import React from "react";
import { Customer } from "@/types";
import { Eye, Edit, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

interface CustomersTableProps {
  customers: Customer[];
  loading: boolean;
  onViewDetails: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onResetPassword: (customer: Customer) => void;
}

export function CustomersTable({
  customers,
  loading,
  onViewDetails,
  onEdit,
  onResetPassword
}: CustomersTableProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="text-center p-4">
          <div className="flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Đang tải dữ liệu...</span>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  if (customers.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="text-center p-4">
          Không tìm thấy khách hàng
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {customers.map((customer) => (
        <TableRow key={customer.id}>
          <TableCell className="font-medium">{customer.name || "Không có tên"}</TableCell>
          <TableCell>{customer.email || "Không có email"}</TableCell>
          <TableCell>{customer.phone || "Không có SĐT"}</TableCell>
          <TableCell>{customer.address || "Không có địa chỉ"}</TableCell>
          <TableCell>
            {customer.created_at ? new Date(customer.created_at).toLocaleDateString('vi-VN') : "N/A"}
          </TableCell>
          <TableCell className="flex justify-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              title="Xem chi tiết"
              onClick={() => onViewDetails(customer)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              title="Chỉnh sửa"
              onClick={() => onEdit(customer)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              title="Đặt lại mật khẩu"
              onClick={() => onResetPassword(customer)}
              disabled={!customer.email}
            >
              <Key className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/admin/orders?customer=${customer.id}`)}
            >
              Xem đơn hàng
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
