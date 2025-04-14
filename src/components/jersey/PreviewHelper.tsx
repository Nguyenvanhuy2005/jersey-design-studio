
import { useEffect, useRef } from 'react';
import { CanvasJersey } from "@/components/ui/canvas-jersey"; 
import { Player, Logo, PrintConfig, DesignData } from "@/types";

interface JerseyPreviewHelperProps {
  view: 'front' | 'back' | 'pants';
  player: Player;
  logos: Logo[];
  printConfig: PrintConfig;
  designData: Partial<DesignData>;
  onRender: (imageUrl: string) => void;
}

export function JerseyPreviewHelper({
  view,
  player,
  logos,
  printConfig,
  designData,
  onRender
}: JerseyPreviewHelperProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const playerLine1 = player?.line_1 || player?.name || "";
  const playerNumber = player?.number?.toString() || ""; 
  const playerLine3 = player?.line_3 || "";
  
  // When the component mounts, capture the image
  useEffect(() => {
    // Give canvas time to render
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const imageUrl = canvas.toDataURL('image/png');
        onRender(imageUrl);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [view, player, logos, onRender]);

  return (
    <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
      <CanvasJersey
        teamName={playerLine3}
        playerName={playerLine1}
        playerNumber={playerNumber}
        logos={view === 'pants' ? logos.filter(logo => logo.position === 'pants') : logos}
        view={view}
        printConfig={printConfig}
        designData={{
          ...designData,
          line_1: { content: playerLine1, enabled: true },
          line_2: { content: playerNumber, enabled: true },
          line_3: { content: playerLine3, enabled: true },
          pants_number: { 
            enabled: designData?.pants_number?.enabled ?? false
          }
        }}
        canvasRef={canvasRef}
      />
    </div>
  );
}
