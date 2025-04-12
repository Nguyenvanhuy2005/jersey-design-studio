
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
  handleResize: (logoId: string, scaleChange: number) => void;
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
    
    // First, check if the click is on any resize button when a logo is selected
    if (selectedLogo) {
      const position = logoPositions.get(selectedLogo);
      if (position) {
        const logo = logos.find(l => l.id === selectedLogo);
        if (logo) {
          // Base size for different positions
          let baseWidth = logo.position.includes('sleeve') ? 40 : 60;
          let baseHeight = logo.position.includes('sleeve') ? 40 : 60;
          
          // Apply scale
          const width = baseWidth * position.scale;
          const height = baseHeight * position.scale;
          
          // Adjust button size and padding for better touchability
          const buttonSize = 28; // Increased from 24
          const buttonPadding = 18; // Increased from 14
          
          // Calculate distance from click to "+" button center
          const distToPlus = Math.sqrt(
            Math.pow(x - (position.x + width/2 + buttonPadding), 2) +
            Math.pow(y - position.y, 2)
          );
          
          // Calculate distance from click to "-" button center
          const distToMinus = Math.sqrt(
            Math.pow(x - (position.x - width/2 - buttonPadding), 2) +
            Math.pow(y - position.y, 2)
          );
          
          // Check if clicked on "+" button (using distance for circular buttons)
          // Increased detection radius for easier clicking
          if (distToPlus <= buttonSize/2 + 5) {
            console.log("+ button clicked");
            handleResize(selectedLogo, 0.1); // Increase size by 10%
            return; // Exit early as we handled the button click
          }
          
          // Check if clicked on "-" button (using distance for circular buttons)
          // Increased detection radius for easier clicking
          if (distToMinus <= buttonSize/2 + 5) {
            console.log("- button clicked");
            handleResize(selectedLogo, -0.1); // Decrease size by 10%
            return; // Exit early as we handled the button click
          }
        }
      }
    }
    
    // If not clicking on buttons, check if clicking on logos
    for (let i = logos.length - 1; i >= 0; i--) {
      // Process in reverse order so we select the top-most logo if overlapping
      const logo = logos[i];
      if (!logo.id) continue;
      
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
        console.log(`Selected logo: ${logo.id}`);
        break; // Exit the loop once we've found a match
      }
    }
    
    if (draggedId) {
      setDraggedLogo(draggedId);
      setSelectedLogo(draggedId);
      setStartPosition({ x, y });
    } else {
      // If clicked outside any logo, deselect
      console.log("No logo selected, deselecting");
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
  
  // Resize handler for buttons
  const handleResize = useCallback((logoId: string, scaleChange: number) => {
    setLogoPositions(prev => {
      const updatedPositions = new Map(prev);
      const currentPosition = updatedPositions.get(logoId) || { 
        x: 0, 
        y: 0, 
        scale: 1.0 
      };
      
      // Apply scaling with limits
      let newScale = currentPosition.scale + scaleChange;
      
      // Apply min/max constraints (0.5 to 2.0)
      newScale = Math.max(0.5, Math.min(2.0, newScale));
      
      console.log(`Resizing logo ${logoId}: ${currentPosition.scale} -> ${newScale}`);
      
      updatedPositions.set(logoId, {
        ...currentPosition,
        scale: newScale
      });
      
      return updatedPositions;
    });
  }, [setLogoPositions]);
  
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
    handleResize,
    selectLogo
  };
};
