
import { Player } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerCardProps {
  player: Player;
  onEdit: () => void;
  onRemove: () => void;
}

export function PlayerCard({ player, onEdit, onRemove }: PlayerCardProps) {
  const extPlayer = player as any;
  
  return (
    <Card className="relative">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold">{player.number}</span>
            <div>
              <p className="font-medium">{extPlayer.line_1 || "-"}</p>
              <p className="text-sm text-muted-foreground">{player.size} • {player.uniform_type === 'goalkeeper' ? 'Thủ môn' : 'Cầu thủ'}</p>
            </div>
          </div>
          
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          {(extPlayer.chest_number || extPlayer.pants_number) && (
            <div className="col-span-2">
              <p className="font-medium mb-1">In số</p>
              <div className="flex flex-wrap gap-2">
                {extPlayer.chest_number && <span className="bg-muted px-2 py-1 rounded text-xs">Số ngực</span>}
                {extPlayer.pants_number && <span className="bg-muted px-2 py-1 rounded text-xs">Số quần</span>}
              </div>
            </div>
          )}
          
          {(extPlayer.logo_chest_left || extPlayer.logo_chest_right || extPlayer.logo_chest_center || 
            extPlayer.logo_sleeve_left || extPlayer.logo_sleeve_right || extPlayer.logo_pants) && (
            <div className="col-span-2">
              <p className="font-medium mb-1">Logo</p>
              <div className="flex flex-wrap gap-2">
                {extPlayer.logo_chest_left && <span className="bg-muted px-2 py-1 rounded text-xs">Ngực trái</span>}
                {extPlayer.logo_chest_right && <span className="bg-muted px-2 py-1 rounded text-xs">Ngực phải</span>}
                {extPlayer.logo_chest_center && <span className="bg-muted px-2 py-1 rounded text-xs">Ngực giữa</span>}
                {extPlayer.logo_sleeve_left && <span className="bg-muted px-2 py-1 rounded text-xs">Tay trái</span>}
                {extPlayer.logo_sleeve_right && <span className="bg-muted px-2 py-1 rounded text-xs">Tay phải</span>}
                {extPlayer.logo_pants && <span className="bg-muted px-2 py-1 rounded text-xs">Quần</span>}
              </div>
            </div>
          )}
          
          {extPlayer.note && (
            <div className="col-span-2">
              <p className="font-medium mb-1">Ghi chú</p>
              <p className="text-muted-foreground text-xs">{extPlayer.note}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
