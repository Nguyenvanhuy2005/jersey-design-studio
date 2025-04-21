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

    // Track all positions with decal
    const decalPositions = new Map<string, number>();
    const htPositions = new Map<string, number>();

    // --- MẶT LƯNG: Tách riêng decal và chuyển nhiệt ---
    const backPositions = [
      { key: "In trên số lưng", label: "Dòng trên số lưng" },
      { key: "In số lưng", label: "Số lưng" },
      { key: "In dưới số lưng", label: "Dòng dưới số lưng" }
    ];

    // Mapping riêng giá từng vị trí decal mặt lưng
    const backDecalPrices: Record<string, number> = {
      "Dòng trên số lưng": 5000,
      "Số lưng": 10000,
      "Dòng dưới số lưng": 5000
    };

    // Đếm riêng cho decal và chuyển nhiệt cho lưng
    let backDecalCount = 0;
    let backHTCount = 0;
    let decalBackMap: { [label: string]: number } = {};
    let htBackMap: { [label: string]: number } = {};

    productLines.forEach(line => {
      const foundPos = backPositions.find(pos => line.position.includes(pos.key));
      
      if (foundPos) {
        if (line.material === "In decal") {
          backDecalCount++;
          decalBackMap[foundPos.label] = (decalBackMap[foundPos.label] || 0) + 1;
        } else if (line.material === "In chuyển nhiệt") {
          backHTCount++;
          htBackMap[foundPos.label] = (htBackMap[foundPos.label] || 0) + 1;
        }
      }

      // Track all positions
      if (line.material === "In decal") {
        decalPositions.set(line.position, (decalPositions.get(line.position) || 0) + 1);
      } else if (line.material === "In chuyển nhiệt") {
        htPositions.set(line.position, (htPositions.get(line.position) || 0) + 1);
      }
    });

    // Tính và hiển thị giá cho decal mặt lưng theo từng dòng
    Object.keys(decalBackMap).forEach(label => {
      const qty = decalBackMap[label];
      const price = backDecalPrices[label] ?? 0;
      if (qty > 0) {
        costItems.push({
          label: `Decal mặt lưng (${label})`,
          quantity: qty,
          unitPrice: price,
          total: qty * price
        });
      }
    });

    // Tính và hiển thị giá cho chuyển nhiệt mặt lưng (giữ nguyên)
    if (backHTCount > 0) {
      costItems.push({
        label: "Chuyển nhiệt mặt lưng",
        quantity: backHTCount,
        unitPrice: 10000,
        total: 10000,
      });
    }

    // --- SỐ NGỰC & SỐ QUẦN: phân biệt giữa decal và chuyển nhiệt ---
    // In số ngực
    const chestNumber = {
      decal: decalPositions.get("In số ngực") || 0,
      heatTransfer: htPositions.get("In số ngực") || 0
    };
    
    if (chestNumber.decal > 0) {
      costItems.push({
        label: "Số ngực (in decal)",
        quantity: chestNumber.decal,
        unitPrice: 5000,
        total: chestNumber.decal * 5000,
      });
    }
    
    if (chestNumber.heatTransfer > 0) {
      costItems.push({
        label: "Số ngực (chuyển nhiệt)",
        quantity: chestNumber.heatTransfer,
        unitPrice: 5000,
        total: chestNumber.heatTransfer * 5000,
      });
    }

    // In số quần
    const pantsNumber = {
      decal: decalPositions.get("In số quần") || 0,
      heatTransfer: htPositions.get("In số quần") || 0
    };
    
    if (pantsNumber.decal > 0) {
      costItems.push({
        label: "Số quần (in decal)",
        quantity: pantsNumber.decal,
        unitPrice: 5000,
        total: pantsNumber.decal * 5000,
      });
    }
    
    if (pantsNumber.heatTransfer > 0) {
      costItems.push({
        label: "Số quần (chuyển nhiệt)",
        quantity: pantsNumber.heatTransfer,
        unitPrice: 5000,
        total: pantsNumber.heatTransfer * 5000,
      });
    }

    // --- Logo các vị trí: phân biệt giữa decal và chuyển nhiệt ---
    const logoPositions = [
      "Logo ngực trái", "Logo ngực phải", "Logo ngực giữa",
      "Logo tay trái", "Logo tay phải", "Logo quần"
    ];
    
    logoPositions.forEach(position => {
      const decalCount = decalPositions.get(position) || 0;
      const htCount = htPositions.get(position) || 0;
      
      if (decalCount > 0) {
        costItems.push({
          label: `${position} (in decal)`,
          quantity: decalCount,
          unitPrice: 10000,
          total: decalCount * 10000,
        });
      }
      
      if (htCount > 0) {
        costItems.push({
          label: `${position} (chuyển nhiệt)`,
          quantity: htCount,
          unitPrice: 10000,
          total: htCount * 10000,
        });
      }
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

    // 1. Đếm riêng decal cho từng vị trí mặt lưng
    const backPositions = [
      { key: "In trên số lưng", label: "Dòng trên số lưng", price: 5000 },
      { key: "In số lưng", label: "Số lưng", price: 10000 },
      { key: "In dưới số lưng", label: "Dòng dưới số lưng", price: 5000 }
    ];

    let backDecalLines: { [label: string]: number } = {};
    let backHTLines = 0;

    productLines.forEach(line => {
      const foundPos = backPositions.find(pos => line.position.includes(pos.key));
      if (foundPos && line.material === "In decal") {
        backDecalLines[foundPos.label] = (backDecalLines[foundPos.label] || 0) + 1;
      } else if (foundPos && line.material === "In chuyển nhiệt") {
        backHTLines++;
      }
    });

    // Cộng chi phí decal từng dòng lưng
    backPositions.forEach(pos => {
      if (backDecalLines[pos.label]) {
        printingCost += backDecalLines[pos.label] * pos.price;
      }
    });

    // Chuyển nhiệt mặt lưng (mỗi dòng chỉ cộng 1 lần giá 10k như cũ)
    if (backHTLines > 0) printingCost += 10000;

    // 2. Tính giá cho số ngực và số quần (5k/vị trí, riêng decal/chuyển nhiệt)
    productLines.forEach(line => {
      if ((line.position.toLowerCase().includes("số ngực") || 
           line.position.toLowerCase().includes("số quần"))) {
        printingCost += 5000;
      }
    });

    // 3. Tính giá cho logo (10k/vị trí)
    productLines.forEach(line => {
      if (line.position.toLowerCase().includes("logo")) {
        printingCost += 10000;
      }
    });

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
