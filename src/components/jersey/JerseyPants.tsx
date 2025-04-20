
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
  
  // Draw player number if enabled (on right leg)
  if (playerNumber !== undefined && pants_number_enabled) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = Math.min(40, canvasWidth * 0.15);
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    
    // Position number on right leg
    ctx.fillText(
      playerNumber.toString(),
      canvasWidth * 0.75,
      canvasHeight * 0.35
    );
  }
  
  // Draw logo if provided (on left leg)
  if (logo?.image) {
    const logoWidth = canvasWidth * 0.15;
    const logoHeight = logoWidth;
    
    const x = canvasWidth * 0.25; // Left leg placement
    const y = canvasHeight * 0.35; // Upper portion of shorts
    
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
