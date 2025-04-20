
import { CanvasJersey } from "@/components/ui/canvas-jersey";
import { Card } from "@/components/ui/card";
import { Logo, PrintConfig, DesignData } from "@/types";
import { Player } from "@/types";

interface UniformPreviewProps {
  teamName: string;
  player?: Player;
  players?: Player[];
  logos?: Logo[];
  printConfig?: PrintConfig;
  designData?: Partial<DesignData>;
  jerseyCanvasRef?: React.RefObject<HTMLCanvasElement>;
  pantCanvasRef?: React.RefObject<HTMLCanvasElement>;
  className?: string;
}

export function UniformPreview({
  teamName,
  player,
  players = [],
  logos = [],
  printConfig,
  designData,
  jerseyCanvasRef,
  className
}: UniformPreviewProps) {
  const currentPlayer = player || (players.length > 0 ? players[0] : undefined);
  
  const effectiveDesignData: Partial<DesignData> = {
    chest_number: { 
      enabled: currentPlayer?.chest_number ?? true, // Enable by default
      material: printConfig?.backMaterial
    },
    pants_number: { 
      enabled: currentPlayer?.pants_number ?? false,
      material: printConfig?.legMaterial
    },
    line_1: currentPlayer?.line_1 ? {
      enabled: true,
      content: currentPlayer.line_1,
      material: printConfig?.backMaterial
    } : undefined,
    line_3: currentPlayer?.line_3 ? {
      enabled: true,
      content: currentPlayer.line_3,
      material: printConfig?.backMaterial
    } : undefined,
    ...designData
  };

  return (
    <Card className={className}>
      <div className="pt-6 px-2">
        <CanvasJersey
          teamName={teamName}
          playerName={currentPlayer?.name}
          playerNumber={currentPlayer?.number}
          logos={logos}
          printConfig={printConfig}
          designData={effectiveDesignData}
          canvasRef={jerseyCanvasRef}
        />
      </div>
    </Card>
  );
}
