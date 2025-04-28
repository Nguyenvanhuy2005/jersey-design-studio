import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/layout";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Customer } from "@/types";
import { useCustomers } from "@/hooks/useCustomers";
import { CustomerForm } from "@/components/admin/customer-management/CustomerForm";
import { CustomerDetails } from "@/components/admin/customer-management/CustomerDetails";
import { debounce } from "lodash";
import { CustomerSearch } from "@/components/admin/customer-management/CustomerSearch";
import { CustomersTable } from "@/components/admin/customer-management/CustomersTable";
import { CustomerPagination } from "@/components/admin/customer-management/CustomerPagination";
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
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const AdminCustomers = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { 
    customers, 
    loading, 
    error, 
    totalCount,
    page,
    pageSize,
    hasMore,
    fetchCustomers,
    updateCustomer,
    resetPassword,
    createCustomer,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    getCustomerWithOrdersCount,
    deleteCustomer
  } = useCustomers();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [customerWithOrdersCount, setCustomerWithOrdersCount] = useState<Customer & { order_count: number } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      handleSearch(value);
    }, 500),
    [handleSearch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin");
  };

  const handleCreateCustomer = async (customerData: any) => {
    await createCustomer(customerData);
    setIsCreateCustomerOpen(false);
  };

  const handleEditCustomer = async (customerData: any) => {
    if (selectedCustomer) {
      await updateCustomer(selectedCustomer.id, customerData);
      setIsEditCustomerOpen(false);
    }
  };
  
  const handleOpenViewDetails = async (customer: Customer) => {
    try {
      const customerWithCount = await getCustomerWithOrdersCount(customer.id);
      setCustomerWithOrdersCount(customerWithCount);
      setSelectedCustomer(customer);
      setIsViewDetailsOpen(true);
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  const handleResetPasswordConfirm = async () => {
    if (selectedCustomer?.email) {
      try {
        await resetPassword(selectedCustomer.email);
      } catch (error) {
        // Error handling is done in the hook
      }
      setIsResetPasswordDialogOpen(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (selectedCustomer) {
      try {
        await deleteCustomer(selectedCustomer.id);
      } catch (error) {
        // Error handling is done in the hook
      }
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý khách hàng</h1>
          
          <div className="flex gap-2 items-center">
            <Button 
              onClick={() => setIsCreateCustomerOpen(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Thêm khách hàng
            </Button>
            {user && (
              <div className="flex items-center">
                <span className="text-sm mr-2">{user.email}</span>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="flex items-center gap-1">
                  <LogOut className="h-4 w-4" /> Đăng xuất
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <CustomerSearch
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onRefresh={() => fetchCustomers({ page, pageSize, forceRefresh: true })}
          />
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <div className="bg-card rounded-md shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <CustomersTable
                customers={customers}
                loading={loading}
                onViewDetails={handleOpenViewDetails}
                onEdit={(customer) => {
                  setSelectedCustomer(customer);
                  setIsEditCustomerOpen(true);
                }}
                onResetPassword={(customer) => {
                  setSelectedCustomer(customer);
                  setIsResetPasswordDialogOpen(true);
                }}
                onDelete={(customer) => {
                  setSelectedCustomer(customer);
                  setIsDeleteDialogOpen(true);
                }}
              />
            </TableBody>
          </Table>
        </div>
        
        {!loading && customers.length > 0 && (
          <CustomerPagination
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            hasMore={hasMore}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>

      {/* Create Customer Form */}
      <CustomerForm
        customer={{} as Customer}
        open={isCreateCustomerOpen}
        onOpenChange={setIsCreateCustomerOpen}
        onSubmit={handleCreateCustomer}
        title="Thêm khách hàng mới"
        submitLabel="Tạo"
      />

      {/* Edit Customer Form */}
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
      {selectedCustomer && customerWithOrdersCount && (
        <CustomerDetails
          customer={customerWithOrdersCount}
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

      {/* Delete Customer Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khách hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khách hàng {selectedCustomer?.name}? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCustomer}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa khách hàng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default AdminCustomers;
