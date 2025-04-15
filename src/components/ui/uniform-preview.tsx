import { useState, useEffect } from "react";
import { CanvasJersey } from "@/components/ui/canvas-jersey";
import { Card } from "@/components/ui/card";
import { Logo, PrintConfig, DesignData } from "@/types";
import { Player } from "@/types";
import { Tab, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UniformPreviewProps {
  teamName: string;
  player?: Player;
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
  logos = [],
  printConfig,
  designData,
  jerseyCanvasRef,
  pantCanvasRef,
  className
}: UniformPreviewProps) {
  const [activeView, setActiveView] = useState<"front" | "back" | "pants">("front");
  
  // Create default design data if not provided
  const getDefaultDesignData = (): Partial<DesignData> => {
    if (designData && Object.keys(designData).length > 0) {
      return designData;
    }
    
    if (!player) {
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
        chest_text: { enabled: false, content: "", color: "Đen" },
        font_text: { font: "Arial" },
        font_number: { font: "Arial" }
      };
    }
    
    return {
      uniform_type: player.uniform_type || "player",
      logo_chest_left: { 
        enabled: player.logo_chest_left || false 
      },
      logo_chest_right: { 
        enabled: player.logo_chest_right || false 
      },
      logo_chest_center: { 
        enabled: player.logo_chest_center || false 
      },
      logo_sleeve_left: { 
        enabled: player.logo_sleeve_left || false 
      },
      logo_sleeve_right: { 
        enabled: player.logo_sleeve_right || false 
      },
      logo_pants: { 
        enabled: player.logo_pants || false 
      },
      chest_number: { 
        enabled: player.chest_number || false,
        color: "Đen"
      },
      pants_number: { 
        enabled: player.pants_number || false,
        color: "Đen"
      },
      chest_text: { 
        enabled: !!player.chest_text,
        content: player.chest_text || "",
        color: "Đen"
      },
      line_1: { 
        enabled: !!player.line_1,
        content: player.line_1 || "",
        color: "Đen"
      },
      line_3: { 
        enabled: !!player.line_3,
        content: player.line_3 || "",
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
  
  const effectiveDesignData = getDefaultDesignData();

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
            playerName={player?.name}
            playerNumber={player?.number}
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
            playerName={player?.name}
            playerNumber={player?.number}
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
            playerNumber={player?.number}
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
