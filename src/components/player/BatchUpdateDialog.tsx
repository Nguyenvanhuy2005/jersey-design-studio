
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Player } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BatchUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  printStyleOptions: string[];
  printStyle: string;
}

export function BatchUpdateDialog({
  open,
  onOpenChange,
  players,
  onPlayersChange,
  printStyleOptions,
  printStyle
}: BatchUpdateDialogProps) {
  const [selectedOptions, setSelectedOptions] = useState({
    logo_chest_left: false,
    logo_chest_right: false,
    logo_chest_center: false,
    logo_sleeve_left: false,
    logo_sleeve_right: false,
    chest_number: false,
    pants_number: false,
    logo_pants: false,
    print_style: printStyle,
    size: "",
    uniform_type: "",
    enablePrintStyle: false,
    enableSize: false,
    enableUniformType: false
  });

  const handleApplyChanges = () => {
    const updatedPlayers = players.map(player => ({
      ...player,
      logo_chest_left: selectedOptions.logo_chest_left,
      logo_chest_right: selectedOptions.logo_chest_right,
      logo_chest_center: selectedOptions.logo_chest_center,
      logo_sleeve_left: selectedOptions.logo_sleeve_left,
      logo_sleeve_right: selectedOptions.logo_sleeve_right,
      chest_number: selectedOptions.chest_number,
      pants_number: selectedOptions.pants_number,
      logo_pants: selectedOptions.logo_pants,
      ...(selectedOptions.enablePrintStyle && { print_style: selectedOptions.print_style }),
      ...(selectedOptions.enableSize && { size: selectedOptions.size }),
      ...(selectedOptions.enableUniformType && { uniform_type: selectedOptions.uniform_type }),
    }));

    onPlayersChange(updatedPlayers);
    toast.success("Đã cập nhật thuộc tính cho tất cả cầu thủ");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật hàng loạt</DialogTitle>
          <DialogDescription>
            Chọn các thuộc tính bạn muốn cập nhật cho tất cả cầu thủ
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="print-positions">
          <TabsList className="grid grid-cols-2 mb-2">
            <TabsTrigger value="print-positions">Vị trí in</TabsTrigger>
            <TabsTrigger value="general">Chung</TabsTrigger>
          </TabsList>
          
          <TabsContent value="print-positions" className="space-y-4">
            <div>
              <Label className="mb-2 inline-block text-xs">In số</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="chest_number"
                    checked={selectedOptions.chest_number}
                    onCheckedChange={(checked) => 
                      setSelectedOptions(prev => ({ ...prev, chest_number: checked === true }))
                    }
                  />
                  <Label htmlFor="chest_number" className="text-xs">In số ngực</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="pants_number"
                    checked={selectedOptions.pants_number}
                    onCheckedChange={(checked) => 
                      setSelectedOptions(prev => ({ ...prev, pants_number: checked === true }))
                    }
                  />
                  <Label htmlFor="pants_number" className="text-xs">In số quần</Label>
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-2 inline-block text-xs">Logo áo</Label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="logo_chest_left"
                    checked={selectedOptions.logo_chest_left}
                    onCheckedChange={(checked) => 
                      setSelectedOptions(prev => ({ ...prev, logo_chest_left: checked === true }))
                    }
                  />
                  <Label htmlFor="logo_chest_left" className="text-xs">Logo ngực trái</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="logo_chest_right"
                    checked={selectedOptions.logo_chest_right}
                    onCheckedChange={(checked) => 
                      setSelectedOptions(prev => ({ ...prev, logo_chest_right: checked === true }))
                    }
                  />
                  <Label htmlFor="logo_chest_right" className="text-xs">Logo ngực phải</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="logo_chest_center"
                    checked={selectedOptions.logo_chest_center}
                    onCheckedChange={(checked) => 
                      setSelectedOptions(prev => ({ ...prev, logo_chest_center: checked === true }))
                    }
                  />
                  <Label htmlFor="logo_chest_center" className="text-xs">Logo ngực giữa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="logo_sleeve_left"
                    checked={selectedOptions.logo_sleeve_left}
                    onCheckedChange={(checked) => 
                      setSelectedOptions(prev => ({ ...prev, logo_sleeve_left: checked === true }))
                    }
                  />
                  <Label htmlFor="logo_sleeve_left" className="text-xs">Logo tay trái</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="logo_sleeve_right"
                    checked={selectedOptions.logo_sleeve_right}
                    onCheckedChange={(checked) => 
                      setSelectedOptions(prev => ({ ...prev, logo_sleeve_right: checked === true }))
                    }
                  />
                  <Label htmlFor="logo_sleeve_right" className="text-xs">Logo tay phải</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="logo_pants"
                    checked={selectedOptions.logo_pants}
                    onCheckedChange={(checked) => 
                      setSelectedOptions(prev => ({ ...prev, logo_pants: checked === true }))
                    }
                  />
                  <Label htmlFor="logo_pants" className="text-xs">Logo quần</Label>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="general" className="space-y-3">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Checkbox 
                  id="enablePrintStyle"
                  checked={selectedOptions.enablePrintStyle}
                  onCheckedChange={(checked) => 
                    setSelectedOptions(prev => ({ ...prev, enablePrintStyle: checked === true }))
                  }
                />
                <Label htmlFor="enablePrintStyle" className="text-xs">Kiểu in</Label>
              </div>
              <Select
                value={selectedOptions.print_style}
                onValueChange={(value) => setSelectedOptions(prev => ({ ...prev, print_style: value }))}
                disabled={!selectedOptions.enablePrintStyle}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Chọn kiểu in" />
                </SelectTrigger>
                <SelectContent>
                  {printStyleOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Checkbox 
                  id="enableSize"
                  checked={selectedOptions.enableSize}
                  onCheckedChange={(checked) => 
                    setSelectedOptions(prev => ({ ...prev, enableSize: checked === true }))
                  }
                />
                <Label htmlFor="enableSize" className="text-xs">Kích cỡ</Label>
              </div>
              <Select
                value={selectedOptions.size}
                onValueChange={(value) => setSelectedOptions(prev => ({ ...prev, size: value }))}
                disabled={!selectedOptions.enableSize}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Chọn kích cỡ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="S6">Trẻ em S6</SelectItem>
                  <SelectItem value="S8">Trẻ em S8</SelectItem>
                  <SelectItem value="S10">Trẻ em S10</SelectItem>
                  <SelectItem value="S12">Trẻ em S12</SelectItem>
                  <SelectItem value="S14">Trẻ em S14</SelectItem>
                  <SelectItem value="XS">XS</SelectItem>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                  <SelectItem value="2XL">2XL</SelectItem>
                  <SelectItem value="3XL">3XL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Checkbox 
                  id="enableUniformType"
                  checked={selectedOptions.enableUniformType}
                  onCheckedChange={(checked) => 
                    setSelectedOptions(prev => ({ ...prev, enableUniformType: checked === true }))
                  }
                />
                <Label htmlFor="enableUniformType" className="text-xs">Loại quần áo</Label>
              </div>
              <Select
                value={selectedOptions.uniform_type}
                onValueChange={(value) => setSelectedOptions(prev => ({ ...prev, uniform_type: value }))}
                disabled={!selectedOptions.enableUniformType}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player">Cầu thủ</SelectItem>
                  <SelectItem value="goalkeeper">Thủ môn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-7 text-xs">
            Hủy
          </Button>
          <Button onClick={handleApplyChanges} className="h-7 text-xs">
            Áp dụng cho tất cả
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
