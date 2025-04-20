
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
  
  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // Draw improved shorts design
  drawPants(ctx);

  // Setup canvas for text
  setupCanvas(ctx);
  
  // Draw player number if enabled (on the side of shorts)
  if (playerNumber !== undefined && pants_number_enabled) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = Math.min(40, canvasWidth * 0.15);
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    
    // Position number on the side of shorts
    ctx.fillText(
      playerNumber.toString(), 
      canvasWidth * 0.75, // Right side placement
      canvasHeight * 0.4  // Middle of shorts height
    );
  }
  
  // Draw logo if provided
  if (logo?.image) {
    const logoWidth = canvasWidth * 0.15; // Smaller logo size
    const logoHeight = logoWidth;
    
    const x = canvasWidth * 0.8;  // Right side placement
    const y = canvasHeight * 0.3; // Upper portion of shorts
    
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
