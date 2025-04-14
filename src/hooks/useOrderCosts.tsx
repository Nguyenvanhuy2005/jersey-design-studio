
import { useCallback } from 'react';
import { Player, ProductLine } from '@/types';

export const useOrderCosts = (players: Player[], productLines: ProductLine[]) => {
  const calculateTotalCost = useCallback(() => {
    if (!players.length) return 0;
    
    let totalCost = 0;
    const basePlayerUniformPrice = 120000;
    const baseGoalkeeperUniformPrice = 150000;
    
    const playerCount = players.filter(p => (p as any).uniform_type !== 'goalkeeper').length;
    const goalkeeperCount = players.filter(p => (p as any).uniform_type === 'goalkeeper').length;
    
    const uniformsCost = (playerCount * basePlayerUniformPrice) + 
                         (goalkeeperCount * baseGoalkeeperUniformPrice);
    
    const printingCost = productLines.reduce((total, line) => {
      let positionCost = 0;
      
      if (line.position.includes("số lưng")) {
        positionCost = 20000;
      } else if (line.position.includes("số ngực") || line.position.includes("số quần")) {
        positionCost = 10000;
      } else if (line.position.includes("Logo")) {
        positionCost = 25000;
      } else if (line.position.includes("PET")) {
        positionCost = 35000;
      } else {
        positionCost = 15000;
      }
      
      if (line.material.includes("decal")) {
        positionCost *= 1.2;
      } else if (line.material.includes("PET")) {
        positionCost *= 1.5;
      }
      
      return total + positionCost;
    }, 0);
    
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
