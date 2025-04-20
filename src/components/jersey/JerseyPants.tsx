
import React from 'react';
import { setupCanvas } from '@/utils/jersey-drawing-utils';

interface JerseyPantsProps {
  ctx: CanvasRenderingContext2D;
  playerNumber?: string;
  fontFamily: string;
  pants_number_enabled?: boolean;
  logo?: {
    image: HTMLImageElement;
    position: { x: number; y: number; scale: number };
  };
}

export const JerseyPants = ({ 
  ctx, 
  playerNumber, 
  fontFamily,
  pants_number_enabled = true,
  logo
}: JerseyPantsProps) => {
  // Get actual canvas dimensions accounting for device pixel ratio
  const canvasWidth = ctx.canvas.width / window.devicePixelRatio;
  const canvasHeight = ctx.canvas.height / window.devicePixelRatio;
  
  // Clear canvas before drawing
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // Improved pants drawing with better proportions
  const centerX = canvasWidth / 2;
  const pantsWidth = canvasWidth * 0.6; // 60% of canvas width (increased from 0.4)
  const pantsHeight = canvasHeight * 0.7; // 70% of canvas height
  
  // Draw pants with better positioning
  ctx.fillStyle = '#1A1A1A';
  
  // Pants shape - positioned lower to be fully visible
  ctx.beginPath();
  ctx.moveTo(centerX - pantsWidth/4, canvasHeight * 0.2); // Top left - moved down
  ctx.lineTo(centerX + pantsWidth/4, canvasHeight * 0.2); // Top right - moved down
  ctx.lineTo(centerX + pantsWidth/2, canvasHeight * 0.85); // Bottom right - moved up
  ctx.lineTo(centerX - pantsWidth/2, canvasHeight * 0.85); // Bottom left - moved up
  ctx.closePath();
  ctx.fill();

  // Setup canvas for text rendering
  setupCanvas(ctx);
  
  // Draw player number if enabled
  if (playerNumber !== undefined && pants_number_enabled) {
    ctx.fillStyle = '#FFFFFF'; // White text on black pants
    const fontSize = canvasWidth * 0.18; // Increased for better visibility
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillText(playerNumber.toString(), centerX, canvasHeight * 0.45);
  }
  
  // Draw logo if provided
  if (logo?.image) {
    const logoWidth = canvasWidth * 0.2; // 20% of canvas width (increased from 0.15)
    const logoHeight = logoWidth; // Square aspect ratio
    
    // Position logo on right side of pants
    const x = centerX + pantsWidth * 0.25;
    const y = canvasHeight * 0.3;
    
    ctx.drawImage(
      logo.image, 
      x - logoWidth/2, 
      y - logoHeight/2, 
      logoWidth, 
      logoHeight
    );
  }
  
  return null;
};
