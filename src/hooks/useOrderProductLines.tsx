
import { useCallback } from "react";
import { Player, Logo, ProductLine, DesignData } from "@/types";
import { toast } from "sonner";

export const useOrderProductLines = (
  players,
  logos,
  printStyle,
  fontText,
  fontNumber,
  printColor,
  setDesignData,
  setProductLines
) => {
  console.log("[useOrderProductLines] players on hook mount/update:", players);
  console.log("[useOrderProductLines] logos on hook mount/update:", logos);

  const generateProductLines = useCallback(() => {
    console.log("[generateProductLines] called");
    if (players.length === 0) {
      console.log("[generateProductLines] players EMPTY !");
      toast.error("Chưa có cầu thủ nào trong danh sách. Vui lòng thêm ít nhất một cầu thủ.");
      return;
    }
    
    const newProductLines: ProductLine[] = [];
    
    // Gather unique printing configurations and their styles
    interface PrintConfig {
      position: string;
      material: string;
      count: number;
      players: number[];
    }
    
    // Track unique positions and their print styles
    const printConfigs: Record<string, PrintConfig> = {};
    
    // First pass - identify all print positions and their styles per player
    players.forEach((player, playerIndex) => {
      const extPlayer = player as any;
      const playerPrintStyle = extPlayer.print_style || printStyle;
      
      console.log(`[generateProductLines] Processing player ${playerIndex} with style: ${playerPrintStyle}`);
      
      // Check back text lines
      if (extPlayer.line_1) {
        const key = `line_1_${playerPrintStyle}`;
        if (!printConfigs[key]) {
          printConfigs[key] = {
            position: "In trên số lưng",
            material: playerPrintStyle,
            count: 0,
            players: []
          };
        }
        printConfigs[key].count++;
        printConfigs[key].players.push(playerIndex);
      }
      
      // Always have number on back
      const line2Key = `line_2_${playerPrintStyle}`;
      if (!printConfigs[line2Key]) {
        printConfigs[line2Key] = {
          position: "In số lưng",
          material: playerPrintStyle,
          count: 0,
          players: []
        };
      }
      printConfigs[line2Key].count++;
      printConfigs[line2Key].players.push(playerIndex);
      
      if (extPlayer.line_3) {
        const key = `line_3_${playerPrintStyle}`;
        if (!printConfigs[key]) {
          printConfigs[key] = {
            position: "In dưới số lưng",
            material: playerPrintStyle,
            count: 0,
            players: []
          };
        }
        printConfigs[key].count++;
        printConfigs[key].players.push(playerIndex);
      }
      
      // Chest number
      if (extPlayer.chest_number) {
        const key = `chest_number_${playerPrintStyle}`;
        if (!printConfigs[key]) {
          printConfigs[key] = {
            position: "In số ngực",
            material: playerPrintStyle,
            count: 0,
            players: []
          };
        }
        printConfigs[key].count++;
        printConfigs[key].players.push(playerIndex);
      }
      
      // Pants number
      if (extPlayer.pants_number) {
        const key = `pants_number_${playerPrintStyle}`;
        if (!printConfigs[key]) {
          printConfigs[key] = {
            position: "In số quần",
            material: playerPrintStyle,
            count: 0,
            players: []
          };
        }
        printConfigs[key].count++;
        printConfigs[key].players.push(playerIndex);
      }
      
      // Logo positions
      const logoPositions = [
        { key: 'logo_chest_left', position: 'Logo ngực trái' },
        { key: 'logo_chest_right', position: 'Logo ngực phải' },
        { key: 'logo_chest_center', position: 'Logo ngực giữa' },
        { key: 'logo_sleeve_left', position: 'Logo tay trái' },
        { key: 'logo_sleeve_right', position: 'Logo tay phải' },
        { key: 'logo_pants', position: 'Logo quần' }
      ];
      
      logoPositions.forEach(pos => {
        if (extPlayer[pos.key]) {
          const key = `${pos.key}_${playerPrintStyle}`;
          if (!printConfigs[key]) {
            printConfigs[key] = {
              position: pos.position,
              material: playerPrintStyle,
              count: 0,
              players: []
            };
          }
          printConfigs[key].count++;
          printConfigs[key].players.push(playerIndex);
        }
      });
    });
    
    console.log("[generateProductLines] Print configurations:", printConfigs);
    
    // Create product lines from the collected configurations
    Object.keys(printConfigs).forEach(key => {
      const config = printConfigs[key];
      const isJersey = !config.position.includes('quần') || config.position.includes('Logo quần');
      const productType = isJersey ? "Áo cầu thủ" : "Quần";
      
      newProductLines.push({
        id: `product-${key}-${Date.now()}`,
        product: productType,
        position: config.position,
        material: config.material,
        size: config.position.includes('số lưng') ? "Lớn" : "Trung bình",
        points: config.count,
        content: config.position.includes('Logo')
          ? config.position
          : config.position.includes('số')
            ? "Số áo"
            : config.position.includes('dưới số lưng')
              ? "Tên dưới số lưng"
              : "Tên trên số lưng"
      });
    });
    
    setProductLines(newProductLines);
    console.log("[generateProductLines] SET productLines:", newProductLines);
    toast.success("Đã tạo danh sách sản phẩm in từ cấu hình cầu thủ");
    
    updateDesignDataFromPlayers();
  }, [players, logos, printStyle, setProductLines]);

  const updateDesignDataFromPlayers = useCallback(() => {
    if (players.length === 0) return;
    
    const newDesignData: Partial<DesignData> = {
      uniform_type: 'player',
      quantity: players.length,
      font_text: {
        font: fontText
      },
      font_number: {
        font: fontNumber
      }
    };
    
    const hasGoalkeeper = players.some(p => p.uniform_type === 'goalkeeper');
    if (hasGoalkeeper) {
      newDesignData.uniform_type = 'mixed';
    }
    
    const firstPlayer = players[0];
    
    if (players.some(p => p.line_1)) {
      newDesignData.line_1 = {
        enabled: true,
        material: printStyle,
        content: firstPlayer.line_1 || ""
      };
    }
    
    if (players.some(p => p.line_2)) {
      newDesignData.line_2 = {
        enabled: true,
        material: printStyle,
        font: fontNumber
      };
    }
    
    if (players.some(p => p.line_3)) {
      newDesignData.line_3 = {
        enabled: true,
        material: printStyle,
        content: firstPlayer.line_3 || ""
      };
    }
    
    if (players.some(p => p.chest_number)) {
      newDesignData.chest_number = {
        enabled: true,
        material: printStyle
      };
    }
    
    if (players.some(p => p.pants_number)) {
      newDesignData.pants_number = {
        enabled: true,
        material: printStyle
      };
    }
    
    const logoPositions = [
      { key: 'logo_chest_left', position: 'chest_left' },
      { key: 'logo_chest_right', position: 'chest_right' },
      { key: 'logo_chest_center', position: 'chest_center' },
      { key: 'logo_sleeve_left', position: 'sleeve_left' },
      { key: 'logo_sleeve_right', position: 'sleeve_right' },
      { key: 'logo_pants', position: 'pants' }
    ];
    
    logoPositions.forEach(pos => {
      if (players.some(p => p[pos.key as keyof Player])) {
        const logo = logos.find(l => l.position === pos.position);
        
        if (newDesignData[pos.key as keyof DesignData] === undefined) {
          (newDesignData as any)[pos.key] = {
            enabled: true,
            material: printStyle,
            logo_id: logo?.id,
            x_position: 0,
            y_position: 0,
            scale: pos.key === 'logo_chest_center' ? 1.3 : 1.0
          };
        }
      }
    });
    
    setDesignData(newDesignData);
  }, [players, logos, fontText, fontNumber, printStyle, setDesignData]);

  return {
    generateProductLines,
    updateDesignDataFromPlayers
  };
};
