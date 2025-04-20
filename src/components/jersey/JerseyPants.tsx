
import React from 'react';
import { setupCanvas, drawPants } from '@/utils/jersey-drawing-utils';

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
  const canvasWidth = ctx.canvas.width / window.devicePixelRatio;
  const canvasHeight = ctx.canvas.height / window.devicePixelRatio;
  
  // Clear canvas before drawing
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // Draw pants with new design
  drawPants(ctx);

  // Setup canvas for text rendering
  setupCanvas(ctx);
  
  // Draw player number if enabled
  if (playerNumber !== undefined && pants_number_enabled) {
    ctx.fillStyle = '#FFFFFF';
    const fontSize = Math.min(50, canvasWidth * 0.18);
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillText(playerNumber.toString(), canvasWidth / 2, canvasHeight * 0.45);
  }
  
  // Draw logo if provided
  if (logo?.image) {
    const logoWidth = canvasWidth * 0.2;
    const logoHeight = logoWidth;
    
    const x = canvasWidth * 0.65; // Position on right side
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
