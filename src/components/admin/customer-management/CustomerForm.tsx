
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Customer } from "@/types";
import { Loader2, Info } from "lucide-react";

interface CustomerFormProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (customerData: any) => Promise<void>;
  title: string;
  submitLabel: string;
}

export function CustomerForm({
  customer,
  open,
  onOpenChange,
  onSubmit,
  title,
  submitLabel
}: CustomerFormProps) {
  const [formData, setFormData] = useState<any>({
    name: customer.name || "",
    phone: customer.phone || "",
    address: customer.address || "",
    delivery_note: customer.delivery_note || "",
    email: customer.email || ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin họ tên, số điện thoại và địa chỉ");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
            <Info className="h-4 w-4" />
            <span>Email là tùy chọn. Chỉ cần điền họ tên, số điện thoại và địa chỉ.</span>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên khách hàng *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Địa chỉ *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email (tùy chọn)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="delivery_note">Ghi chú giao hàng</Label>
              <Textarea
                id="delivery_note"
                name="delivery_note"
                value={formData.delivery_note}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
