
import { useState, useCallback, useRef } from 'react';
import { Logo } from '@/types';

interface UseDragLogosProps {
  logos: Logo[];
  logoPositions: Map<string, { x: number, y: number, scale: number }>;
  setLogoPositions: React.Dispatch<React.SetStateAction<Map<string, { x: number, y: number, scale: number }>>>;
}

interface UseDragLogosReturn {
  selectedLogo: string | null;
  isDragging: boolean;
  startDrag: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  continueDrag: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  endDrag: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleLogoMove: (logoId: string, newX: number, newY: number) => void;
  handleLogoResize: (logoId: string, newScale: number) => void;
  handleLogoDelete: (logoId: string) => void;
  selectLogo: (id: string | null) => void;
}

type DragMode = 'move' | 'resize' | 'rotate' | null;

export const useDragLogos = ({ 
  logos, 
  logoPositions, 
  setLogoPositions 
}: UseDragLogosProps): UseDragLogosReturn => {
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const dragMode = useRef<DragMode>(null);
  const activeCorner = useRef<string | null>(null);
  const initialLogoPos = useRef<{ x: number, y: number, scale: number } | null>(null);
  
  // Helper to get canvas coordinates from mouse event
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    // Improve coordinate calculation with correct scaling for high-DPI displays
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX / window.devicePixelRatio;
    const y = (e.clientY - rect.top) * scaleY / window.devicePixelRatio;
    
    return { x, y };
  };
  
  // Start drag operation
  const startDrag = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e);
    console.log(`Mouse down at coordinates: (${x}, ${y})`);
    
    // Store initial mouse position
    dragStartPos.current = { x, y };
    
    // Check if click is on toolbar of selected logo first
    if (selectedLogo) {
      const position = logoPositions.get(selectedLogo);
      if (position) {
        const logo = logos.find(l => l.id === selectedLogo);
        if (logo) {
          // Base size for logo
          let baseWidth = logo.position.includes('sleeve') ? 40 : 60;
          let baseHeight = logo.position.includes('sleeve') ? 40 : 60;
          
          // Apply scale
          const width = baseWidth * position.scale;
          const height = baseHeight * position.scale;
          
          // Check if clicked on delete button in toolbar
          const toolbarHeight = 36;
          const toolbarWidth = 80;
          const toolbarY = position.y - height/2 - toolbarHeight - 10;
          const toolbarX = position.x - toolbarWidth/2;
          
          // Delete button position
          const deleteButtonX = toolbarX + 20;
          const deleteButtonY = toolbarY + toolbarHeight/2;
          
          // Calculate distance from click to delete button
          const distToDelete = Math.sqrt(
            Math.pow(x - deleteButtonX, 2) +
            Math.pow(y - deleteButtonY, 2)
          );
          
          // Rotate button position
          const rotateButtonX = toolbarX + 60;
          const rotateButtonY = toolbarY + toolbarHeight/2;
          
          // Calculate distance from click to rotate button
          const distToRotate = Math.sqrt(
            Math.pow(x - rotateButtonX, 2) +
            Math.pow(y - rotateButtonY, 2)
          );
          
          // Check if delete button clicked (using 12px radius)
          if (distToDelete <= 12) {
            console.log("Delete button clicked");
            handleLogoDelete(selectedLogo);
            return;
          }
          
          // Check if rotate button clicked (using 12px radius) - for future implementation
          if (distToRotate <= 12) {
            console.log("Rotate button clicked");
            // Rotation will be implemented in future
            return;
          }
          
          // Check if clicked on any resize handle (8px squares)
          const handleSize = 8;
          const cornerPositions = [
            { id: 'nw', x: position.x - width/2, y: position.y - height/2 },
            { id: 'ne', x: position.x + width/2, y: position.y - height/2 },
            { id: 'sw', x: position.x - width/2, y: position.y + height/2 },
            { id: 'se', x: position.x + width/2, y: position.y + height/2 }
          ];
          
          for (const corner of cornerPositions) {
            if (
              x >= corner.x - handleSize/2 && x <= corner.x + handleSize/2 &&
              y >= corner.y - handleSize/2 && y <= corner.y + handleSize/2
            ) {
              console.log(`Corner resize handle clicked: ${corner.id}`);
              setIsDragging(true);
              dragMode.current = 'resize';
              activeCorner.current = corner.id;
              initialLogoPos.current = { ...position };
              return;
            }
          }
          
          // Check if clicked inside logo for regular drag
          if (
            x >= position.x - width/2 && 
            x <= position.x + width/2 && 
            y >= position.y - height/2 && 
            y <= position.y + height/2
          ) {
            console.log(`Dragging logo: ${selectedLogo}`);
            setIsDragging(true);
            dragMode.current = 'move';
            initialLogoPos.current = { ...position };
            return;
          }
        }
      }
    }
    
    // If not interacting with selected logo's controls, check if clicking on a different logo
    let newSelectedId: string | null = null;
    
    // Check if clicking on logos
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
        newSelectedId = logo.id;
        console.log(`Selected logo: ${logo.id}`);
        
        // If selecting a new logo, start drag immediately
        if (newSelectedId !== selectedLogo) {
          setSelectedLogo(newSelectedId);
          setIsDragging(true);
          dragMode.current = 'move';
          initialLogoPos.current = { ...position };
        }
        break; // Exit the loop once we've found a match
      }
    }
    
    if (!newSelectedId) {
      // If clicked outside any logo, deselect
      console.log("No logo selected, deselecting");
      setSelectedLogo(null);
      setIsDragging(false);
      dragMode.current = null;
      initialLogoPos.current = null;
    }
  }, [logos, logoPositions, selectedLogo]);
  
  // Continue drag operation
  const continueDrag = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedLogo || !initialLogoPos.current) return;
    
    const { x, y } = getCanvasCoordinates(e);
    const deltaX = x - dragStartPos.current.x;
    const deltaY = y - dragStartPos.current.y;
    
    const currentPos = logoPositions.get(selectedLogo);
    if (!currentPos) return;
    
    if (dragMode.current === 'move') {
      // Handle logo movement
      const newX = initialLogoPos.current.x + deltaX;
      const newY = initialLogoPos.current.y + deltaY;
      
      // Limit position to within canvas bounds
      const boundedX = Math.max(20, Math.min(280, newX));
      const boundedY = Math.max(20, Math.min(280, newY));
      
      handleLogoMove(selectedLogo, boundedX, boundedY);
    } 
    else if (dragMode.current === 'resize' && activeCorner.current) {
      // Handle logo resizing
      // Get logo's base dimensions
      const logo = logos.find(l => l.id === selectedLogo);
      if (!logo) return;
      
      let baseWidth = logo.position.includes('sleeve') ? 40 : 60;
      let baseHeight = logo.position.includes('sleeve') ? 40 : 60;
      
      // Apply current scale
      const originalWidth = baseWidth * initialLogoPos.current.scale;
      const originalHeight = baseHeight * initialLogoPos.current.scale;
      
      // Calculate distance from corner to center before and after drag
      let newWidth = originalWidth;
      let newHeight = originalHeight;
      
      // Resize based on which corner is being dragged
      if (activeCorner.current === 'se') {
        // Southeast corner
        newWidth = originalWidth + deltaX * 2;
        newHeight = originalHeight + deltaY * 2;
      } else if (activeCorner.current === 'sw') {
        // Southwest corner
        newWidth = originalWidth - deltaX * 2;
        newHeight = originalHeight + deltaY * 2;
      } else if (activeCorner.current === 'ne') {
        // Northeast corner
        newWidth = originalWidth + deltaX * 2;
        newHeight = originalHeight - deltaY * 2;
      } else if (activeCorner.current === 'nw') {
        // Northwest corner
        newWidth = originalWidth - deltaX * 2;
        newHeight = originalHeight - deltaY * 2;
      }
      
      // Maintain aspect ratio by using the larger dimension change
      const widthRatio = newWidth / originalWidth;
      const heightRatio = newHeight / originalHeight;
      let newScale = initialLogoPos.current.scale * Math.abs((Math.abs(widthRatio) > Math.abs(heightRatio)) ? widthRatio : heightRatio);
      
      // Apply min/max constraints (0.5 to 2.0)
      newScale = Math.max(0.5, Math.min(2.0, newScale));
      
      handleLogoResize(selectedLogo, newScale);
    }
  }, [isDragging, selectedLogo, logoPositions, logos]);
  
  // End drag operation
  const endDrag = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      dragMode.current = null;
      initialLogoPos.current = null;
      activeCorner.current = null;
    }
  }, [isDragging]);
  
  // Logo movement handler
  const handleLogoMove = useCallback((logoId: string, newX: number, newY: number) => {
    console.log(`Moving logo ${logoId} to: (${newX}, ${newY})`);
    
    setLogoPositions(prev => {
      const updatedPositions = new Map(prev);
      const currentPosition = updatedPositions.get(logoId) || { x: 0, y: 0, scale: 1.0 };
      
      updatedPositions.set(logoId, {
        x: newX,
        y: newY,
        scale: currentPosition.scale
      });
      
      return updatedPositions;
    });
  }, [setLogoPositions]);
  
  // Resize handler
  const handleLogoResize = useCallback((logoId: string, newScale: number) => {
    console.log(`Resizing logo ${logoId} to scale: ${newScale}`);
    
    setLogoPositions(prev => {
      const updatedPositions = new Map(prev);
      const currentPosition = updatedPositions.get(logoId) || { x: 0, y: 0, scale: 1.0 };
      
      updatedPositions.set(logoId, {
        x: currentPosition.x,
        y: currentPosition.y,
        scale: newScale
      });
      
      return updatedPositions;
    });
  }, [setLogoPositions]);
  
  // Delete logo handler - for future implementation
  const handleLogoDelete = useCallback((logoId: string) => {
    console.log(`Delete request for logo ${logoId}`);
    // This would need to be implemented at the parent component level
    // For now we just deselect the logo
    setSelectedLogo(null);
  }, []);
  
  // Add explicit logo selection function
  const selectLogo = useCallback((id: string | null) => {
    setSelectedLogo(id);
  }, []);
  
  return {
    selectedLogo,
    isDragging,
    startDrag,
    continueDrag,
    endDrag,
    handleLogoMove,
    handleLogoResize,
    handleLogoDelete,
    selectLogo
  };
};
