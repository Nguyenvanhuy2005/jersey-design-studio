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

    // Determine the materials used on back print lines
    const hasDecalBack = productLines.some(
      line =>
        line.material.toLowerCase().includes("decal") &&
        (
          line.position.includes("In trên số lưng") ||
          line.position.includes("In số lưng") ||
          line.position.includes("In dưới số lưng") ||
          line.position.toLowerCase().includes("mặt lưng")
        )
    );
    const hasHTBack = productLines.some(
      line =>
        line.material.toLowerCase().includes("chuyển nhiệt") &&
        (
          line.position.includes("In trên số lưng") ||
          line.position.includes("In số lưng") ||
          line.position.includes("In dưới số lưng") ||
          line.position.toLowerCase().includes("mặt lưng")
        )
    );

    // 1. Decal mặt lưng (LINE BACK)
    const decalBackLines = productLines.filter(
      line =>
        line.material.toLowerCase().includes("decal") &&
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

    // 2. Chuyển nhiệt mặt lưng
    // Only show if any heat transfer lines are present
    if (hasHTBack) {
      costItems.push({
        label: "Chuyển nhiệt mặt lưng",
        quantity: 1,
        unitPrice: 10000,
        total: 10000
      });
    }

    // 3. Số ngực & Số quần - chia rõ decal vs chuyển nhiệt
    let chestNumberDecal = 0, chestNumberHT = 0, pantsNumberDecal = 0, pantsNumberHT = 0;

    productLines.forEach(line => {
      if (line.position.toLowerCase().includes("số ngực")) {
        if (line.material.toLowerCase().includes("decal")) chestNumberDecal++;
        if (line.material.toLowerCase().includes("chuyển nhiệt")) chestNumberHT++;
      }
      if (line.position.toLowerCase().includes("số quần")) {
        if (line.material.toLowerCase().includes("decal")) pantsNumberDecal++;
        if (line.material.toLowerCase().includes("chuyển nhiệt")) pantsNumberHT++;
      }
    });

    if (chestNumberDecal > 0) {
      costItems.push({
        label: "Số ngực (in decal)",
        quantity: chestNumberDecal,
        unitPrice: 5000,
        total: chestNumberDecal * 5000
      });
    }
    if (chestNumberHT > 0) {
      costItems.push({
        label: "Số ngực (chuyển nhiệt)",
        quantity: chestNumberHT,
        unitPrice: 5000,
        total: chestNumberHT * 5000
      });
    }
    if (pantsNumberDecal > 0) {
      costItems.push({
        label: "Số quần (in decal)",
        quantity: pantsNumberDecal,
        unitPrice: 5000,
        total: pantsNumberDecal * 5000
      });
    }
    if (pantsNumberHT > 0) {
      costItems.push({
        label: "Số quần (chuyển nhiệt)",
        quantity: pantsNumberHT,
        unitPrice: 5000,
        total: pantsNumberHT * 5000
      });
    }

    // 4. Logo ở mọi vị trí: 10k/vị trí/lần xuất hiện (gộp cùng material decal hoặc chuyển nhiệt)
    const logoDecalLines: Record<string, number> = {};
    const logoHTLines: Record<string, number> = {};
    productLines.forEach(line => {
      if (line.position.toLowerCase().includes("logo")) {
        if (line.material.toLowerCase().includes("decal")) {
          logoDecalLines[line.position] = (logoDecalLines[line.position] || 0) + 1;
        }
        if (line.material.toLowerCase().includes("chuyển nhiệt")) {
          logoHTLines[line.position] = (logoHTLines[line.position] || 0) + 1;
        }
      }
    });
    Object.entries(logoDecalLines).forEach(([pos, count]) => {
      costItems.push({
        label: `${pos} (in decal)`,
        quantity: count,
        unitPrice: 10000,
        total: count * 10000
      });
    });
    Object.entries(logoHTLines).forEach(([pos, count]) => {
      costItems.push({
        label: `${pos} (chuyển nhiệt)`,
        quantity: count,
        unitPrice: 10000,
        total: count * 10000
      });
    });

    // Debug: log costItems result for validation
    console.log("DEBUG [getPrintCostBreakdown] costItems (with decal):", costItems);

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
        line.material.toLowerCase().includes("decal") &&
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
    // Only add if there are chuyển nhiệt back lines
    const hasHTBack = productLines.some(
      line =>
        line.material.toLowerCase().includes("chuyển nhiệt") &&
        (
          line.position.includes("In trên số lưng") ||
          line.position.includes("In số lưng") ||
          line.position.includes("In dưới số lưng") ||
          line.position.toLowerCase().includes("mặt lưng")
        )
    );
    if (hasHTBack) {
      printingCost += 10000;
    }

    // 3. Số ngực & số quần (decal & chuyển nhiệt): mỗi 5k/1 vị trí
    let chestNumberDecal = 0, chestNumberHT = 0, pantsNumberDecal = 0, pantsNumberHT = 0;
    productLines.forEach(line => {
      if (line.position.toLowerCase().includes("số ngực")) {
        if (line.material.toLowerCase().includes("decal")) chestNumberDecal++;
        if (line.material.toLowerCase().includes("chuyển nhiệt")) chestNumberHT++;
      }
      if (line.position.toLowerCase().includes("số quần")) {
        if (line.material.toLowerCase().includes("decal")) pantsNumberDecal++;
        if (line.material.toLowerCase().includes("chuyển nhiệt")) pantsNumberHT++;
      }
    });
    printingCost += chestNumberDecal * 5000;
    printingCost += chestNumberHT * 5000;
    printingCost += pantsNumberDecal * 5000;
    printingCost += pantsNumberHT * 5000;

    // 4. Logo positions 10k/vị trí/lần xuất hiện (chia theo vật liệu)
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
