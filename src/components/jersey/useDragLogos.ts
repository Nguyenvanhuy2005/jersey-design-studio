
import { useState, useCallback, useRef } from 'react';
import { Logo } from '@/types';
import { toast } from 'sonner';

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
    const x = (e.clientX - rect.left) * (canvas.width / rect.width / window.devicePixelRatio);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height / window.devicePixelRatio);
    
    return { x, y };
  };
  
  // Start drag operation
  const startDrag = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e);
    console.log(`Mouse down at coordinates: (${x}, ${y})`);
    
    // Store initial mouse position
    dragStartPos.current = { x, y };
    
    // Check if click is on UI controls of selected logo first
    if (selectedLogo) {
      const position = logoPositions.get(selectedLogo);
      if (position) {
        const logo = logos.find(l => l.id === selectedLogo);
        if (logo) {
          // Base sizes for logo
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
          
          // Movement panel
          const movementPanel = {
            x: position.x - 75,
            y: position.y + height/2 + 15,
            width: 150,
            height: 30
          };
          
          const buttonRadius = 10;
          const buttonY = movementPanel.y + movementPanel.height/2;
          
          // Check button clicks
          // Left button
          const leftX = movementPanel.x + 25;
          const distToLeftBtn = Math.sqrt(Math.pow(x - leftX, 2) + Math.pow(y - buttonY, 2));
          
          // Right button
          const rightX = movementPanel.x + 125;
          const distToRightBtn = Math.sqrt(Math.pow(x - rightX, 2) + Math.pow(y - buttonY, 2));
          
          // Up button
          const upX = movementPanel.x + 75 - 15;
          const distToUpBtn = Math.sqrt(Math.pow(x - upX, 2) + Math.pow(y - buttonY, 2));
          
          // Down button
          const downX = movementPanel.x + 75 + 15;
          const distToDownBtn = Math.sqrt(Math.pow(x - downX, 2) + Math.pow(y - buttonY, 2));
          
          // Zoom panel
          const zoomPanel = {
            x: position.x + 20,
            y: position.y - height/2 - 10
          };
          
          const zoomY = zoomPanel.y + 15;
          
          // Zoom in/out buttons
          const zoomInX = zoomPanel.x + 20;
          const distToZoomIn = Math.sqrt(Math.pow(x - zoomInX, 2) + Math.pow(y - zoomY, 2));
          
          const zoomOutX = zoomPanel.x + 50;
          const distToZoomOut = Math.sqrt(Math.pow(x - zoomOutX, 2) + Math.pow(y - zoomY, 2));
          
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
          
          // Check if left button clicked
          if (distToLeftBtn <= buttonRadius) {
            console.log("Left button clicked");
            handleLogoMove(selectedLogo, position.x - 5, position.y);
            return;
          }
          
          // Check if right button clicked
          if (distToRightBtn <= buttonRadius) {
            console.log("Right button clicked");
            handleLogoMove(selectedLogo, position.x + 5, position.y);
            return;
          }
          
          // Check if up button clicked
          if (distToUpBtn <= buttonRadius) {
            console.log("Up button clicked");
            handleLogoMove(selectedLogo, position.x, position.y - 5);
            return;
          }
          
          // Check if down button clicked
          if (distToDownBtn <= buttonRadius) {
            console.log("Down button clicked");
            handleLogoMove(selectedLogo, position.x, position.y + 5);
            return;
          }
          
          // Check if zoom in button clicked
          if (distToZoomIn <= buttonRadius) {
            console.log("Zoom in button clicked");
            const newScale = Math.min(2.0, position.scale + 0.1);
            handleLogoResize(selectedLogo, newScale);
            return;
          }
          
          // Check if zoom out button clicked
          if (distToZoomOut <= buttonRadius) {
            console.log("Zoom out button clicked");
            const newScale = Math.max(0.5, position.scale - 0.1);
            handleLogoResize(selectedLogo, newScale);
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
  
  // Delete logo handler 
  const handleLogoDelete = useCallback((logoId: string) => {
    console.log(`Delete request for logo ${logoId}`);
    toast.info("Chức năng xóa logo đang được phát triển");
    // Currently we just deselect the logo as deletion is handled in the parent component
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
