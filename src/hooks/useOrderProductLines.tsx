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
    
    const uniqueConfigs = new Set<string>();
    
    players.forEach(player => {
      const extPlayer = player as any;
      
      if (extPlayer.line_1) {
        uniqueConfigs.add("line_1");
      }
      
      uniqueConfigs.add("line_2");
      
      if (extPlayer.line_3) {
        uniqueConfigs.add("line_3");
      }
      
      if (extPlayer.chest_number) {
        uniqueConfigs.add("chest_number");
      }
      
      if (extPlayer.pants_number) {
        uniqueConfigs.add("pants_number");
      }
      
      if (extPlayer.logo_chest_left) uniqueConfigs.add("logo_chest_left");
      if (extPlayer.logo_chest_right) uniqueConfigs.add("logo_chest_right");
      if (extPlayer.logo_chest_center) uniqueConfigs.add("logo_chest_center");
      if (extPlayer.logo_sleeve_left) uniqueConfigs.add("logo_sleeve_left");
      if (extPlayer.logo_sleeve_right) uniqueConfigs.add("logo_sleeve_right");
      if (extPlayer.logo_pants) uniqueConfigs.add("logo_pants");
    });
    
    if (uniqueConfigs.has("line_1")) {
      newProductLines.push({
        id: `product-line-1-${Date.now()}`,
        product: "Áo cầu thủ",
        position: "In trên số lưng",
        material: printStyle,
        size: "Trung bình",
        points: 1,
        content: "Tên trên số lưng"
      });
    }
    
    if (uniqueConfigs.has("line_2")) {
      newProductLines.push({
        id: `product-line-2-${Date.now()}`,
        product: "Áo cầu thủ",
        position: "In số lưng",
        material: printStyle,
        size: "Lớn",
        points: 1,
        content: "Số áo"
      });
    }
    
    if (uniqueConfigs.has("line_3")) {
      newProductLines.push({
        id: `product-line-3-${Date.now()}`,
        product: "Áo cầu thủ",
        position: "In dưới số lưng",
        material: printStyle,
        size: "Trung bình",
        points: 1,
        content: "Tên dưới số lưng"
      });
    }
    
    if (uniqueConfigs.has("chest_number")) {
      newProductLines.push({
        id: `product-chest-number-${Date.now()}`,
        product: "Áo cầu thủ",
        position: "In số ngực",
        material: printStyle,
        size: "Nhỏ",
        points: 1,
        content: "Số ngực"
      });
    }
    
    if (uniqueConfigs.has("pants_number")) {
      newProductLines.push({
        id: `product-pants-number-${Date.now()}`,
        product: "Quần",
        position: "In số quần",
        material: printStyle,
        size: "Nhỏ",
        points: 1,
        content: "Số quần"
      });
    }
    
    const logoPositions = [
      { key: 'logo_chest_left', label: 'Logo ngực trái' },
      { key: 'logo_chest_right', label: 'Logo ngực phải' },
      { key: 'logo_chest_center', label: 'Logo ngực giữa' },
      { key: 'logo_sleeve_left', label: 'Logo tay trái' },
      { key: 'logo_sleeve_right', label: 'Logo tay phải' },
      { key: 'logo_pants', label: 'Logo quần' }
    ];
    
    logoPositions.forEach(position => {
      if (uniqueConfigs.has(position.key)) {
        const logo = logos.find(l => l.position === position.key.replace('logo_', '') as any);
        
        newProductLines.push({
          id: `product-${position.key}-${Date.now()}`,
          product: position.key.includes('pants') ? "Quần" : "Áo cầu thủ",
          position: position.label,
          material: printStyle,
          size: "Trung bình",
          points: 1,
          content: logo ? `Logo: ${logo.file.name.split('/').pop()?.split('.')[0]}` : position.label
        });
      }
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
