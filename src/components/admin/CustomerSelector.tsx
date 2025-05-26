import React, { useState, useEffect } from "react";
import { Customer } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, User } from "lucide-react";
import { toast } from "sonner";
interface CustomerSelectorProps {
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer) => void;
  onCreateNew: () => void;
}
export function CustomerSelector({
  selectedCustomer,
  onCustomerSelect,
  onCreateNew
}: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchCustomers();
  }, []);
  const fetchCustomers = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('customers').select('*').order('name');
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };
  const filteredCustomers = customers.filter(customer => customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) || customer.phone?.includes(searchTerm) || customer.email?.toLowerCase().includes(searchTerm.toLowerCase()));
  if (selectedCustomer) {
    return <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Khách hàng đã chọn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Tên:</strong> {selectedCustomer.name}</p>
            <p><strong>SĐT:</strong> {selectedCustomer.phone}</p>
            <p><strong>Địa chỉ:</strong> {selectedCustomer.address}</p>
            {selectedCustomer.email && <p><strong>Email:</strong> {selectedCustomer.email}</p>}
          </div>
          <Button variant="outline" onClick={() => onCustomerSelect(null as any)} className="mt-4">
            Thay đổi khách hàng
          </Button>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Chọn khách hàng
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="search">Tìm kiếm khách hàng</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="search" placeholder="Tìm theo tên, SĐT hoặc email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </div>
          <div className="flex items-end">
            
          </div>
        </div>

        {loading ? <p>Đang tải...</p> : <div className="space-y-2">
            <Label>Danh sách khách hàng ({filteredCustomers.length})</Label>
            <Select onValueChange={value => {
          const customer = customers.find(c => c.id === value);
          if (customer) onCustomerSelect(customer);
        }}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn khách hàng..." />
              </SelectTrigger>
              <SelectContent>
                {filteredCustomers.map(customer => <SelectItem key={customer.id} value={customer.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{customer.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {customer.phone} {customer.email && `• ${customer.email}`}
                      </span>
                    </div>
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>}
      </CardContent>
    </Card>;
}