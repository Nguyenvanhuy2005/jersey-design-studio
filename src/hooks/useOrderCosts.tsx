
import { useCallback } from 'react';
import { Player, ProductLine } from '@/types';

export const useOrderCosts = (players: Player[], productLines: ProductLine[]) => {

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

    // --- MẶT LƯNG: Tách từng dòng, xác định chi phí decal, chuyển nhiệt ---
    const decalBackPositions = [
      { key: "In trên số lưng", label: "Dòng trên số lưng" },
      { key: "In số lưng", label: "Số lưng" },
      { key: "In dưới số lưng", label: "Dòng dưới số lưng" }
    ];

    let backDecalCount = 0;
    let lineCountMap: { [label: string]: number } = {};

    productLines.forEach(line => {
      // Xét các dòng mặt lưng có chất liệu "In decal"
      const isDecal = line.material === "In decal";
      const found = decalBackPositions.find(pos => line.position.includes(pos.key));
      if (isDecal && found) {
        lineCountMap[found.label] = (lineCountMap[found.label] || 0) + 1;
        backDecalCount++;
      }
    });

    // Gán giá tổng cho 3 dòng decal mặt lưng
    if (backDecalCount > 0) {
      let decalBackPrice = 0;
      if (backDecalCount === 1)      decalBackPrice = 10000;
      else if (backDecalCount === 2) decalBackPrice = 15000;
      else if (backDecalCount >= 3)  decalBackPrice = 20000;

      // Nếu có 3 dòng, chia đều, làm tròn 1k, gom phần dư vào mục cuối
      let runningTotal = 0, idx = 0, keys = Object.keys(lineCountMap);
      keys.forEach((label, i) => {
        let qty = lineCountMap[label];
        let price = Math.floor((decalBackPrice * qty) / backDecalCount / 1000) * 1000;
        if (i === keys.length - 1) price = decalBackPrice - runningTotal; // gom dư vào cuối cùng
        runningTotal += price;
        costItems.push({
          label: `Decal mặt lưng (${label})`,
          quantity: qty,
          unitPrice: price / qty,
          total: price
        });
      });
    }

    // --- Chuyển nhiệt mặt lưng ---
    let backHTCount = 0;
    decalBackPositions.forEach(pos => {
      productLines.forEach(line => {
        if (line.material === "In chuyển nhiệt" && line.position.includes(pos.key)) {
          backHTCount++;
        }
      });
    });
    if (backHTCount > 0) {
      costItems.push({
        label: "Chuyển nhiệt mặt lưng",
        quantity: backHTCount,
        unitPrice: 10000,
        total: 10000,
      });
    }

    // --- SỐ NGỰC & SỐ QUẦN: chia rõ decal & chuyển nhiệt, mỗi vị trí 5k ---
    let chestNumberDecal = 0, chestNumberHT = 0;
    let pantsNumberDecal = 0, pantsNumberHT = 0;

    productLines.forEach(line => {
      // IN SỐ NGỰC
      if (line.position.toLowerCase().includes("số ngực")) {
        if (line.material === "In decal") chestNumberDecal++;
        if (line.material === "In chuyển nhiệt") chestNumberHT++;
      }
      // IN SỐ QUẦN
      if (line.position.toLowerCase().includes("số quần")) {
        if (line.material === "In decal") pantsNumberDecal++;
        if (line.material === "In chuyển nhiệt") pantsNumberHT++;
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

    // --- Logo các vị trí (10k/vị trí/lần xuất hiện/kiểu in), tách decal/chuyển nhiệt ---
    const logoDecalLines: Record<string, number> = {};
    const logoHTLines: Record<string, number> = {};
    productLines.forEach(line => {
      if (line.position.toLowerCase().includes("logo")) {
        if (line.material === "In decal") {
          logoDecalLines[line.position] = (logoDecalLines[line.position] || 0) + 1;
        }
        if (line.material === "In chuyển nhiệt") {
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

    // Tính decal mặt lưng (giống như breakdown)
    const decalBackPositions = [
      "In trên số lưng", "In số lưng", "In dưới số lưng"
    ];
    let decalBackCount = 0;
    productLines.forEach(line => {
      if (line.material === "In decal" && decalBackPositions.some(pos => line.position.includes(pos))) {
        decalBackCount++;
      }
    });
    if (decalBackCount === 1) printingCost += 10000;
    else if (decalBackCount === 2) printingCost += 15000;
    else if (decalBackCount >= 3) printingCost += 20000;

    // Chuyển nhiệt mặt lưng (giống breakdown): tổng 10k nếu có bất kỳ dòng nào
    let backHTCount = 0;
    productLines.forEach(line => {
      if (line.material === "In chuyển nhiệt" && decalBackPositions.some(pos => line.position.includes(pos))) {
        backHTCount++;
      }
    });
    if (backHTCount > 0) printingCost += 10000;

    // Số ngực & số quần (5k/vị trí, tách decal/chuyển nhiệt)
    let chestNumberDecal = 0, chestNumberHT = 0, pantsNumberDecal = 0, pantsNumberHT = 0;
    productLines.forEach(line => {
      if (line.position.toLowerCase().includes("số ngực")) {
        if (line.material === "In decal") chestNumberDecal++;
        if (line.material === "In chuyển nhiệt") chestNumberHT++;
      }
      if (line.position.toLowerCase().includes("số quần")) {
        if (line.material === "In decal") pantsNumberDecal++;
        if (line.material === "In chuyển nhiệt") pantsNumberHT++;
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
