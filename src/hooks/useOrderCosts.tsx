
import { useCallback } from 'react';
import { Player, ProductLine } from '@/types';

export const useOrderCosts = (players: Player[], productLines: ProductLine[]) => {
  /**
   * Helper to count number of print lines (for decal logic).
   */
  const countBackLines = () => {
    // Typical productLines for back lines will include "In trên số lưng", "In số lưng", "In dưới số lưng"
    // Let's count unique positions related to back/shoulder lines in productLines (except chest/pants number, logos)
    const backLinePositions = [
      "In trên số lưng",
      "In số lưng",
      "In dưới số lưng",
      "mặt lưng", // In case "mặt lưng" naming is used
    ];
    return productLines.filter(line =>
      backLinePositions.some(pos => line.position.includes(pos))
    ).length;
  };

  const calculateTotalCost = useCallback(() => {
    if (!players.length) return 0;

    let totalCost = 0;
    const basePlayerUniformPrice = 120000;
    const baseGoalkeeperUniformPrice = 150000;

    const playerCount = players.filter(p => (p as any).uniform_type !== 'goalkeeper').length;
    const goalkeeperCount = players.filter(p => (p as any).uniform_type === 'goalkeeper').length;

    const uniformsCost = (playerCount * basePlayerUniformPrice) +
      (goalkeeperCount * baseGoalkeeperUniformPrice);

    // Print cost calculation
    let printingCost = 0;

    // Identify how many back print lines in decal
    const decalBackLines = productLines.filter(
      line =>
        (line.material.includes("decal") || line.material.includes("Decal")) &&
        (
          line.position.includes("In trên số lưng") ||
          line.position.includes("In số lưng") ||
          line.position.includes("In dưới số lưng") ||
          line.position.toLowerCase().includes("mặt lưng")
        )
    );

    // For decal lines, group by player (if possible) for correct pricing. If not, just count lines.
    let decalBackPrice = 0;
    const decalBackLineCount = decalBackLines.length;
    if (decalBackLineCount === 1) {
      decalBackPrice = 10000;
    } else if (decalBackLineCount === 2) {
      decalBackPrice = 15000;
    } else if (decalBackLineCount >= 3) {
      decalBackPrice = 20000;
    }
    printingCost += decalBackPrice;

    // For heat transfer back print (regardless of line count, only one charge if present)
    const htBackLineExists = productLines.some(
      line =>
        (line.material.includes("chuyển nhiệt") || line.material.includes("Chuyển nhiệt")) &&
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

    // In số ngực (Chest number)
    productLines.forEach(line => {
      // Chest number
      if (line.position.toLowerCase().includes("số ngực")) {
        if (line.material.includes("decal") || line.material.includes("Decal")) {
          printingCost += 5000;
        } else if (line.material.includes("chuyển nhiệt") || line.material.includes("Chuyển nhiệt")) {
          printingCost += 5000;
        }
      }
      // Pants number
      if (line.position.toLowerCase().includes("số quần")) {
        if (line.material.includes("decal") || line.material.includes("Decal")) {
          printingCost += 5000;
        } else if (line.material.includes("chuyển nhiệt") || line.material.includes("Chuyển nhiệt")) {
          printingCost += 5000;
        }
      }
      // Logo (any logo position!)
      if (
        line.position.toLowerCase().includes("logo")
      ) {
        printingCost += 10000;
      }
    });

    totalCost = uniformsCost + printingCost;

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

