
import { useState, useCallback } from 'react';
import { Logo } from '@/types';

interface UseDragLogosProps {
  logos: Logo[];
  logoPositions: Map<string, { x: number, y: number, scale: number }>;
  setLogoPositions: React.Dispatch<React.SetStateAction<Map<string, { x: number, y: number, scale: number }>>>;
}

interface UseDragLogosReturn {
  selectedLogo: string | null;
  startDrag: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleResize: (logoId: string, scaleChange: number) => void;
  handleMove: (logoId: string, direction: 'up' | 'down' | 'left' | 'right') => void;
  selectLogo: (id: string | null) => void;
}

export const useDragLogos = ({ 
  logos, 
  logoPositions, 
  setLogoPositions 
}: UseDragLogosProps): UseDragLogosReturn => {
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  
  const startDrag = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    // Improve coordinate calculation with correct scaling for high-DPI displays
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX / window.devicePixelRatio;
    const y = (e.clientY - rect.top) * scaleY / window.devicePixelRatio;
    
    console.log(`Mouse down at coordinates: (${x}, ${y})`);
    
    // Check if click is within any logo
    let selectedId: string | null = null;
    
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
          const buttonSize = 28; // Size for easier clicking
          const buttonPadding = 18; // Distance from logo edge
          
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
          
          // Check for directional buttons
          // Up button (above logo)
          const distToUp = Math.sqrt(
            Math.pow(x - position.x, 2) +
            Math.pow(y - (position.y - height/2 - buttonPadding), 2)
          );
          
          // Down button (below logo)
          const distToDown = Math.sqrt(
            Math.pow(x - position.x, 2) +
            Math.pow(y - (position.y + height/2 + buttonPadding), 2)
          );
          
          // Left button (left of logo)
          const distToLeft = Math.sqrt(
            Math.pow(x - (position.x - width/2 - buttonPadding*2), 2) +
            Math.pow(y - position.y, 2)
          );
          
          // Right button (right of logo)
          const distToRight = Math.sqrt(
            Math.pow(x - (position.x + width/2 + buttonPadding*2), 2) +
            Math.pow(y - position.y, 2)
          );
          
          console.log(`Distance to buttons: + (${distToPlus}), - (${distToMinus}), ↑ (${distToUp}), ↓ (${distToDown}), ← (${distToLeft}), → (${distToRight})`);
          
          // Check if clicked on any button (using distance for circular buttons)
          // Increased detection radius for easier clicking
          if (distToPlus <= buttonSize/2 + 5) {
            console.log("+ button clicked");
            handleResize(selectedLogo, 0.1); // Increase size by 10%
            return; // Exit early as we handled the button click
          }
          
          if (distToMinus <= buttonSize/2 + 5) {
            console.log("- button clicked");
            handleResize(selectedLogo, -0.1); // Decrease size by 10%
            return; // Exit early as we handled the button click
          }
          
          if (distToUp <= buttonSize/2 + 5) {
            console.log("↑ button clicked");
            handleMove(selectedLogo, 'up');
            return; // Exit early as we handled the button click
          }
          
          if (distToDown <= buttonSize/2 + 5) {
            console.log("↓ button clicked");
            handleMove(selectedLogo, 'down');
            return; // Exit early as we handled the button click
          }
          
          if (distToLeft <= buttonSize/2 + 5) {
            console.log("← button clicked");
            handleMove(selectedLogo, 'left');
            return; // Exit early as we handled the button click
          }
          
          if (distToRight <= buttonSize/2 + 5) {
            console.log("→ button clicked");
            handleMove(selectedLogo, 'right');
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
      
      // Debug info
      console.log(`Checking logo ${logo.id} at (${position.x}, ${position.y}), size: ${width}x${height}`);
      console.log(`Click bounds check: x=${x} >= ${position.x - width/2} && x=${x} <= ${position.x + width/2} && y=${y} >= ${position.y - height/2} && y=${y} <= ${position.y + height/2}`);
      
      // Check if click is within the logo (accounting for centered drawing)
      if (
        x >= position.x - width/2 && 
        x <= position.x + width/2 && 
        y >= position.y - height/2 && 
        y <= position.y + height/2
      ) {
        selectedId = logo.id;
        console.log(`Selected logo: ${logo.id}`);
        break; // Exit the loop once we've found a match
      }
    }
    
    if (selectedId) {
      setSelectedLogo(selectedId);
      console.log(`Selected logo: ${selectedId}`);
    } else {
      // If clicked outside any logo, deselect
      console.log("No logo selected, deselecting");
      setSelectedLogo(null);
    }
  }, [logos, logoPositions]);
  
  // Move handler for directional buttons
  const handleMove = useCallback((logoId: string, direction: 'up' | 'down' | 'left' | 'right') => {
    const moveDistance = 5; // Move 5px at a time
    
    setLogoPositions(prev => {
      const updatedPositions = new Map(prev);
      const currentPosition = updatedPositions.get(logoId) || { x: 0, y: 0, scale: 1.0 };
      
      let newX = currentPosition.x;
      let newY = currentPosition.y;
      
      switch (direction) {
        case 'up':
          newY = Math.max(20, currentPosition.y - moveDistance); // Prevent moving out of canvas
          break;
        case 'down':
          newY = Math.min(280, currentPosition.y + moveDistance); // Prevent moving out of canvas
          break;
        case 'left':
          newX = Math.max(20, currentPosition.x - moveDistance); // Prevent moving out of canvas
          break;
        case 'right':
          newX = Math.min(280, currentPosition.x + moveDistance); // Prevent moving out of canvas
          break;
      }
      
      console.log(`Moving logo ${logoId} ${direction}: (${currentPosition.x}, ${currentPosition.y}) -> (${newX}, ${newY})`);
      
      updatedPositions.set(logoId, {
        x: newX,
        y: newY,
        scale: currentPosition.scale
      });
      
      return updatedPositions;
    });
  }, [setLogoPositions]);
  
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
    selectedLogo,
    startDrag,
    handleResize,
    handleMove,
    selectLogo
  };
};
