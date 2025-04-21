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

  // --- Update: Itemized cost breakdown for decal ---
  const getPrintCostBreakdown = useCallback(() => {
    // Debug: Log productLines at start
    console.log("DEBUG [getPrintCostBreakdown] productLines:", productLines);

    let costItems: {
      label: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[] = [];

    // 1. Decal mặt lưng: phân tách theo từng dòng (line_1, line_2, line_3)
    const decalBackPositions = [
      { key: "In trên số lưng", label: "Dòng trên số lưng" },
      { key: "In số lưng", label: "Số lưng" },
      { key: "In dưới số lưng", label: "Dòng dưới số lưng" },
      { key: "mặt lưng", label: "Mặt lưng khác" } // fallback
    ];

    // Tìm các productLine decal và chia nhỏ theo từng position
    const decalBackLineCounts: { [key: string]: number } = {};
    let totalDecalBackCount = 0;
    productLines.forEach(line => {
      if (
        line.material.toLowerCase().includes("decal") &&
        decalBackPositions.some(pos => line.position.includes(pos.key) || line.position.toLowerCase().includes(pos.key))
      ) {
        const found = decalBackPositions.find(pos => line.position.includes(pos.key) || line.position.toLowerCase().includes(pos.key));
        const label = found?.label || "Mặt lưng khác";
        decalBackLineCounts[label] = (decalBackLineCounts[label] || 0) + 1;
        totalDecalBackCount++;
      }
    });

    // Tính giá decal back theo quy định
    let decalBackPrice = 0;
    if (totalDecalBackCount === 1)      decalBackPrice = 10000;
    else if (totalDecalBackCount === 2) decalBackPrice = 15000;
    else if (totalDecalBackCount >= 3)  decalBackPrice = 20000;

    // Gộp từng mục line_1, line_2, line_3 vào breakdown nếu là decal
    let runningPriceDecal = 0, runningIdx = 0;
    Object.entries(decalBackLineCounts).forEach(([label, qty], _idx, arr) => {
      let itemPrice: number;
      if (arr.length === 1) itemPrice = decalBackPrice;
      else if (arr.length === 2) itemPrice = decalBackPrice * qty / totalDecalBackCount;
      else if (arr.length === 3) {
        // Ba dòng: chia đều giá, nhưng nếu số lượng dòng ko đều vẫn chia proportional
        itemPrice = Math.round((decalBackPrice * qty) / totalDecalBackCount / 1000) * 1000;
        runningIdx++;
        // Gom phần dư vào mục cuối (để tổng luôn đúng)
        if (runningIdx === arr.length) itemPrice = decalBackPrice - runningPriceDecal;
        runningPriceDecal += itemPrice;
      } else itemPrice = 0;

      costItems.push({
        label: `Decal mặt lưng (${label})`,
        quantity: qty,
        unitPrice: itemPrice / qty,
        total: itemPrice,
      });
    });

    // 2. Chuyển nhiệt mặt lưng (nếu có)
    const htBackLines = productLines.filter(
      line =>
        line.material.toLowerCase().includes("chuyển nhiệt") &&
        (decalBackPositions.some(pos => line.position.includes(pos.key) || line.position.toLowerCase().includes(pos.key)))
    );
    if (htBackLines.length > 0) {
      costItems.push({
        label: `Chuyển nhiệt mặt lưng`,
        quantity: htBackLines.length,
        unitPrice: 10000,
        total: 10000
      });
    }

    // 3. Số ngực & số quần - decal và chuyển nhiệt giá bằng nhau, tách rõ hai loại
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
    if (chestNumberDecal > 0)
      costItems.push({
        label: "Số ngực (in decal)",
        quantity: chestNumberDecal,
        unitPrice: 5000,
        total: chestNumberDecal * 5000,
      });
    if (chestNumberHT > 0)
      costItems.push({
        label: "Số ngực (chuyển nhiệt)",
        quantity: chestNumberHT,
        unitPrice: 5000,
        total: chestNumberHT * 5000,
      });
    if (pantsNumberDecal > 0)
      costItems.push({
        label: "Số quần (in decal)",
        quantity: pantsNumberDecal,
        unitPrice: 5000,
        total: pantsNumberDecal * 5000,
      });
    if (pantsNumberHT > 0)
      costItems.push({
        label: "Số quần (chuyển nhiệt)",
        quantity: pantsNumberHT,
        unitPrice: 5000,
        total: pantsNumberHT * 5000,
      });

    // 4. Logo ở mọi vị trí: chia 10k/1 vị trí/kiểu in
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
        total: count * 10000,
      });
    });
    Object.entries(logoHTLines).forEach(([pos, count]) => {
      costItems.push({
        label: `${pos} (chuyển nhiệt)`,
        quantity: count,
        unitPrice: 10000,
        total: count * 10000,
      });
    });

    // Debug
    console.log("DEBUG [getPrintCostBreakdown] costItems (final):", costItems);

    return costItems;
  }, [productLines]);

  // --- Update: Tổng chi phí ---
  const calculateTotalCost = useCallback(() => {
    if (!players.length) {
      console.log("DEBUG [calculateTotalCost] players empty, returning 0");
      return 0;
    }

    let printingCost = 0;

    // Tính decal mặt lưng (sử dụng lại logic ở breakdown)
    const decalBackPositions = [
      "In trên số lưng", "In số lưng", "In dưới số lưng", "mặt lưng"
    ];
    const decalBackLines = productLines.filter(
      line =>
        line.material.toLowerCase().includes("decal") &&
        decalBackPositions.some(pos => line.position.includes(pos) || line.position.toLowerCase().includes(pos))
    );
    const totalDecalBackCount = decalBackLines.length;
    if (totalDecalBackCount === 1) printingCost += 10000;
    else if (totalDecalBackCount === 2) printingCost += 15000;
    else if (totalDecalBackCount >= 3) printingCost += 20000;

    // Chuyển nhiệt mặt lưng: +10k nếu có bất kỳ dòng nào
    const htBackLines = productLines.filter(
      line =>
        line.material.toLowerCase().includes("chuyển nhiệt") &&
        decalBackPositions.some(pos => line.position.includes(pos) || line.position.toLowerCase().includes(pos))
    );
    if (htBackLines.length > 0) printingCost += 10000;

    // Số ngực & số quần (mỗi vị trí đều là 5k, mỗi loại - cả decal và chuyển nhiệt)
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

    // Logo các vị trí (10k/vị trí/lần xuất hiện/kiểu in)
    productLines.forEach(line => {
      if (line.position.toLowerCase().includes("logo")) {
        printingCost += 10000;
      }
    });

    // Debug
    console.log("DEBUG [calculateTotalCost] printingCost:", printingCost);

    return printingCost;
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
