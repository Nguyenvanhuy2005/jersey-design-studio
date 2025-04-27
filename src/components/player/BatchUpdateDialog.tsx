
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

interface BatchUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  printStyleOptions: string[];
  printStyle: string;
}

interface BatchUpdateOptions {
  logo_chest_left: boolean;
  logo_chest_right: boolean;
  logo_chest_center: boolean;
  logo_sleeve_left: boolean;
  logo_sleeve_right: boolean;
  chest_number: boolean;
  pants_number: boolean;
  logo_pants: boolean;
  print_style: string;
}

export function BatchUpdateDialog({
  open,
  onOpenChange,
  players,
  onPlayersChange,
  printStyleOptions,
  printStyle
}: BatchUpdateDialogProps) {
  const [selectedOptions, setSelectedOptions] = useState<BatchUpdateOptions>({
    logo_chest_left: false,
    logo_chest_right: false,
    logo_chest_center: false,
    logo_sleeve_left: false,
    logo_sleeve_right: false,
    chest_number: false,
    pants_number: false,
    logo_pants: false,
    print_style: printStyle
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
      print_style: selectedOptions.print_style
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
        <div className="space-y-4">
          <div>
            <Label className="mb-2 inline-block">Kiểu in</Label>
            <Select 
              value={selectedOptions.print_style}
              onValueChange={(value) => 
                setSelectedOptions(prev => ({ ...prev, print_style: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn kiểu in" />
              </SelectTrigger>
              <SelectContent>
                {printStyleOptions.map(style => (
                  <SelectItem key={style} value={style}>{style}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 inline-block">In số</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="chest_number"
                  checked={selectedOptions.chest_number}
                  onCheckedChange={(checked) => 
                    setSelectedOptions(prev => ({ ...prev, chest_number: checked === true }))
                  }
                />
                <Label htmlFor="chest_number">In số ngực</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="pants_number"
                  checked={selectedOptions.pants_number}
                  onCheckedChange={(checked) => 
                    setSelectedOptions(prev => ({ ...prev, pants_number: checked === true }))
                  }
                />
                <Label htmlFor="pants_number">In số quần</Label>
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-2 inline-block">Logo áo</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="logo_chest_left"
                  checked={selectedOptions.logo_chest_left}
                  onCheckedChange={(checked) => 
                    setSelectedOptions(prev => ({ ...prev, logo_chest_left: checked === true }))
                  }
                />
                <Label htmlFor="logo_chest_left">Logo ngực trái</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="logo_chest_right"
                  checked={selectedOptions.logo_chest_right}
                  onCheckedChange={(checked) => 
                    setSelectedOptions(prev => ({ ...prev, logo_chest_right: checked === true }))
                  }
                />
                <Label htmlFor="logo_chest_right">Logo ngực phải</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="logo_chest_center"
                  checked={selectedOptions.logo_chest_center}
                  onCheckedChange={(checked) => 
                    setSelectedOptions(prev => ({ ...prev, logo_chest_center: checked === true }))
                  }
                />
                <Label htmlFor="logo_chest_center">Logo ngực giữa</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="logo_sleeve_left"
                  checked={selectedOptions.logo_sleeve_left}
                  onCheckedChange={(checked) => 
                    setSelectedOptions(prev => ({ ...prev, logo_sleeve_left: checked === true }))
                  }
                />
                <Label htmlFor="logo_sleeve_left">Logo tay trái</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="logo_sleeve_right"
                  checked={selectedOptions.logo_sleeve_right}
                  onCheckedChange={(checked) => 
                    setSelectedOptions(prev => ({ ...prev, logo_sleeve_right: checked === true }))
                  }
                />
                <Label htmlFor="logo_sleeve_right">Logo tay phải</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="logo_pants"
                  checked={selectedOptions.logo_pants}
                  onCheckedChange={(checked) => 
                    setSelectedOptions(prev => ({ ...prev, logo_pants: checked === true }))
                  }
                />
                <Label htmlFor="logo_pants">Logo quần</Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleApplyChanges}>
            Áp dụng cho tất cả
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
