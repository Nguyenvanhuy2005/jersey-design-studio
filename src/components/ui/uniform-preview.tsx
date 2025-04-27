
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
  // Add selector state for current previewed player (allow viewing demo of any player/goalkeeper)
  const [selectedPlayerIdx, setSelectedPlayerIdx] = useState(0);

  // Use index selector if multiple players, fallback to the only player or undefined
  const currentPlayer = player ||
    (players.length > 0 ? players[selectedPlayerIdx] : undefined);
  
  // Determine if the current player is a goalkeeper
  const isGoalkeeper = currentPlayer?.uniform_type === "goalkeeper";

  // Construct effective design data (logic unchanged, always preference player lines)
  const effectiveDesignData: Partial<DesignData> = {
    uniform_type: isGoalkeeper ? 'goalkeeper' : 'player',
    chest_number: {
      enabled: currentPlayer?.chest_number || false,
      material: printConfig?.backMaterial
    },
    pants_number: {
      enabled: currentPlayer?.pants_number || false,
      material: printConfig?.legMaterial
    },
    chest_text: currentPlayer?.chest_text ? {
      enabled: true, // Add the required 'enabled' property
      content: currentPlayer.chest_text,
      material: printConfig?.frontMaterial
    } : undefined,
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
    ...designData,
    // Ensure font_number follows config or designData
    font_number: {
      font: designData?.font_number?.font || printConfig?.font || 'Arial'
    }
  };

  return (
    <Card className={className}>
      {/* Redesigned player/goalkeeper selector */}
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
