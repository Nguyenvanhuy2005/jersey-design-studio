
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DeliveryInformation } from "@/types";
import { PlusCircle, Save, Loader2 } from "lucide-react";
import { useDeliveryForm } from "@/hooks/useDeliveryForm";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DeliveryFormProps {
  initialDelivery?: DeliveryInformation;
  onDeliveryInfoChange: (info: DeliveryInformation) => void;
  externalDeliveryInfo?: DeliveryInformation;
}

export function DeliveryForm({
  initialDelivery,
  onDeliveryInfoChange,
  externalDeliveryInfo
}: DeliveryFormProps) {
  const {
    loading,
    saving,
    deliveryInfo,
    deliveryInfoList,
    selectedDeliveryId,
    handleInputChange,
    selectSavedDelivery,
    saveDeliveryInfo
  } = useDeliveryForm(initialDelivery, externalDeliveryInfo);
  
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Update parent component when delivery info changes
  const onInputChange = (field: keyof DeliveryInformation, value: string) => {
    handleInputChange(field, value);
    const updatedInfo = { ...deliveryInfo, [field]: value };
    onDeliveryInfoChange(updatedInfo);
  };

  // When delivery info from hook changes, notify parent
  useEffect(() => {
    console.log("DeliveryForm: delivery info changed:", deliveryInfo);
    onDeliveryInfoChange(deliveryInfo);
  }, [deliveryInfo, onDeliveryInfoChange]);

  const onSaveDeliveryInfo = async () => {
    const result = await saveDeliveryInfo();
    if (result) {
      setIsAddingNew(false);
    }
  };

  const onSelectDelivery = (id: string) => {
    selectSavedDelivery(id);
    const selected = deliveryInfoList.find(item => item.id === id);
    if (selected) {
      onDeliveryInfoChange({
        recipient_name: selected.recipient_name,
        address: selected.address,
        phone: selected.phone,
        delivery_note: selected.delivery_note || ""
      });
    }
  };

  const handleNewDelivery = () => {
    setIsAddingNew(true);
    handleInputChange('recipient_name', '');
    handleInputChange('address', '');
    handleInputChange('phone', '');
    handleInputChange('delivery_note', '');
    
    onDeliveryInfoChange({
      recipient_name: '',
      address: '',
      phone: '',
      delivery_note: ''
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Thông tin giao hàng</span>
          {!loading && deliveryInfoList.length > 0 && !isAddingNew && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewDelivery}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Thêm mới</span>
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {deliveryInfoList.length > 0 && !isAddingNew && !externalDeliveryInfo && (
              <div className="space-y-2">
                <Label htmlFor="saved-address">Địa chỉ đã lưu</Label>
                <Select value={selectedDeliveryId || ''} onValueChange={onSelectDelivery}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn địa chỉ" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {deliveryInfoList.map((info) => (
                        <SelectItem key={info.id} value={info.id || ''}>
                          {info.recipient_name} - {info.address} ({info.phone})
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
            )}

            {(isAddingNew || deliveryInfoList.length === 0 || externalDeliveryInfo) && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="recipient_name">Tên người nhận *</Label>
                  <Input
                    id="recipient_name"
                    value={deliveryInfo.recipient_name}
                    onChange={(e) => onInputChange('recipient_name', e.target.value)}
                    placeholder="Nhập tên người nhận"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ *</Label>
                  <Input
                    id="address"
                    value={deliveryInfo.address}
                    onChange={(e) => onInputChange('address', e.target.value)}
                    placeholder="Nhập địa chỉ giao hàng"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <Input
                    id="phone"
                    value={deliveryInfo.phone}
                    onChange={(e) => onInputChange('phone', e.target.value)}
                    placeholder="Nhập số điện thoại người nhận"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_note">Ghi chú giao hàng</Label>
                  <Textarea
                    id="delivery_note"
                    value={deliveryInfo.delivery_note || ''}
                    onChange={(e) => onInputChange('delivery_note', e.target.value)}
                    placeholder="Nhập ghi chú giao hàng nếu có"
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
      {(isAddingNew || deliveryInfoList.length === 0) && !externalDeliveryInfo && (
        <CardFooter className="flex justify-end space-x-2">
          {isAddingNew && (
            <Button
              variant="outline"
              onClick={() => setIsAddingNew(false)}
              disabled={saving}
            >
              Hủy
            </Button>
          )}
          <Button
            onClick={onSaveDeliveryInfo}
            disabled={saving || !deliveryInfo.recipient_name || !deliveryInfo.address || !deliveryInfo.phone}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu địa chỉ
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
