
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CanvasJersey } from "@/components/ui/canvas-jersey";
import { Player, Logo, PrintConfig, DesignData } from "@/types";

interface JerseyPreviewProps {
  players: Player[];
  logos: Logo[];
  printConfig: PrintConfig;
  teamName: string;
  designData: DesignData;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onPrevTab: () => void;
  onNextTab: () => void;
}

export function JerseyPreview({
  players,
  logos,
  printConfig,
  teamName,
  designData,
  canvasRef,
  onPrevTab,
  onNextTab
}: JerseyPreviewProps) {
  const [previewPlayer, setPreviewPlayer] = useState<number>(0);
  const [previewView, setPreviewView] = useState<'front' | 'back'>('front');
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <div className="bg-muted/30 p-4 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-medium">
              Xem trước thiết kế áo
            </div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant={previewView === 'front' ? 'default' : 'outline'}
                onClick={() => setPreviewView('front')}
              >
                Mặt trước
              </Button>
              <Button 
                size="sm" 
                variant={previewView === 'back' ? 'default' : 'outline'}
                onClick={() => setPreviewView('back')}
              >
                Mặt sau
              </Button>
            </div>
          </div>
          
          <div className="aspect-[3/4] relative bg-white rounded-md overflow-hidden">
            <CanvasJersey
              ref={canvasRef}
              player={players[previewPlayer] || { name: 'Tên cầu thủ', number: 10, size: 'M', printImage: true }}
              printConfig={printConfig}
              logos={logos}
              viewMode={previewView}
              teamName={teamName || "Tên đội"}
              designData={designData}
            />
          </div>
        </div>
      </div>
      
      <div>
        <div className="bg-muted/30 p-4 rounded-md space-y-4">
          <div className="text-lg font-medium">
            Chọn cầu thủ để xem
          </div>
          
          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
            {players.length > 0 ? (
              players.map((player, index) => (
                <button
                  key={index}
                  className={`w-full text-left p-3 rounded-md border ${
                    previewPlayer === index ? 'border-primary bg-primary/10' : 'border-muted-foreground/20'
                  }`}
                  onClick={() => setPreviewPlayer(index)}
                >
                  <div className="font-medium">{player.name}</div>
                  <div className="text-sm text-muted-foreground">
                    #{player.number} - Size: {player.size}
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có cầu thủ nào được thêm
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          <Button variant="outline" onClick={onPrevTab}>
            Trở lại: Logo
          </Button>
          <Button onClick={onNextTab}>
            Tiếp theo: Tổng kết
          </Button>
        </div>
      </div>
    </div>
  );
}
