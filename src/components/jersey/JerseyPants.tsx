
import React from 'react';
import { getFont } from '@/utils/jersey-utils';

interface JerseyPantsProps {
  ctx: CanvasRenderingContext2D;
  playerNumber?: number;
  fontFamily: string;
  logo?: {
    image: HTMLImageElement;
    position: { x: number; y: number; scale: number };
  };
}

export const JerseyPants = ({ 
  ctx, 
  playerNumber, 
  fontFamily,
  logo
}: JerseyPantsProps) => {
  // Clear the canvas before drawing
  const canvasWidth = ctx.canvas.width / window.devicePixelRatio;
  const canvasHeight = ctx.canvas.height / window.devicePixelRatio;
  
  console.log(`Rendering JerseyPants on canvas ${canvasWidth}x${canvasHeight}`);
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // Draw short pants instead of long pants
  ctx.fillStyle = '#1A1A1A'; // Black pants
  
  // Draw short pants - left side
  ctx.beginPath();
  ctx.moveTo(100, 0);
  ctx.lineTo(150, 0);
  ctx.lineTo(160, 80);  // Make them shorter
  ctx.lineTo(90, 80);   // Make them shorter
  ctx.closePath();
  ctx.fill();
  
  // Draw short pants - right side
  ctx.beginPath();
  ctx.moveTo(150, 0);
  ctx.lineTo(200, 0);
  ctx.lineTo(210, 80);  // Make them shorter
  ctx.lineTo(160, 80);  // Make them shorter
  ctx.closePath();
  ctx.fill();
  
  // Set high quality text rendering
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  
  // Draw player number (on left leg)
  if (playerNumber !== undefined) {
    ctx.fillStyle = '#FFD700'; // Yellow number
    const fontSize = 35; // Slightly smaller for better fit on short pants
    ctx.font = fontFamily.replace('20px', `${fontSize}px`);
    ctx.fillText(playerNumber.toString(), 125, 40);
    console.log(`Drew player number: ${playerNumber} on pants with font: ${ctx.font}`);
  }
  
  // Draw logo if provided (on right leg)
  if (logo && logo.image) {
    try {
      // Calculate logo dimensions with scale
      const logoWidth = logo.image.width * (logo.position.scale || 1);
      const logoHeight = logo.image.height * (logo.position.scale || 1);
      
      // Position the logo on the right leg
      const x = logo.position.x || 180;
      const y = logo.position.y || 40;
      
      // Draw the logo
      ctx.drawImage(logo.image, x - logoWidth/2, y - logoHeight/2, logoWidth, logoHeight);
      console.log(`Drew logo on pants at position: ${x},${y} with scale: ${logo.position.scale || 1}`);
    } catch (error) {
      console.error("Error drawing logo on pants:", error);
    }
  }
  
  return null; // This component just draws on the canvas, doesn't return JSX
};
