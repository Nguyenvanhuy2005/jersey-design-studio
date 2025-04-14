import React from 'react';

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
  
  // Draw player number on left leg with correct position
  if (playerNumber !== undefined && pants_number_enabled) {
    ctx.fillStyle = '#FFD700'; // Yellow number
    const fontSize = 30;
    ctx.font = `bold ${fontSize}px ${fontFamily.split(',')[0].replace(/['"]+/g, '')}`;
    ctx.fillText(playerNumber.toString(), 125, 40);
  }
  
  // Draw logo on right leg with correct position
  if (logo && logo.image) {
    try {
      const logoWidth = 40;
      const logoHeight = 40;
      const x = 185;
      const y = 40;
      
      ctx.drawImage(
        logo.image, 
        x - logoWidth/2,
        y - logoHeight/2,
        logoWidth, 
        logoHeight
      );
    } catch (error) {
      console.error("Error drawing logo on pants:", error);
    }
  }
  
  return null;
};
