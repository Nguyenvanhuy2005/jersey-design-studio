
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/layout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Search, LogOut, Edit, Eye, Key, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Customer } from "@/types";
import { useCustomers } from "@/hooks/useCustomers";
import { CustomerForm } from "@/components/admin/customer-management/CustomerForm";
import { CustomerDetails } from "@/components/admin/customer-management/CustomerDetails";
import { debounce } from "lodash";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    getCustomerWithOrdersCount
  } = useCustomers();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [customerWithOrdersCount, setCustomerWithOrdersCount] = useState<Customer & { order_count: number } | null>(null);
  
  // Set up a debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      handleSearch(value);
    }, 500),
    [handleSearch]
  );

  useEffect(() => {
    if (!user) {
      navigate("/customer/dashboard");
    }
  }, [user, navigate]);
  
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
    }
  };
  
  const openEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditCustomerOpen(true);
  };

  const openViewDetails = async (customer: Customer) => {
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
    } else {
      toast.error("Khách hàng không có email");
    }
  };

  const openResetPasswordDialog = () => {
    setIsResetPasswordDialogOpen(true);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink 
          isActive={page === 1} 
          onClick={() => page !== 1 && handlePageChange(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Show ellipsis if needed
    if (page > 3) {
      items.push(
        <PaginationItem key="ellipsis1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Show middle pages
    const startPage = Math.max(2, page - 1);
    const endPage = Math.min(totalPages - 1, page + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      if (i <= 1 || i >= totalPages) continue; // Skip first and last page as they're handled separately
      
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={page === i} 
            onClick={() => page !== i && handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Show ellipsis if needed
    if (page < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink 
            isActive={page === totalPages} 
            onClick={() => page !== totalPages && handlePageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
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
            {user && <div className="flex items-center">
              <span className="text-sm mr-2">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="flex items-center gap-1">
                <LogOut className="h-4 w-4" /> Đăng xuất
              </Button>
            </div>}
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm khách hàng..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-8"
              />
            </div>
            <Button onClick={() => fetchCustomers({ page, pageSize, forceRefresh: true })}>Làm mới</Button>
            
            <div className="flex items-center">
              <span className="text-sm mr-2">Hiển thị:</span>
              <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(parseInt(value))}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-4">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-4">
                    {searchTerm ? "Không tìm thấy khách hàng phù hợp" : "Chưa có khách hàng nào"}
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {!loading && customers.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Hiển thị {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, totalCount)} trong số {totalCount} khách hàng
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => page > 1 && handlePageChange(page - 1)}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {getPaginationItems()}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => hasMore && handlePageChange(page + 1)}
                    className={!hasMore ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
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
    </Layout>
  );
};

export default AdminCustomers;
