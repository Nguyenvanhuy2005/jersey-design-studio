
import { useState, useCallback } from 'react';
import { Logo } from '@/types';

interface UseDragLogosProps {
  logos: Logo[];
  logoPositions: Map<string, { x: number, y: number }>;
  setLogoPositions: React.Dispatch<React.SetStateAction<Map<string, { x: number, y: number }>>>;
}

interface UseDragLogosReturn {
  draggedLogo: string | null;
  startDrag: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  drag: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  endDrag: () => void;
}

export const useDragLogos = ({ 
  logos, 
  logoPositions, 
  setLogoPositions 
}: UseDragLogosProps): UseDragLogosReturn => {
  const [draggedLogo, setDraggedLogo] = useState<string | null>(null);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  
  const startDrag = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is within any logo
    let draggedId: string | null = null;
    
    logos.forEach(logo => {
      const position = logoPositions.get(logo.id!) || { x: 0, y: 0 };
      const width = logo.position.includes('sleeve') ? 40 : 60;
      const height = logo.position.includes('sleeve') ? 40 : 60;
      
      // Check if click is within the logo (accounting for centered drawing)
      if (
        x >= position.x - width/2 && 
        x <= position.x + width/2 && 
        y >= position.y - height/2 && 
        y <= position.y + height/2
      ) {
        draggedId = logo.id!;
      }
    });
    
    if (draggedId) {
      setDraggedLogo(draggedId);
      setStartPosition({ x, y });
    }
  }, [logos, logoPositions]);
  
  const drag = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedLogo) return;
    
    const canvas = e.currentTarget;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const dx = x - startPosition.x;
    const dy = y - startPosition.y;
    
    setLogoPositions(prev => {
      const updatedPositions = new Map(prev);
      const currentPosition = updatedPositions.get(draggedLogo) || { x: 0, y: 0 };
      
      updatedPositions.set(draggedLogo, {
        x: currentPosition.x + dx,
        y: currentPosition.y + dy
      });
      
      return updatedPositions;
    });
    
    setStartPosition({ x, y });
  }, [draggedLogo, setLogoPositions]);
  
  const endDrag = useCallback(() => {
    setDraggedLogo(null);
  }, []);
  
  return {
    draggedLogo,
    startDrag,
    drag,
    endDrag
  };
};
