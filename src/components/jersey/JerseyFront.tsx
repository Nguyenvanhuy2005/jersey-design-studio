
import React from 'react';
import { Logo } from '@/types';
import { getFont } from '@/utils/jersey-utils';
import { Trash2, RotateCw } from 'lucide-react';

interface JerseyFrontProps {
  ctx: CanvasRenderingContext2D;
  playerNumber?: number;
  loadedLogos: Map<string, HTMLImageElement>;
  logoPositions: Map<string, { x: number; y: number; scale: number }>;
  logos: Logo[];
  fontFamily: string;
  highQuality?: boolean;
  selectedLogo?: string | null;
  onLogoMove?: (logoId: string, newX: number, newY: number) => void;
  onLogoResize?: (logoId: string, newScale: number) => void;
  onLogoDelete?: (logoId: string) => void;
}

export const JerseyFront = ({ 
  ctx, 
  playerNumber, 
  loadedLogos, 
  logoPositions, 
  logos,
  fontFamily,
  highQuality = false,
  selectedLogo = null,
  onLogoMove,
  onLogoResize,
  onLogoDelete
}: JerseyFrontProps) => {
  // Draw front jersey
  ctx.fillStyle = '#FFD700'; // Yellow jersey
  ctx.beginPath();
  ctx.moveTo(50, 0);
  ctx.lineTo(250, 0);
  ctx.lineTo(250, 300);
  ctx.lineTo(50, 300);
  ctx.closePath();
  ctx.fill();
  
  // Draw collar
  ctx.fillStyle = '#1A1A1A'; // Black collar
  ctx.beginPath();
  ctx.moveTo(125, 0);
  ctx.lineTo(175, 0);
  ctx.lineTo(175, 30);
  ctx.lineTo(125, 30);
  ctx.closePath();
  ctx.fill();
  
  // Draw sleeves
  ctx.fillStyle = '#FFD700'; // Yellow sleeves
  ctx.beginPath();
  ctx.moveTo(50, 0);
  ctx.lineTo(20, 80);
  ctx.lineTo(50, 80);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(250, 0);
  ctx.lineTo(280, 80);
  ctx.lineTo(250, 80);
  ctx.closePath();
  ctx.fill();
  
  // Draw player number on front center (chest)
  if (playerNumber) {
    ctx.fillStyle = '#1A1A1A';
    ctx.font = fontFamily.replace('20px', '60px'); // Adjust size for player number
    ctx.textAlign = 'center';
    ctx.fillText(playerNumber.toString(), 150, 150);
  }
  
  // Enhanced Canva-style logo drawing function 
  const drawLogo = (
    img: HTMLImageElement, 
    posX: number, 
    posY: number, 
    scale: number,
    logoId: string
  ) => {
    // Base sizes for different positions
    let baseWidth, baseHeight;
    const logoObj = logos.find(l => l.id === logoId);
    
    if (logoObj && logoObj.position.includes('sleeve')) {
      baseWidth = 40;
      baseHeight = 40;
    } else {
      baseWidth = 60;
      baseHeight = 60;
    }
    
    // Apply scale factor
    let width = baseWidth * scale;
    let height = baseHeight * scale;
    
    // Calculate aspect ratio
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    
    // Maintain aspect ratio
    if (aspectRatio > 1) {
      // Wider than tall
      height = width / aspectRatio;
    } else {
      // Taller than wide
      width = height * aspectRatio;
    }
    
    // Save context state
    ctx.save();
    
    // Set high quality rendering
    if (highQuality) {
      ctx.imageSmoothingEnabled = true;
      if ('imageSmoothingQuality' in ctx) {
        (ctx as any).imageSmoothingQuality = 'high';
      }
    }
    
    // Draw with preserved transparency
    try {
      ctx.drawImage(
        img, 
        posX - width/2, 
        posY - height/2, 
        width, 
        height
      );
      
      // If this logo is selected, draw a Canva-style selection frame and control points
      if (selectedLogo === logoId) {
        console.log(`Rendering selected logo: ${logoId} with Canva-style editor`);
        
        // Draw selection highlight with Canva-style
        ctx.strokeStyle = '#3B82F6'; // Blue highlight
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.strokeRect(
          posX - width/2 - 1, 
          posY - height/2 - 1, 
          width + 2, 
          height + 2
        );
        
        // Draw control handles at corners and edges
        const handleSize = 8;
        const controlPoints = [
          // Corners (for resize)
          { x: posX - width/2, y: posY - height/2, cursor: 'nwse-resize', type: 'corner' },
          { x: posX + width/2, y: posY - height/2, cursor: 'nesw-resize', type: 'corner' },
          { x: posX - width/2, y: posY + height/2, cursor: 'nesw-resize', type: 'corner' },
          { x: posX + width/2, y: posY + height/2, cursor: 'nwse-resize', type: 'corner' },
          // Edges (optional for future resize without maintaining aspect ratio)
          { x: posX, y: posY - height/2, cursor: 'ns-resize', type: 'edge' },
          { x: posX + width/2, y: posY, cursor: 'ew-resize', type: 'edge' },
          { x: posX, y: posY + height/2, cursor: 'ns-resize', type: 'edge' },
          { x: posX - width/2, y: posY, cursor: 'ew-resize', type: 'edge' }
        ];
        
        // Draw the control points
        controlPoints.forEach(point => {
          if (point.type === 'corner') {
            // Draw corner handles (filled white squares with blue border)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(point.x - handleSize/2, point.y - handleSize/2, handleSize, handleSize);
            ctx.strokeStyle = '#3B82F6';
            ctx.lineWidth = 1;
            ctx.strokeRect(point.x - handleSize/2, point.y - handleSize/2, handleSize, handleSize);
          }
        });
        
        // Draw Canva-style toolbar above the selection
        const toolbarHeight = 36;
        const toolbarWidth = 80;
        const toolbarY = posY - height/2 - toolbarHeight - 10;
        const toolbarX = posX - toolbarWidth/2;
        
        // Toolbar background
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.beginPath();
        ctx.roundRect(toolbarX, toolbarY, toolbarWidth, toolbarHeight, 4);
        ctx.fill();
        
        // Delete button
        const deleteButtonX = toolbarX + 20;
        const deleteButtonY = toolbarY + toolbarHeight/2;
        
        // Draw delete icon
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(deleteButtonX, deleteButtonY, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw X for delete using simple lines
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(deleteButtonX - 5, deleteButtonY - 5);
        ctx.lineTo(deleteButtonX + 5, deleteButtonY + 5);
        ctx.moveTo(deleteButtonX + 5, deleteButtonY - 5);
        ctx.lineTo(deleteButtonX - 5, deleteButtonY + 5);
        ctx.stroke();
        
        // Rotate button
        const rotateButtonX = toolbarX + 60;
        const rotateButtonY = toolbarY + toolbarHeight/2;
        
        // Draw rotate icon
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(rotateButtonX, rotateButtonY, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw circular arrow for rotate
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rotateButtonX, rotateButtonY, 6, 0.5 * Math.PI, 2 * Math.PI);
        ctx.stroke();
        
        // Draw arrow tip
        ctx.beginPath();
        ctx.moveTo(rotateButtonX, rotateButtonY - 8);
        ctx.lineTo(rotateButtonX + 4, rotateButtonY - 4);
        ctx.lineTo(rotateButtonX, rotateButtonY - 2);
        ctx.fill();
        
        // Add movement controls
        const movementPanel = {
          x: posX - 75,
          y: posY + height/2 + 15,
          width: 150,
          height: 30,
          radius: 4
        };
        
        // Panel background
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.beginPath();
        ctx.roundRect(movementPanel.x, movementPanel.y, movementPanel.width, movementPanel.height, movementPanel.radius);
        ctx.fill();
        
        // Movement buttons - left, right, up, down
        const buttonSize = 20;
        const buttonY = movementPanel.y + movementPanel.height/2;
        
        // Left button
        const leftX = movementPanel.x + 25;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(leftX, buttonY, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Left arrow
        ctx.fillStyle = '#0066CC';
        ctx.beginPath();
        ctx.moveTo(leftX + 4, buttonY);
        ctx.lineTo(leftX - 4, buttonY);
        ctx.lineTo(leftX - 2, buttonY - 3);
        ctx.lineTo(leftX - 2, buttonY + 3);
        ctx.lineTo(leftX - 4, buttonY);
        ctx.fill();
        
        // Right button
        const rightX = movementPanel.x + 125;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(rightX, buttonY, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Right arrow
        ctx.fillStyle = '#0066CC';
        ctx.beginPath();
        ctx.moveTo(rightX - 4, buttonY);
        ctx.lineTo(rightX + 4, buttonY);
        ctx.lineTo(rightX + 2, buttonY - 3);
        ctx.lineTo(rightX + 2, buttonY + 3);
        ctx.lineTo(rightX + 4, buttonY);
        ctx.fill();
        
        // Up button
        const upX = movementPanel.x + 75 - 15;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(upX, buttonY, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Up arrow
        ctx.fillStyle = '#0066CC';
        ctx.beginPath();
        ctx.moveTo(upX, buttonY - 4);
        ctx.lineTo(upX, buttonY + 4);
        ctx.lineTo(upX - 3, buttonY + 2);
        ctx.lineTo(upX + 3, buttonY + 2);
        ctx.lineTo(upX, buttonY + 4);
        ctx.fill();
        
        // Down button
        const downX = movementPanel.x + 75 + 15;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(downX, buttonY, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Down arrow
        ctx.fillStyle = '#0066CC';
        ctx.beginPath();
        ctx.moveTo(downX, buttonY + 4);
        ctx.lineTo(downX, buttonY - 4);
        ctx.lineTo(downX - 3, buttonY - 2);
        ctx.lineTo(downX + 3, buttonY - 2);
        ctx.lineTo(downX, buttonY - 4);
        ctx.fill();
        
        // Zoom controls
        const zoomPanel = {
          x: posX + 20,
          y: posY - height/2 - 10,
          width: 70,
          height: 30,
          radius: 4
        };
        
        // Zoom panel background
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.beginPath();
        ctx.roundRect(zoomPanel.x, zoomPanel.y, zoomPanel.width, zoomPanel.height, zoomPanel.radius);
        ctx.fill();
        
        // Zoom in button
        const zoomInX = zoomPanel.x + 20;
        const zoomY = zoomPanel.y + zoomPanel.height/2;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(zoomInX, zoomY, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // + symbol
        ctx.strokeStyle = '#0066CC';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(zoomInX - 5, zoomY);
        ctx.lineTo(zoomInX + 5, zoomY);
        ctx.moveTo(zoomInX, zoomY - 5);
        ctx.lineTo(zoomInX, zoomY + 5);
        ctx.stroke();
        
        // Zoom out button
        const zoomOutX = zoomPanel.x + 50;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(zoomOutX, zoomY, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // - symbol
        ctx.strokeStyle = '#0066CC';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(zoomOutX - 5, zoomY);
        ctx.lineTo(zoomOutX + 5, zoomY);
        ctx.stroke();
      }
    } catch (e) {
      console.error('Error drawing logo:', e);
    }
    
    // Restore context state
    ctx.restore();
  };
  
  // Debug logs to help diagnose issues
  console.log('Available logos in JerseyFront:', loadedLogos.size);
  console.log('Logo positions in JerseyFront:', Array.from(logoPositions.entries()));
  console.log('Logo array in JerseyFront:', logos);
  console.log('Currently selected logo:', selectedLogo);
  
  // Draw logos based on position - first draw chest positions
  logos.forEach(logo => {
    console.log(`Processing logo: ${logo.id}, position: ${logo.position}`);
    
    if (!logo.id) {
      console.log('Logo missing id, skipping');
      return;
    }
    
    const img = loadedLogos.get(logo.id);
    if (!img) {
      console.log(`No loaded image found for logo ${logo.id}`);
      return;
    }
    
    if (logo.position === 'sleeve_left' || logo.position === 'sleeve_right') {
      return; // Skip sleeve logos for now, will handle separately
    }
    
    const position = logoPositions.get(logo.id) || { 
      x: logo.position === 'chest_left' ? 80 : 
         logo.position === 'chest_right' ? 220 : 150,
      y: logo.position === 'chest_center' ? 100 : 60,
      scale: 1.0
    };
    
    console.log(`Drawing chest logo: ${logo.id} at position:`, position);
    
    // Use enhanced drawing function with proper dimensions
    drawLogo(img, position.x, position.y, position.scale, logo.id);
  });
  
  // Draw logos on sleeves (separately to control layering)
  logos.forEach(logo => {
    if (!logo.id || logo.position !== 'sleeve_left' && logo.position !== 'sleeve_right') {
      return;
    }
    
    const img = loadedLogos.get(logo.id);
    if (!img) {
      console.log(`No loaded image found for sleeve logo ${logo.id}`);
      return;
    }
    
    const position = logoPositions.get(logo.id) || 
      (logo.position === 'sleeve_left' ? { x: 30, y: 40, scale: 1.0 } : { x: 270, y: 40, scale: 1.0 });
    
    console.log(`Drawing sleeve logo: ${logo.id} at position:`, position);
    
    // Use enhanced drawing function with smaller dimensions for sleeves
    drawLogo(img, position.x, position.y, position.scale, logo.id);
  });
  
  return null; // This component just draws on the canvas, doesn't return JSX
};
