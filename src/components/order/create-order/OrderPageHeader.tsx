import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, User, ShieldCheck } from "lucide-react";
import { Customer } from "@/types";
interface OrderPageHeaderProps {
  activeTab: string;
  isDemoApproved: boolean;
  isSubmitting: boolean;
  isGeneratingDesign: boolean;
  onViewDemo: () => void;
  onApproveDemo: () => void;
  onSubmitOrder: () => void;
  isAdminMode?: boolean;
  selectedCustomer?: Customer | null;
}
export function OrderPageHeader({
  activeTab,
  isDemoApproved,
  isSubmitting,
  isGeneratingDesign,
  onViewDemo,
  onApproveDemo,
  onSubmitOrder,
  isAdminMode = false,
  selectedCustomer = null
}: OrderPageHeaderProps) {
  const getTabStatus = (tab: string) => {
    if (tab === activeTab) return "current";
    if (tab === "info") return "completed";
    if (tab === "preview" && activeTab === "summary") return "completed";
    if (tab === "preview" && isDemoApproved) return "completed";
    return "pending";
  };
  const TabStatus = ({
    status
  }: {
    status: string;
  }) => {
    switch (status) {
      case "current":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return;
    }
  };
  return <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {isAdminMode && <ShieldCheck className="h-5 w-5 text-green-600" />}
              <h1 className="text-2xl font-bold">
                {isAdminMode ? "Tạo đơn hàng cho khách hàng" : "Tạo đơn hàng mới"}
              </h1>
            </div>
            
            {isAdminMode && selectedCustomer && <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Khách hàng: <strong>{selectedCustomer.name}</strong></span>
                <span>•</span>
                <span>{selectedCustomer.phone}</span>
              </div>}
            
            
          </div>
          
          <div className="flex gap-2">
            {activeTab === "info" && <Button onClick={onViewDemo} disabled={isGeneratingDesign}>
                {isGeneratingDesign ? "Đang tạo..." : "Xem thiết kế demo"}
              </Button>}
            
            {activeTab === "preview" && !isDemoApproved && <Button onClick={onApproveDemo} disabled={isGeneratingDesign}>
                {isGeneratingDesign ? "Đang xử lý..." : "Duyệt thiết kế demo"}
              </Button>}
            
            {activeTab === "summary" && isDemoApproved && <Button onClick={onSubmitOrder} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                {isSubmitting ? "Đang gửi..." : "Gửi đơn hàng"}
              </Button>}
          </div>
        </div>
      </CardContent>
    </Card>;
}