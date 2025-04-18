import { useState, useEffect } from "react";
import { CanvasJersey } from "@/components/ui/canvas-jersey";
import { Card } from "@/components/ui/card";
import { Logo, PrintConfig, DesignData } from "@/types";
import { Player } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeView, setActiveView] = useState<"front" | "back" | "pants">("front");
  
  // Use first player from array if no specific player is provided
  const currentPlayer = player || (players.length > 0 ? players[0] : undefined);
  
  // Create default design data if not provided
  const getDefaultDesignData = (): Partial<DesignData> => {
    if (designData && Object.keys(designData).length > 0) {
      return designData;
    }
    
    if (!currentPlayer) {
      return {
        uniform_type: "player",
        logo_chest_left: { enabled: false },
        logo_chest_right: { enabled: false },
        logo_chest_center: { enabled: false },
        logo_sleeve_left: { enabled: false },
        logo_sleeve_right: { enabled: false },
        logo_pants: { enabled: false },
        chest_number: { enabled: false, color: "Đen" },
        pants_number: { enabled: false, color: "Đen" },
        font_text: { font: "Arial" },
        font_number: { font: "Arial" }
      };
    }
    
    return {
      uniform_type: currentPlayer.uniform_type || "player",
      logo_chest_left: { 
        enabled: currentPlayer.logo_chest_left || false 
      },
      logo_chest_right: { 
        enabled: currentPlayer.logo_chest_right || false 
      },
      logo_chest_center: { 
        enabled: currentPlayer.logo_chest_center || false 
      },
      logo_sleeve_left: { 
        enabled: currentPlayer.logo_sleeve_left || false 
      },
      logo_sleeve_right: { 
        enabled: currentPlayer.logo_sleeve_right || false 
      },
      logo_pants: { 
        enabled: currentPlayer.logo_pants || false 
      },
      chest_number: { 
        enabled: currentPlayer.chest_number || false,
        color: "Đen"
      },
      pants_number: { 
        enabled: currentPlayer.pants_number || false,
        color: "Đen"
      },
      line_1: { 
        enabled: !!currentPlayer.line_1,
        content: currentPlayer.line_1 || "",
        color: "Đen"
      },
      line_3: { 
        enabled: !!currentPlayer.line_3,
        content: currentPlayer.line_3 || "",
        color: "Đen"
      },
      font_text: { 
        font: "Arial" 
      },
      font_number: { 
        font: "Arial" 
      }
    };
  };
  
  const effectiveDesignData: Partial<DesignData> = {
    chest_number: { 
      enabled: currentPlayer?.chest_number || false,
      material: printConfig?.backMaterial
    },
    pants_number: { 
      enabled: currentPlayer?.pants_number || false,
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
      <Tabs defaultValue="front" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="front" onClick={() => setActiveView("front")}>
            Mặt trước
          </TabsTrigger>
          <TabsTrigger value="back" onClick={() => setActiveView("back")}>
            Mặt sau
          </TabsTrigger>
          <TabsTrigger value="pants" onClick={() => setActiveView("pants")}>
            Quần
          </TabsTrigger>
        </TabsList>
        <TabsContent value="front" className="focus:outline-none">
          <CanvasJersey
            teamName={teamName}
            playerName={currentPlayer?.name}
            playerNumber={currentPlayer?.number}
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
