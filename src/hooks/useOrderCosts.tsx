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

  // --- NEW: Itemized cost breakdown ---
  const getPrintCostBreakdown = useCallback(() => {
    // Debug: Log productLines at start
    console.log("DEBUG [getPrintCostBreakdown] productLines:", productLines);

    let costItems: {
      label: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[] = [];

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
    if (decalBackLineCount > 0) {
      costItems.push({
        label: "Decal mặt lưng",
        quantity: decalBackLineCount,
        unitPrice: decalBackLineCount > 2 ? 20000 : decalBackLineCount === 2 ? 15000 : 10000,
        total: decalBackPrice,
      });
    }

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
      costItems.push({
        label: "Chuyển nhiệt mặt lưng",
        quantity: 1,
        unitPrice: 10000,
        total: 10000
      });
    }

    // 3. Số ngực (decal & chuyển nhiệt): mỗi 5k/1 vị trí (không cộng dồn decal & chuyển nhiệt trên cùng vị trí)
    // 4. Số quần (decal & chuyển nhiệt): mỗi 5k/1 vị trí (tương tự)
    // Sử dụng Set để tránh cộng dồn khi có cả decal và chuyển nhiệt cùng vị trí
    const chestNumberPositions = new Set<string>();
    const pantsNumberPositions = new Set<string>();

    productLines.forEach(line => {
      // Số ngực
      if (line.position.toLowerCase().includes("số ngực")) {
        chestNumberPositions.add(line.position.toLowerCase());
      }
      // Số quần
      if (line.position.toLowerCase().includes("số quần")) {
        pantsNumberPositions.add(line.position.toLowerCase());
      }
    });

    if (chestNumberPositions.size > 0) {
      costItems.push({
        label: "Số ngực",
        quantity: chestNumberPositions.size,
        unitPrice: 5000,
        total: chestNumberPositions.size * 5000
      });
    }
    if (pantsNumberPositions.size > 0) {
      costItems.push({
        label: "Số quần",
        quantity: pantsNumberPositions.size,
        unitPrice: 5000,
        total: pantsNumberPositions.size * 5000
      });
    }

    // 5. Các loại logo ở mọi vị trí: 10k/vị trí/lần xuất hiện
    const logoLines = productLines.filter(line =>
      line.position.toLowerCase().includes("logo")
    );
    if (logoLines.length > 0) {
      // Group by unique logo position string and count
      const logoCountMap: Record<string, number> = {};
      logoLines.forEach(line => {
        const pos = line.position;
        logoCountMap[pos] = (logoCountMap[pos] || 0) + 1;
      });
      Object.entries(logoCountMap).forEach(([pos, count]) => {
        costItems.push({
          label: `${pos}`,
          quantity: count,
          unitPrice: 10000,
          total: count * 10000
        });
      });
    }

    // Debug: log costItems result
    console.log("DEBUG [getPrintCostBreakdown] costItems:", costItems);

    return costItems;
  }, [productLines]);

  const calculateTotalCost = useCallback(() => {
    if (!players.length) {
      console.log("DEBUG [calculateTotalCost] players empty, returning 0");
      return 0;
    }

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

    const totalCost = printingCost;
    // Debug: log calculation result
    console.log("DEBUG [calculateTotalCost] productLines:", productLines);
    console.log("DEBUG [calculateTotalCost] totalCost:", totalCost);
    return totalCost;
  }, [players, productLines]);

  const getPlayerAndGoalkeeperCounts = useCallback(() => {
    const playerCount = players.filter(p => (p as any).uniform_type !== 'goalkeeper').length;
    const goalkeeperCount = players.filter(p => (p as any).uniform_type === 'goalkeeper').length;
    return { playerCount, goalkeeperCount };
  }, [players]);

  return {
    calculateTotalCost,
    getPlayerAndGoalkeeperCounts,
    getPrintCostBreakdown
  };
};
