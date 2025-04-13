
import { Player, Logo, PrintConfig, ProductLine, DesignData } from "@/types";

export const useProductLineGenerator = () => {
  const generateProductLines = (
    players: Player[],
    logos: Logo[],
    printConfig: PrintConfig,
    designData: DesignData
  ): ProductLine[] => {
    if (players.length === 0) return [];

    const hasPlayersWithImages = players.some(p => p.printImage);
    
    let newProductLines: ProductLine[] = [];
    
    if (designData.line_2?.enabled) {
      newProductLines.push({
        id: `product-back-number-${Date.now()}`,
        product: "Áo thi đấu",
        position: "In số lưng",
        material: designData.line_2.material || printConfig.backMaterial,
        size: "Lớn",
        points: 1,
        content: "Số áo"
      });
    }
    
    if (designData.line_1?.enabled && designData.line_1.content) {
      newProductLines.push({
        id: `product-above-back-${Date.now() + 1}`,
        product: "Áo thi đấu",
        position: "In trên số lưng",
        material: designData.line_1.material || printConfig.backMaterial,
        size: "Trung bình",
        points: 1,
        content: designData.line_1.content
      });
    }
    
    if (designData.line_3?.enabled && designData.line_3.content) {
      newProductLines.push({
        id: `product-below-back-${Date.now() + 2}`,
        product: "Áo thi đấu",
        position: "In dưới số lưng",
        material: designData.line_3.material || printConfig.backMaterial,
        size: "Nhỏ",
        points: 1,
        content: designData.line_3.content
      });
    }
    
    if (designData.chest_number?.enabled && hasPlayersWithImages) {
      newProductLines.push({
        id: `product-chest-number-${Date.now() + 3}`,
        product: "Áo thi đấu",
        position: "In số giữa bụng",
        material: designData.chest_number.material || printConfig.frontMaterial,
        size: "Trung bình",
        points: 1,
        content: "Số áo"
      });
    }
    
    if (designData.chest_text?.enabled && designData.chest_text.content) {
      newProductLines.push({
        id: `product-chest-text-${Date.now() + 4}`,
        product: "Áo thi đấu",
        position: "In chữ ngực",
        material: designData.chest_text.material || printConfig.frontMaterial,
        size: "Nhỏ",
        points: 1,
        content: designData.chest_text.content
      });
    }
    
    if (designData.pants_number?.enabled) {
      newProductLines.push({
        id: `product-pants-number-${Date.now() + 5}`,
        product: "Quần thi đấu",
        position: "In số quần",
        material: designData.pants_number.material || printConfig.legMaterial,
        size: "Nhỏ",
        points: 1,
        content: "Số áo"
      });
    }
    
    if (designData.pet_chest?.enabled && designData.pet_chest.content) {
      newProductLines.push({
        id: `product-pet-chest-${Date.now() + 6}`,
        product: "Áo thi đấu",
        position: "In PET ngực",
        material: designData.pet_chest.material || "In chuyển nhiệt",
        size: "Trung bình",
        points: 1,
        content: designData.pet_chest.content
      });
    }
    
    logos.forEach((logo, index) => {
      let position = '';
      
      switch (logo.position) {
        case 'chest_left':
          position = 'In logo ngực trái';
          break;
        case 'chest_right':
          position = 'In logo ngực phải';
          break;
        case 'chest_center':
          position = 'In logo giữa bụng';
          break;
        case 'sleeve_left':
          position = 'In logo tay trái';
          break;
        case 'sleeve_right':
          position = 'In logo tay phải';
          break;
        case 'pants':
          position = 'In logo quần';
          break;
        default:
          position = 'In logo ngực trái';
      }
      
      const logoName = logo.file.name.split('/').pop()?.split('.')[0] || `Logo ${index + 1}`;
      
      newProductLines.push({
        id: `product-logo-${Date.now() + 7 + index}`,
        product: logo.position === 'pants' ? "Quần thi đấu" : "Áo thi đấu",
        position,
        material: printConfig.frontMaterial,
        size: "Trung bình",
        points: 1,
        content: logoName
      });
    });
    
    return newProductLines;
  };

  const calculateTotalCost = (productLines: ProductLine[], playersCount: number, logosCount: number): number => {
    let totalCost = 0;
    
    productLines.forEach(line => {
      let unitCost = 10000;
      
      if (line.position.includes("logo")) {
        unitCost = 20000;
      }
      
      totalCost += unitCost * playersCount;
    });

    totalCost += logosCount * 20000;
    
    return totalCost;
  };

  return {
    generateProductLines,
    calculateTotalCost
  };
};
