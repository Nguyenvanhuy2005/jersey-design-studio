
import React from 'react';

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
    ctx.font = fontFamily.replace(/\d+px/, `${fontSize}px`);
    ctx.fillText(playerNumber.toString(), 125, 40);
    console.log(`Drew player number: ${playerNumber} on pants with font: ${ctx.font}`);
  }
  
  // Draw logo if provided (on right leg) - now with fixed position and size
  if (logo && logo.image) {
    try {
      // Fixed logo dimensions - 40x40px
      const logoWidth = 40;
      const logoHeight = 40;
      
      // Fixed position - 20px from left, 20px from top
      const x = 115;
      const y = 20;
      
      // Draw the logo at fixed position with fixed size
      ctx.drawImage(logo.image, x - logoWidth/2, y - logoHeight/2, logoWidth, logoHeight);
      console.log(`Drew logo on pants at fixed position: ${x},${y} with fixed size: 40x40px`);
    } catch (error) {
      console.error("Error drawing logo on pants:", error);
    }
  }
  
  return null; // This component just draws on the canvas, doesn't return JSX
};
