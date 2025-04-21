import { useCallback } from 'react';
import { Player, ProductLine } from '@/types';

export const useOrderCosts = (players: Player[], productLines: ProductLine[]) => {
  /**
   * Helper to count number of print lines (for decal logic).
   */
  const countBackLines = () => {
    const backLinePositions = [
      "In trên số lưng",
      "In số lưng",
      "In dưới số lưng",
      "mặt lưng",
    ];
    return productLines.filter(line =>
      backLinePositions.some(pos => line.position.includes(pos))
    ).length;
  };

  const calculateTotalCost = useCallback(() => {
    if (!players.length) return 0;

    // Uniforms cost is NO LONGER COUNTED
    // let totalCost = 0;
    // const basePlayerUniformPrice = 120000;
    // const baseGoalkeeperUniformPrice = 150000;

    // const playerCount = players.filter(p => (p as any).uniform_type !== 'goalkeeper').length;
    // const goalkeeperCount = players.filter(p => (p as any).uniform_type === 'goalkeeper').length;

    // const uniformsCost = (playerCount * basePlayerUniformPrice) +
    //   (goalkeeperCount * baseGoalkeeperUniformPrice);

    // Print cost calculation
    let printingCost = 0;

    // 1. Decal mặt lưng: tính theo số dòng (1 dòng 10k, 2 dòng 15k, 3 dòng 20k)
    const decalBackLines = productLines.filter(
      line =>
        (line.material.toLowerCase().includes("decal")) &&
        (
          line.position.includes("In trên số lưng") ||
          line.position.includes("In số lưng") ||
          line.position.includes("In dưới số lưng") ||
          line.position.toLowerCase().includes("mặt lưng")
        )
    );

    let decalBackLineCount = decalBackLines.length;
    let decalBackPrice = 0;
    if (decalBackLineCount === 1) {
      decalBackPrice = 10000;
    } else if (decalBackLineCount === 2) {
      decalBackPrice = 15000;
    } else if (decalBackLineCount >= 3) {
      decalBackPrice = 20000;
    }
    printingCost += decalBackPrice;

    // 2. Chuyển nhiệt mặt lưng: luôn 10k nếu có bất kỳ dòng nào
    const htBackLineExists = productLines.some(
      line =>
        (line.material.toLowerCase().includes("chuyển nhiệt")) &&
        (
          line.position.includes("In trên số lưng") ||
          line.position.includes("In số lưng") ||
          line.position.includes("In dưới số lưng") ||
          line.position.toLowerCase().includes("mặt lưng")
        )
    );
    if (htBackLineExists) {
      printingCost += 10000;
    }

    // 3. Số ngực (decal & chuyển nhiệt): mỗi 5k/1 vị trí (không cộng dồn decal & chuyển nhiệt trên cùng vị trí)
    // 4. Số quần (decal & chuyển nhiệt): mỗi 5k/1 vị trí (tương tự)
    // Sử dụng Set để tránh cộng dồn khi có cả decal và chuyển nhiệt cùng vị trí
    const chestNumberPositions = new Set<string>();
    const pantsNumberPositions = new Set<string>();

    productLines.forEach(line => {
      // Số ngực
      if (line.position.toLowerCase().includes("số ngực")) {
        // Đánh dấu đã có số ngực cho vị trí này
        chestNumberPositions.add(line.position.toLowerCase());
      }
      // Số quần
      if (line.position.toLowerCase().includes("số quần")) {
        pantsNumberPositions.add(line.position.toLowerCase());
      }
    });

    printingCost += chestNumberPositions.size * 5000;
    printingCost += pantsNumberPositions.size * 5000;

    // 5. Các loại logo ở mọi vị trí: 10k/vị trí/lần xuất hiện
    productLines.forEach(line => {
      if (line.position.toLowerCase().includes("logo")) {
        printingCost += 10000;
      }
    });

    // Uniforms cost REMOVED, only printingCost is the final cost
    const totalCost = printingCost;
    return totalCost;
  }, [players, productLines]);

  const getPlayerAndGoalkeeperCounts = useCallback(() => {
    const playerCount = players.filter(p => (p as any).uniform_type !== 'goalkeeper').length;
    const goalkeeperCount = players.filter(p => (p as any).uniform_type === 'goalkeeper').length;
    return { playerCount, goalkeeperCount };
  }, [players]);

  return {
    calculateTotalCost,
    getPlayerAndGoalkeeperCounts
  };
};
