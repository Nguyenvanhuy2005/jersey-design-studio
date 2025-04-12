
import { useState, useCallback } from 'react';
import { Logo } from '@/types';

interface UseDragLogosProps {
  logos: Logo[];
  logoPositions: Map<string, { x: number, y: number, scale: number }>;
  setLogoPositions: React.Dispatch<React.SetStateAction<Map<string, { x: number, y: number, scale: number }>>>;
}

interface UseDragLogosReturn {
  draggedLogo: string | null;
  selectedLogo: string | null;
  startDrag: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  drag: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  endDrag: () => void;
  handleWheel: (e: React.WheelEvent<HTMLCanvasElement>) => void;
  selectLogo: (id: string | null) => void;
}

export const useDragLogos = ({ 
  logos, 
  logoPositions, 
  setLogoPositions 
}: UseDragLogosProps): UseDragLogosReturn => {
  const [draggedLogo, setDraggedLogo] = useState<string | null>(null);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  
  const startDrag = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // Check if click is within any logo
    let draggedId: string | null = null;
    
    logos.forEach(logo => {
      if (!logo.id) return;
      
      const position = logoPositions.get(logo.id) || { 
        x: 0, 
        y: 0,
        scale: 1.0
      };
      
      // Base size for different positions
      let baseWidth = logo.position.includes('sleeve') ? 40 : 60;
      let baseHeight = logo.position.includes('sleeve') ? 40 : 60;
      
      // Apply scale
      const width = baseWidth * position.scale;
      const height = baseHeight * position.scale;
      
      // Check if click is within the logo (accounting for centered drawing)
      if (
        x >= position.x - width/2 && 
        x <= position.x + width/2 && 
        y >= position.y - height/2 && 
        y <= position.y + height/2
      ) {
        draggedId = logo.id;
      }
    });
    
    if (draggedId) {
      setDraggedLogo(draggedId);
      setSelectedLogo(draggedId);
      setStartPosition({ x, y });
    } else {
      // If clicked outside any logo, deselect
      setSelectedLogo(null);
    }
  }, [logos, logoPositions]);
  
  const drag = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedLogo) return;
    
    const canvas = e.currentTarget;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    const dx = x - startPosition.x;
    const dy = y - startPosition.y;
    
    setLogoPositions(prev => {
      const updatedPositions = new Map(prev);
      const currentPosition = updatedPositions.get(draggedLogo) || { 
        x: 0, 
        y: 0,
        scale: 1.0
      };
      
      updatedPositions.set(draggedLogo, {
        x: currentPosition.x + dx,
        y: currentPosition.y + dy,
        scale: currentPosition.scale
      });
      
      return updatedPositions;
    });
    
    setStartPosition({ x, y });
  }, [draggedLogo, setLogoPositions]);
  
  const endDrag = useCallback(() => {
    setDraggedLogo(null);
  }, []);
  
  // Add wheel handler for scaling logos
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!selectedLogo) return;
    
    e.preventDefault(); // Prevent page scrolling
    
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1; // Scale down on scroll down, up on scroll up
    
    setLogoPositions(prev => {
      const updatedPositions = new Map(prev);
      const currentPosition = updatedPositions.get(selectedLogo) || { 
        x: 0, 
        y: 0, 
        scale: 1.0 
      };
      
      // Apply scaling with limits
      let newScale = currentPosition.scale * scaleFactor;
      
      // Apply min/max constraints (0.5 to 2.0)
      newScale = Math.max(0.5, Math.min(2.0, newScale));
      
      updatedPositions.set(selectedLogo, {
        ...currentPosition,
        scale: newScale
      });
      
      return updatedPositions;
    });
  }, [selectedLogo, setLogoPositions]);
  
  // Add explicit logo selection function
  const selectLogo = useCallback((id: string | null) => {
    setSelectedLogo(id);
  }, []);
  
  return {
    draggedLogo,
    selectedLogo,
    startDrag,
    drag,
    endDrag,
    handleWheel,
    selectLogo
  };
};
