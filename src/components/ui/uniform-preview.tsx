
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CanvasJersey } from "@/components/ui/canvas-jersey";
import { Player, Logo, PrintConfig, DesignData } from "@/types";

interface UniformPreviewProps {
  teamName: string;
  players: Player[];
  logos?: Logo[];
  printConfig: PrintConfig;
  designData?: Partial<DesignData>;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  canvasPantsRef?: React.RefObject<HTMLCanvasElement>;
}

export function UniformPreview({
  teamName,
  players,
  logos = [],
  printConfig,
  designData,
  canvasRef,
  canvasPantsRef
}: UniformPreviewProps) {
  const [previewPlayer, setPreviewPlayer] = useState<number>(0);
  const [previewView, setPreviewView] = useState<'front' | 'back'>('front');
  const [showPants, setShowPants] = useState<boolean>(false);

  // Get current player for preview
  const currentPlayer = players.length > 0 ? players[previewPlayer] : undefined;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Xem trước thiết kế</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant={previewView === 'front' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPreviewView('front')}
          >
            Mặt trước
          </Button>
          <Button 
            variant={previewView === 'back' ? 'default' : 'outline'}
            size="sm" 
            onClick={() => setPreviewView('back')}
          >
            Mặt sau
          </Button>
          <Button 
            variant={showPants ? 'default' : 'outline'}
            size="sm" 
            onClick={() => setShowPants(!showPants)}
          >
            {showPants ? "Ẩn quần" : "Xem quần"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-center gap-4">
          {/* Jersey Preview */}
          <div className={`flex-1 bg-muted/30 p-4 rounded-md ${showPants ? 'lg:w-1/2' : 'w-full'}`}>
            <div className="flex justify-center">
              <CanvasJersey 
                teamName={currentPlayer?.name?.split(' ')[0] || teamName || "TEAM"}
                playerName={currentPlayer?.name || ""}
                playerNumber={currentPlayer?.number || 0}
                logos={logos}
                view={previewView}
                printConfig={printConfig}
                designData={{
                  ...designData,
                  line_1: { content: currentPlayer?.name || "", enabled: true },
                  line_2: { content: String(currentPlayer?.number || "0"), enabled: true },
                  line_3: { content: teamName, enabled: true }
                }}
                canvasRef={canvasRef}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              {previewView === 'front' ? 'Mặt trước áo' : 'Mặt sau áo'}
            </p>
          </div>

          {/* Pants Preview (Conditionally rendered) */}
          {showPants && (
            <div className="flex-1 bg-muted/30 p-4 rounded-md lg:w-1/2">
              <div className="flex justify-center">
                <CanvasJersey 
                  teamName={currentPlayer?.name?.split(' ')[0] || teamName || "TEAM"}
                  playerName={currentPlayer?.name || ""}
                  playerNumber={currentPlayer?.number || 0}
                  logos={logos.filter(logo => logo.position === 'pants')}
                  view="pants"
                  printConfig={printConfig}
                  designData={designData}
                  canvasRef={canvasPantsRef}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Quần
              </p>
            </div>
          )}
        </div>
        
        {/* Player selection */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Chọn cầu thủ để xem trước</h3>
          
          {players.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {players.map((player, index) => (
                <Button 
                  key={player.id || index}
                  variant={previewPlayer === index ? 'default' : 'outline'}
                  onClick={() => setPreviewPlayer(index)}
                  className="h-auto py-2 justify-start"
                >
                  <div className="text-left truncate">
                    <div className="font-semibold truncate">{player.name || `Cầu thủ ${index + 1}`}</div>
                    <div className="text-sm opacity-80">#{player.number} - {player.size}</div>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground p-4 text-center bg-muted/30 rounded-md">
              Chưa có cầu thủ nào trong danh sách. Vui lòng thêm cầu thủ để xem trước.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
