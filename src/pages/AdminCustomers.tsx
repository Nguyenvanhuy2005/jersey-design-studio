
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/layout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Search, LogOut, Edit, Eye, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Customer } from "@/types";
import { useCustomers } from "@/hooks/useCustomers";
import { CustomerForm } from "@/components/admin/customer-management/CustomerForm";
import { CustomerDetails } from "@/components/admin/customer-management/CustomerDetails";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminCustomers = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { 
    customers, 
    loading, 
    error, 
    fetchCustomers, 
    updateCustomer,
    resetPassword
  } = useCustomers();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<(Customer & { order_count?: number }) | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate("/customer/dashboard");
      return;
    }
    
    fetchCustomers();
  }, [user, navigate, fetchCustomers]);
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/admin");
  };

  const handleEditCustomer = async (customerData: any) => {
    if (selectedCustomer) {
      await updateCustomer(selectedCustomer.id, customerData);
      fetchCustomers();
    }
  };
  
  const openEditCustomer = (customer: Customer & { order_count?: number }) => {
    setSelectedCustomer(customer);
    setIsEditCustomerOpen(true);
  };

  const openViewDetails = (customer: Customer & { order_count?: number }) => {
    setSelectedCustomer(customer);
    setIsViewDetailsOpen(true);
  };

  const handleResetPasswordConfirm = async () => {
    if (selectedCustomer?.email) {
      try {
        await resetPassword(selectedCustomer.email);
      } catch (error) {
        // Error handling is done in the hook
      }
      setIsResetPasswordDialogOpen(false);
    } else {
      toast.error("Khách hàng không có email");
    }
  };

  const openResetPasswordDialog = () => {
    setIsResetPasswordDialogOpen(true);
  };
  
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower) ||
      customer.address?.toLowerCase().includes(searchLower)
    );
  });
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý khách hàng</h1>
          
          <div className="flex gap-2 items-center">
            {user && <div className="flex items-center mr-4">
              <span className="text-sm mr-2">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="flex items-center gap-1">
                <LogOut className="h-4 w-4" /> Đăng xuất
              </Button>
            </div>}
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={fetchCustomers}>Làm mới</Button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <div className="bg-card rounded-md shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">Tên</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Số điện thoại</th>
                  <th className="p-3 text-left">Địa chỉ</th>
                  <th className="p-3 text-left">Số đơn hàng</th>
                  <th className="p-3 text-left">Ngày tạo</th>
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center">
                      {searchTerm ? "Không tìm thấy khách hàng phù hợp" : "Chưa có khách hàng nào"}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-t border-muted">
                      <td className="p-3 font-medium">{customer.name || "Không có tên"}</td>
                      <td className="p-3">{customer.email || "Không có email"}</td>
                      <td className="p-3">{customer.phone || "Không có SĐT"}</td>
                      <td className="p-3">{customer.address || "Không có địa chỉ"}</td>
                      <td className="p-3">{customer.order_count}</td>
                      <td className="p-3">
                        {customer.created_at ? new Date(customer.created_at).toLocaleDateString('vi-VN') : "N/A"}
                      </td>
                      <td className="p-3 flex justify-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          title="Xem chi tiết"
                          onClick={() => openViewDetails(customer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          title="Chỉnh sửa"
                          onClick={() => openEditCustomer(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          title="Đặt lại mật khẩu"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            openResetPasswordDialog();
                          }}
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Customer Dialog */}
      {selectedCustomer && (
        <CustomerForm
          customer={selectedCustomer}
          open={isEditCustomerOpen}
          onOpenChange={setIsEditCustomerOpen}
          onSubmit={handleEditCustomer}
          title="Chỉnh sửa thông tin khách hàng"
          submitLabel="Cập nhật"
        />
      )}

      {/* View Customer Details */}
      {selectedCustomer && (
        <CustomerDetails
          customer={selectedCustomer}
          open={isViewDetailsOpen}
          onOpenChange={setIsViewDetailsOpen}
          onEdit={() => {
            setIsViewDetailsOpen(false);
            setIsEditCustomerOpen(true);
          }}
          onResetPassword={() => {
            setIsViewDetailsOpen(false);
            setIsResetPasswordDialogOpen(true);
          }}
        />
      )}

      {/* Reset Password Confirmation Dialog */}
      <AlertDialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đặt lại mật khẩu</AlertDialogTitle>
            <AlertDialogDescription>
              Gửi email đặt lại mật khẩu cho khách hàng {selectedCustomer?.name}?
              {selectedCustomer?.email && (
                <div className="mt-2 font-medium">{selectedCustomer.email}</div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPasswordConfirm}>
              Gửi email đặt lại mật khẩu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default AdminCustomers;
