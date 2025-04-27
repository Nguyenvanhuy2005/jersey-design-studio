import { useCallback } from 'react';
import { Player, ProductLine } from '@/types';

export const useOrderCosts = (players: Player[], productLines: ProductLine[]) => {
  // --- Itemized cost breakdown for decal and logo ---
  const getPrintCostBreakdown = useCallback(() => {
    console.log("DEBUG [getPrintCostBreakdown] productLines:", productLines);

    let costItems: {
      label: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[] = [];

    // Track all positions with decal or chuyển nhiệt
    const decalPositions = new Map<string, number>();
    const htPositions = new Map<string, number>();
    const logoPositionsAggregate = new Map<string, number>();

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

    // Set để theo dõi player nào đã được tính chuyển nhiệt mặt lưng
    const playersWithHeatTransferBack = new Set<string>();

    productLines.forEach(line => {
      const foundPos = backPositions.find(pos => line.position.includes(pos.key));

      if (foundPos) {
        if (line.material === "In decal") {
          backDecalCount++;
          decalBackMap[foundPos.label] = (decalBackMap[foundPos.label] || 0) + 1;
        } else if (line.material === "In chuyển nhiệt") {
          backHTCount++;
        }
      }

      // Track all positions for decal/chuyển nhiệt
      if (line.material === "In decal") {
        decalPositions.set(line.position, (decalPositions.get(line.position) || 0) + 1);
      } else if (line.material === "In chuyển nhiệt") {
        htPositions.set(line.position, (htPositions.get(line.position) || 0) + 1);
      }

      // For logo positions: always aggregate, regardless of decal/chuyển nhiệt
      const allLogoLabels = [
        "Logo ngực trái", "Logo ngực phải", "Logo ngực giữa",
        "Logo tay trái", "Logo tay phải", "Logo quần"
      ];
      if (allLogoLabels.includes(line.position)) {
        logoPositionsAggregate.set(line.position, (logoPositionsAggregate.get(line.position) || 0) + 1);
      }
    });

    // 1. Decal mặt lưng breakdown
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

    // 2. Chuyển nhiệt mặt lưng - tính theo số cầu thủ sử dụng
    const htBackPlayers = new Set();
    
    players.forEach((player, index) => {
      const extPlayer = player as any;
      const playerPrintStyle = extPlayer.print_style || "In decal";
      
      if (playerPrintStyle === "In chuyển nhiệt") {
        if (extPlayer.line_1 || extPlayer.line_2 || extPlayer.number || extPlayer.line_3) {
          htBackPlayers.add(index);
        }
      }
    });
    
    const htBackPlayersCount = htBackPlayers.size;
    
    if (htBackPlayersCount > 0) {
      costItems.push({
        label: "Chuyển nhiệt mặt lưng",
        quantity: htBackPlayersCount,
        unitPrice: 10000,
        total: htBackPlayersCount * 10000,
      });
    }

    // Add chest text cost calculation
    const chestTextDecalCount = players.filter(p => p.chest_text && (p.print_style === "In decal" || !p.print_style)).length;
    const chestTextHTCount = players.filter(p => p.chest_text && p.print_style === "In chuyển nhiệt").length;

    if (chestTextDecalCount > 0) {
      costItems.push({
        label: "Chữ ngực (in decal)",
        quantity: chestTextDecalCount,
        unitPrice: 5000,
        total: chestTextDecalCount * 5000
      });
    }

    if (chestTextHTCount > 0) {
      costItems.push({
        label: "Chữ ngực (chuyển nhiệt)",
        quantity: chestTextHTCount,
        unitPrice: 5000,
        total: chestTextHTCount * 5000
      });
    }

    // 3. CHỮ NGỰC: phân biệt giữa decal và chuyển nhiệt (5k/vị trí)
    const chestText = {
      decal: decalPositions.get("In chữ ngực") || 0,
      heatTransfer: htPositions.get("In chữ ngực") || 0
    };

    if (chestText.decal > 0) {
      costItems.push({
        label: "Chữ ngực (in decal)",
        quantity: chestText.decal,
        unitPrice: 5000,
        total: chestText.decal * 5000,
      });
    }

    if (chestText.heatTransfer > 0) {
      costItems.push({
        label: "Chữ ngực (chuyển nhiệt)",
        quantity: chestText.heatTransfer,
        unitPrice: 5000,
        total: chestText.heatTransfer * 5000,
      });
    }

    // 4. SỐ NGỰC: phân biệt giữa decal và chuyển nhiệt (5k/vị trí)
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

    // 5. SỐ QUẦN: phân biệt giữa decal và chuyển nhiệt (5k/vị trí)
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

    // 6. Logo các vị trí: gộp chung, không phân biệt chất liệu
    const logoPositions = [
      "Logo ngực trái", "Logo ngực phải", "Logo ngực giữa",
      "Logo tay trái", "Logo tay phải", "Logo quần"
    ];

    logoPositions.forEach(position => {
      const totalCount = logoPositionsAggregate.get(position) || 0;
      if (totalCount > 0) {
        costItems.push({
          label: position,
          quantity: totalCount,
          unitPrice: 10000,
          total: totalCount * 10000,
        });
      }
    });

    console.log("DEBUG [getPrintCostBreakdown] costItems (final):", costItems);
    return costItems;
  }, [players, productLines]);

  // --- Tổng chi phí ---
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
    const htBackPlayers = new Set();

    // Phân tích kiểu in và các dòng in cho từng cầu thủ
    players.forEach((player, index) => {
      const extPlayer = player as any;
      const playerPrintStyle = extPlayer.print_style || "In decal";
      
      // Xử lý in mặt lưng
      backPositions.forEach(pos => {
        const positionKey = pos.key.replace("In ", "").toLowerCase();
        const hasThisPosition = 
          (positionKey === "trên số lưng" && extPlayer.line_1) ||
          (positionKey === "số lưng" && (extPlayer.line_2 || extPlayer.number)) ||
          (positionKey === "dưới số lưng" && extPlayer.line_3);
          
        if (hasThisPosition) {
          if (playerPrintStyle === "In decal") {
            backDecalLines[pos.label] = (backDecalLines[pos.label] || 0) + 1;
          } else if (playerPrintStyle === "In chuyển nhiệt") {
            htBackPlayers.add(index);
          }
        }
      });
    });

    // Cộng chi phí decal từng dòng lưng
    backPositions.forEach(pos => {
      if (backDecalLines[pos.label]) {
        printingCost += backDecalLines[pos.label] * pos.price;
      }
    });

    // Chuyển nhiệt mặt lưng: tính theo số cầu thủ sử dụng chuyển nhiệt
    const htBackPlayersCount = htBackPlayers.size;
    if (htBackPlayersCount > 0) {
      printingCost += htBackPlayersCount * 10000;
    }

    // Add chest text cost calculation (5k per player)
    players.forEach(player => {
      if (player.chest_text) {
        printingCost += 5000;
      }
    });

    // 2. Số ngực, số quần và chữ ngực (5k/vị trí, riêng decal/chuyển nhiệt)
    productLines.forEach(line => {
      if ((line.position.toLowerCase().includes("số ngực") ||
           line.position.toLowerCase().includes("số quần") ||
           line.position.toLowerCase().includes("chữ ngực"))) {
        printingCost += 5000;
      }
    });

    // 3. Logo — KHÔNG phân biệt chuyển nhiệt hoặc decal (mỗi logo 10k mỗi vị trí)
    const logoLabels = [
      "Logo ngực trái", "Logo ngực phải", "Logo ngực giữa",
      "Logo tay trái", "Logo tay phải", "Logo quần"
    ];
    productLines.forEach(line => {
      if (logoLabels.includes(line.position)) {
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
