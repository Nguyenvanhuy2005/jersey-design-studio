
import React from 'react';
import { Logo } from '@/types';
import { getFont } from '@/utils/jersey-utils';

interface JerseyFrontProps {
  ctx: CanvasRenderingContext2D;
  playerNumber?: number;
  loadedLogos: Map<string, HTMLImageElement>;
  logoPositions: Map<string, { x: number; y: number }>;
  logos: Logo[];
  fontFamily: string;
}

export const JerseyFront = ({ 
  ctx, 
  playerNumber, 
  loadedLogos, 
  logoPositions, 
  logos,
  fontFamily 
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
  
  // Draw logos based on position
  if (loadedLogos.size > 0) {
    // First, draw regular front logos (chest positions)
    logos.forEach(logo => {
      const img = loadedLogos.get(logo.id!);
      if (!img || logo.position === 'sleeve_left' || logo.position === 'sleeve_right') return;
      
      const position = logoPositions.get(logo.id!) || { 
        x: logo.position === 'chest_left' ? 80 : 
           logo.position === 'chest_right' ? 220 : 150,
        y: logo.position === 'chest_center' ? 100 : 60
      };
      
      const logoWidth = 60;
      const logoHeight = 60;
      
      ctx.drawImage(img, position.x - logoWidth/2, position.y - logoHeight/2, logoWidth, logoHeight);
    });
  }
  
  // Draw logos on sleeves - separately handle sleeve logos
  if (loadedLogos.size > 0) {
    logos.forEach(logo => {
      if (logo.position !== 'sleeve_left' && logo.position !== 'sleeve_right') return;
      
      const img = loadedLogos.get(logo.id!);
      if (!img) return;
      
      const position = logoPositions.get(logo.id!) || 
        (logo.position === 'sleeve_left' ? { x: 30, y: 40 } : { x: 270, y: 40 });
      
      const logoWidth = 40;
      const logoHeight = 40;
      
      ctx.drawImage(img, position.x - logoWidth/2, position.y - logoHeight/2, logoWidth, logoHeight);
    });
  }
  
  return null; // This component just draws on the canvas, doesn't return JSX
};
