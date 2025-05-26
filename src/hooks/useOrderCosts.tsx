
import { useCallback } from 'react';
import { Player, ProductLine } from '@/types';

export const useOrderCosts = (players: Player[], productLines: ProductLine[]) => {
  
  const getPrintCostBreakdown = useCallback(() => {
    console.log("DEBUG [getPrintCostBreakdown] productLines:", productLines);
    console.log("DEBUG [getPrintCostBreakdown] players:", players);

    let costItems: {
      label: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[] = [];

    // Group product lines by position and material for cost calculation
    const costMap = new Map<string, { quantity: number; unitPrice: number }>();

    productLines.forEach(line => {
      console.log("DEBUG [getPrintCostBreakdown] Processing line:", line);
      
      // Create a unique key for each cost item type
      let costKey = '';
      let unitPrice = 0;
      
      // Determine cost key and unit price based on position and material
      if (line.position === "In số lưng") {
        costKey = line.material === "In decal" ? "Decal mặt lưng (Số lưng)" : "Chuyển nhiệt mặt lưng";
        unitPrice = line.material === "In decal" ? 10000 : 10000; // 10k for back number in any material
      } else if (line.position === "In trên số lưng") {
        costKey = line.material === "In decal" ? "Decal mặt lưng (Dòng trên số lưng)" : "Chuyển nhiệt mặt lưng";
        unitPrice = line.material === "In decal" ? 5000 : 10000; // 5k for decal text, included in 10k heat transfer
      } else if (line.position === "In dưới số lưng") {
        costKey = line.material === "In decal" ? "Decal mặt lưng (Dòng dưới số lưng)" : "Chuyển nhiệt mặt lưng";
        unitPrice = line.material === "In decal" ? 5000 : 10000; // 5k for decal text, included in 10k heat transfer
      } else if (line.position === "In chữ ngực") {
        costKey = line.material === "In decal" ? "Chữ ngực (in decal)" : "Chữ ngực (chuyển nhiệt)";
        unitPrice = 5000;
      } else if (line.position === "In số ngực") {
        costKey = line.material === "In decal" ? "Số ngực (in decal)" : "Số ngực (chuyển nhiệt)";
        unitPrice = 5000;
      } else if (line.position === "In số quần") {
        costKey = line.material === "In decal" ? "Số quần (in decal)" : "Số quần (chuyển nhiệt)";
        unitPrice = 5000;
      } else if (line.position.startsWith("Logo")) {
        costKey = line.position; // Keep logo position as is
        unitPrice = 10000;
      }
      
      if (costKey && unitPrice > 0) {
        console.log(`DEBUG [getPrintCostBreakdown] Adding to costKey: ${costKey}, unitPrice: ${unitPrice}`);
        
        // For heat transfer back printing, we need to group all back positions per player
        if (costKey === "Chuyển nhiệt mặt lưng") {
          // Count unique players who use heat transfer for back printing
          // This is handled separately below
          return;
        }
        
        const existing = costMap.get(costKey) || { quantity: 0, unitPrice };
        costMap.set(costKey, {
          quantity: existing.quantity + line.points,
          unitPrice
        });
      }
    });

    // Special handling for heat transfer back printing - count by players, not by individual lines
    const htBackPlayers = new Set<number>();
    players.forEach((player, index) => {
      const extPlayer = player as any;
      const playerPrintStyle = extPlayer.print_style || "In decal";
      
      if (playerPrintStyle === "In chuyển nhiệt") {
        // If player has any back printing (line_1, number, line_3), count them once
        if (extPlayer.line_1 || extPlayer.line_2 || extPlayer.number || extPlayer.line_3) {
          htBackPlayers.add(index);
        }
      }
    });
    
    if (htBackPlayers.size > 0) {
      costMap.set("Chuyển nhiệt mặt lưng", {
        quantity: htBackPlayers.size,
        unitPrice: 10000
      });
    }

    // Convert cost map to cost items array
    costMap.forEach((value, key) => {
      if (value.quantity > 0) {
        costItems.push({
          label: key,
          quantity: value.quantity,
          unitPrice: value.unitPrice,
          total: value.quantity * value.unitPrice
        });
      }
    });

    console.log("DEBUG [getPrintCostBreakdown] Final costItems:", costItems);
    return costItems;
  }, [players, productLines]);

  const calculateTotalCost = useCallback(() => {
    if (!players.length) {
      console.log("DEBUG [calculateTotalCost] players empty, returning 0");
      return 0;
    }

    const breakdown = getPrintCostBreakdown();
    const total = breakdown.reduce((sum, item) => sum + item.total, 0);
    
    console.log("DEBUG [calculateTotalCost] breakdown:", breakdown);
    console.log("DEBUG [calculateTotalCost] total cost:", total);
    
    return total;
  }, [players, getPrintCostBreakdown]);

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
