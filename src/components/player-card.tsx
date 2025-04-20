
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
    <Card className="relative hover:shadow-md transition-shadow">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">{player.number}</span>
            </div>
            <div>
              <p className="font-medium text-base">{extPlayer.line_1 || "-"}</p>
              <p className="text-sm text-muted-foreground">
                {player.size} • {player.uniform_type === 'goalkeeper' ? 'Thủ môn' : 'Cầu thủ'}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid gap-2 text-sm">
          {(extPlayer.chest_number || extPlayer.pants_number) && (
            <div>
              <p className="font-medium mb-1 text-xs uppercase text-muted-foreground">In số</p>
              <div className="flex flex-wrap gap-1">
                {extPlayer.chest_number && (
                  <span className="bg-muted px-2 py-0.5 rounded-full text-xs">Số ngực</span>
                )}
                {extPlayer.pants_number && (
                  <span className="bg-muted px-2 py-0.5 rounded-full text-xs">Số quần</span>
                )}
              </div>
            </div>
          )}
          
          {(extPlayer.logo_chest_left || extPlayer.logo_chest_right || extPlayer.logo_chest_center || 
            extPlayer.logo_sleeve_left || extPlayer.logo_sleeve_right || extPlayer.logo_pants) && (
            <div>
              <p className="font-medium mb-1 text-xs uppercase text-muted-foreground">Logo</p>
              <div className="flex flex-wrap gap-1">
                {extPlayer.logo_chest_left && (
                  <span className="bg-muted px-2 py-0.5 rounded-full text-xs">Ngực trái</span>
                )}
                {extPlayer.logo_chest_right && (
                  <span className="bg-muted px-2 py-0.5 rounded-full text-xs">Ngực phải</span>
                )}
                {extPlayer.logo_chest_center && (
                  <span className="bg-muted px-2 py-0.5 rounded-full text-xs">Ngực giữa</span>
                )}
                {extPlayer.logo_sleeve_left && (
                  <span className="bg-muted px-2 py-0.5 rounded-full text-xs">Tay trái</span>
                )}
                {extPlayer.logo_sleeve_right && (
                  <span className="bg-muted px-2 py-0.5 rounded-full text-xs">Tay phải</span>
                )}
                {extPlayer.logo_pants && (
                  <span className="bg-muted px-2 py-0.5 rounded-full text-xs">Quần</span>
                )}
              </div>
            </div>
          )}
          
          {extPlayer.note && (
            <div>
              <p className="font-medium mb-1 text-xs uppercase text-muted-foreground">Ghi chú</p>
              <p className="text-muted-foreground text-xs">{extPlayer.note}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
