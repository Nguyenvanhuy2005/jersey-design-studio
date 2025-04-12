
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
  highQuality?: boolean;
}

export const JerseyFront = ({ 
  ctx, 
  playerNumber, 
  loadedLogos, 
  logoPositions, 
  logos,
  fontFamily,
  highQuality = false
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
  
  // Enhanced logo drawing function to maintain aspect ratio and quality
  const drawLogo = (
    img: HTMLImageElement, 
    posX: number, 
    posY: number, 
    maxWidth: number, 
    maxHeight: number
  ) => {
    // Calculate aspect ratio
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    let width = maxWidth;
    let height = maxHeight;
    
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
    ctx.drawImage(
      img, 
      posX - width/2, 
      posY - height/2, 
      width, 
      height
    );
    
    // Restore context state
    ctx.restore();
  };
  
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
      
      // Use enhanced drawing function with proper dimensions
      drawLogo(img, position.x, position.y, 60, 60);
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
      
      // Use enhanced drawing function with smaller dimensions for sleeves
      drawLogo(img, position.x, position.y, 40, 40);
    });
  }
  
  return null; // This component just draws on the canvas, doesn't return JSX
};
