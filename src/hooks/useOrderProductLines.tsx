
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
    
    // Process each player individually to create separate product lines
    players.forEach((player, playerIndex) => {
      const extPlayer = player as any;
      const playerPrintStyle = extPlayer.print_style || printStyle;
      
      console.log(`[generateProductLines] Processing player ${playerIndex} (${player.name}) with style: ${playerPrintStyle}`);
      
      // Back text lines - each player creates individual product lines
      if (extPlayer.line_1) {
        newProductLines.push({
          id: `line1-player-${playerIndex}-${Date.now()}`,
          product: "Áo cầu thủ",
          position: "In trên số lưng",
          material: playerPrintStyle,
          size: "Trung bình",
          points: 1,
          content: "Tên trên số lưng"
        });
      }
      
      // Only create back number product line if explicitly selected
      if (extPlayer.back_number) {
        newProductLines.push({
          id: `line2-player-${playerIndex}-${Date.now()}`,
          product: "Áo cầu thủ",
          position: "In số lưng",
          material: playerPrintStyle,
          size: "Lớn",
          points: 1,
          content: "Số áo"
        });
      }
      
      if (extPlayer.line_3) {
        newProductLines.push({
          id: `line3-player-${playerIndex}-${Date.now()}`,
          product: "Áo cầu thủ",
          position: "In dưới số lưng",
          material: playerPrintStyle,
          size: "Trung bình",
          points: 1,
          content: "Tên dưới số lưng"
        });
      }
      
      // Chest text
      if (extPlayer.chest_text) {
        newProductLines.push({
          id: `chest-text-player-${playerIndex}-${Date.now()}`,
          product: "Áo cầu thủ",
          position: "In chữ ngực",
          material: playerPrintStyle,
          size: "Trung bình",
          points: 1,
          content: "Chữ ngực"
        });
      }
      
      // Chest number
      if (extPlayer.chest_number) {
        newProductLines.push({
          id: `chest-number-player-${playerIndex}-${Date.now()}`,
          product: "Áo cầu thủ",
          position: "In số ngực",
          material: playerPrintStyle,
          size: "Trung bình",
          points: 1,
          content: "Số ngực"
        });
      }
      
      // Pants number
      if (extPlayer.pants_number) {
        newProductLines.push({
          id: `pants-number-player-${playerIndex}-${Date.now()}`,
          product: "Quần",
          position: "In số quần",
          material: playerPrintStyle,
          size: "Trung bình",
          points: 1,
          content: "Số quần"
        });
      }
      
      // Logo positions - each player creates individual product lines for each logo position
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
          const isJersey = pos.position !== 'Logo quần';
          const productType = isJersey ? "Áo cầu thủ" : "Quần";
          
          newProductLines.push({
            id: `${pos.key}-player-${playerIndex}-${Date.now()}`,
            product: productType,
            position: pos.position,
            material: playerPrintStyle,
            size: "Trung bình",
            points: 1,
            content: pos.position
          });
        }
      });
    });
    
    console.log("[generateProductLines] Generated productLines:", newProductLines);
    console.log("[generateProductLines] Total product lines created:", newProductLines.length);
    
    setProductLines(newProductLines);
    toast.success(`Đã tạo danh sách sản phẩm in từ cấu hình ${players.length} cầu thủ với ${newProductLines.length} dòng sản phẩm`);
    
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
