
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface OrderFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  customerFilter: string;
  setCustomerFilter: (value: string) => void;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  setDateRange: React.Dispatch<React.SetStateAction<{
    from: Date | undefined;
    to: Date | undefined;
  }>>;
  customersList: { id: string; name: string }[];
  onFilter: () => void;
  onResetFilters: () => void;
}

export const OrderFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  customerFilter,
  setCustomerFilter,
  dateRange,
  setDateRange,
  customersList,
  onFilter,
  onResetFilters,
}: OrderFiltersProps) => {
  return (
    <div className="bg-muted/30 p-4 rounded-md mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="new">Mới</SelectItem>
            <SelectItem value="processing">Đang xử lý</SelectItem>
            <SelectItem value="completed">Đã hoàn thành</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={customerFilter} onValueChange={setCustomerFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Lọc theo khách hàng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả khách hàng</SelectItem>
            {customersList.map(customer => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name || customer.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal"
              >
                {dateRange.from ? (
                  format(dateRange.from, "dd/MM/yyyy")
                ) : (
                  <span className="text-muted-foreground">Từ ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.from}
                onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                locale={vi}
              />
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal"
              >
                {dateRange.to ? (
                  format(dateRange.to, "dd/MM/yyyy")
                ) : (
                  <span className="text-muted-foreground">Đến ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.to}
                onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                locale={vi}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <Button onClick={onFilter} className="flex items-center gap-1">
          <Filter className="h-4 w-4" /> Lọc
        </Button>
        <Button variant="outline" onClick={onResetFilters}>
          Xóa bộ lọc
        </Button>
      </div>
    </div>
  );
};
