
import React from 'react';

interface JerseyPantsProps {
  ctx: CanvasRenderingContext2D;
  playerNumber?: string;
  fontFamily: string; // should be just the font family name, e.g., "Arial"
  pants_number_enabled?: boolean;
  logo?: {
    image: HTMLImageElement;
    position: { x: number; y: number; scale: number };
  };
  designData?: any; // Optionally pass partial DesignData for future extensibility
  printConfig?: { font?: string };
}

export const JerseyPants = ({ 
  ctx, 
  playerNumber, 
  fontFamily,
  pants_number_enabled = true,
  logo,
  designData,
  printConfig
}: JerseyPantsProps) => {
  // Draw short pants
  ctx.fillStyle = '#FFD700';

  // Left side
  ctx.beginPath();
  ctx.moveTo(100, 0);
  ctx.lineTo(150, 0);
  ctx.lineTo(160, 80);
  ctx.lineTo(90, 80);
  ctx.closePath();
  ctx.fill();

  // Right side
  ctx.beginPath();
  ctx.moveTo(150, 0);
  ctx.lineTo(200, 0);
  ctx.lineTo(210, 80);
  ctx.lineTo(160, 80);
  ctx.closePath();
  ctx.fill();

  // Setup canvas for text rendering
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  // Choose the font for the pants number (số quần) from "font_number" in designData, else printConfig.font, else fallback
  let pantsNumberFont = (designData?.font_number?.font) 
    || (printConfig?.font)
    || fontFamily
    || 'Arial';

  // Draw player number if enabled
  if (playerNumber !== undefined && pants_number_enabled) {
    ctx.fillStyle = '#1A1A1A';
    // Increased font size for prominence
    const fontSize = 40;
    ctx.font = `bold ${fontSize}px "${pantsNumberFont}"`;
    ctx.fillText(playerNumber.toString(), 125, 40);
  }

  // Draw logo if provided
  if (logo?.image) {
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
  }

  return null;
};
