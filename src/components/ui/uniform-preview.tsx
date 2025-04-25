
import { useState } from "react";
import { CanvasJersey } from "@/components/ui/canvas-jersey";
import { Card } from "@/components/ui/card";
import { Logo, PrintConfig, DesignData, Player } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { PlayerSelector } from "@/components/ui/PlayerSelector";

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
  pantCanvasRef,
  className
}: UniformPreviewProps) {
  const [selectedPlayerIdx, setSelectedPlayerIdx] = useState(0);
  const currentPlayer = player || (players.length > 0 ? players[selectedPlayerIdx] : undefined);
  const isGoalkeeper = currentPlayer?.uniform_type === "goalkeeper";

  // Build effective design data with text positions
  const effectiveDesignData: Partial<DesignData> = {
    uniform_type: isGoalkeeper ? 'goalkeeper' : 'player',
    font_text: {
      font: designData?.font_text?.font || printConfig?.font || 'Arial'
    },
    font_number: {
      font: designData?.font_number?.font || printConfig?.font || 'Arial'
    },
    // Map text positions from current player
    upper_text: currentPlayer?.upper_text_enabled ? {
      enabled: true,
      content: currentPlayer.upper_text || '',
      material: printConfig?.frontMaterial || 'In chuyển nhiệt'
    } : {
      enabled: false,
      content: '', // Add empty content for disabled text to satisfy TypeScript
      material: printConfig?.frontMaterial || 'In chuyển nhiệt'
    },
    chest_number: currentPlayer?.chest_number ? {
      enabled: true,
      material: printConfig?.frontMaterial || 'In chuyển nhiệt'
    } : { enabled: false },
    lower_text: currentPlayer?.lower_text_enabled ? {
      enabled: true,
      content: currentPlayer.lower_text || '',
      material: printConfig?.frontMaterial || 'In chuyển nhiệt'
    } : {
      enabled: false,
      content: '', // Add empty content for disabled text to satisfy TypeScript
      material: printConfig?.frontMaterial || 'In chuyển nhiệt'
    },
    ...designData
  };

  // Debug logging
  console.log('UniformPreview - Current player:', currentPlayer);
  console.log('UniformPreview - Effective design data:', effectiveDesignData);

  return (
    <Card className={className}>
      <PlayerSelector
        players={players}
        selectedIdx={selectedPlayerIdx}
        onSelect={setSelectedPlayerIdx}
      />
      <Tabs defaultValue="front" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="front">Mặt trước</TabsTrigger>
          <TabsTrigger value="back">Mặt sau</TabsTrigger>
          <TabsTrigger value="pants">Quần</TabsTrigger>
        </TabsList>
        <TabsContent value="front" className="focus:outline-none">
          <CanvasJersey
            teamName={teamName}
            playerName={currentPlayer?.name}
            playerNumber={currentPlayer?.number}
            uniformType={currentPlayer?.uniform_type}
            logos={logos}
            view="front"
            printConfig={printConfig}
            designData={effectiveDesignData}
            canvasRef={jerseyCanvasRef}
          />
        </TabsContent>
        <TabsContent value="back" className="focus:outline-none">
          <CanvasJersey
            teamName={teamName}
            playerName={currentPlayer?.name}
            playerNumber={currentPlayer?.number}
            uniformType={currentPlayer?.uniform_type}
            logos={logos}
            view="back"
            printConfig={printConfig}
            designData={effectiveDesignData}
            canvasRef={jerseyCanvasRef}
          />
        </TabsContent>
        <TabsContent value="pants" className="focus:outline-none">
          <CanvasJersey
            teamName={teamName}
            playerNumber={currentPlayer?.number}
            uniformType={currentPlayer?.uniform_type}
            logos={logos}
            view="pants"
            printConfig={printConfig}
            designData={effectiveDesignData}
            canvasRef={pantCanvasRef}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
