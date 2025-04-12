
import React from 'react';
import { Logo } from '@/types';
import { getFont } from '@/utils/jersey-utils';
import { Plus, Minus } from 'lucide-react';

interface JerseyFrontProps {
  ctx: CanvasRenderingContext2D;
  playerNumber?: number;
  loadedLogos: Map<string, HTMLImageElement>;
  logoPositions: Map<string, { x: number; y: number; scale: number }>;
  logos: Logo[];
  fontFamily: string;
  highQuality?: boolean;
  selectedLogo?: string | null;
  onLogoResize?: (logoId: string, scaleChange: number) => void;
}

export const JerseyFront = ({ 
  ctx, 
  playerNumber, 
  loadedLogos, 
  logoPositions, 
  logos,
  fontFamily,
  highQuality = false,
  selectedLogo = null,
  onLogoResize
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
    scale: number,
    logoId: string
  ) => {
    // Base sizes for different positions
    let baseWidth, baseHeight;
    const logoObj = logos.find(l => l.id === logoId);
    
    if (logoObj && logoObj.position.includes('sleeve')) {
      baseWidth = 40;
      baseHeight = 40;
    } else {
      baseWidth = 60;
      baseHeight = 60;
    }
    
    // Apply scale factor
    let width = baseWidth * scale;
    let height = baseHeight * scale;
    
    // Calculate aspect ratio
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    
    // Maintain aspect ratio
    if (aspectRatio > 1) {
      // Wider than tall
      height = width / aspectRatio;
    } else {
      // Taller than wide
      width = height * aspectRatio;
    }
    
    console.log(`Drawing logo ${logoId} at (${posX}, ${posY}), size: ${width}x${height}, scale: ${scale}`);
    
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
    try {
      ctx.drawImage(
        img, 
        posX - width/2, 
        posY - height/2, 
        width, 
        height
      );
      
      // If this logo is selected, draw a highlight around it
      if (selectedLogo === logoId) {
        // Draw selection outline with more visibility
        ctx.strokeStyle = '#3B82F6'; // Blue highlight
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]); // Dashed line
        ctx.strokeRect(
          posX - width/2 - 5, 
          posY - height/2 - 5, 
          width + 10, 
          height + 10
        );
        
        // Reset line dash
        ctx.setLineDash([]);
        
        // Draw resize buttons with better visibility and improved clickability
        const buttonSize = 28;
        const buttonPadding = 18;
        
        // "+" button (increase size) - right of logo
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.beginPath();
        ctx.arc(
          posX + width/2 + buttonPadding, 
          posY, 
          buttonSize/2, 
          0, 
          Math.PI * 2
        );
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          posX + width/2 + buttonPadding, 
          posY, 
          buttonSize/2, 
          0, 
          Math.PI * 2
        );
        ctx.stroke();
        
        // Draw "+" symbol with improved visibility
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          "+",
          posX + width/2 + buttonPadding,
          posY
        );
        
        // "-" button (decrease size) - left of logo
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.beginPath();
        ctx.arc(
          posX - width/2 - buttonPadding, 
          posY, 
          buttonSize/2, 
          0, 
          Math.PI * 2
        );
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          posX - width/2 - buttonPadding, 
          posY, 
          buttonSize/2, 
          0, 
          Math.PI * 2
        );
        ctx.stroke();
        
        // Draw "-" symbol with improved visibility
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          "-",
          posX - width/2 - buttonPadding,
          posY
        );
        
        // Add more visible hint text on a semi-transparent background
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(posX - 75, posY + height/2 + 15, 150, 30);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Nhấn + hoặc - để điều chỉnh kích thước', posX, posY + height/2 + 30);
      }
      
    } catch (e) {
      console.error('Error drawing logo:', e);
    }
    
    // Restore context state
    ctx.restore();
  };
  
  // Debug loadedLogos
  console.log('Available logos in JerseyFront:', loadedLogos.size);
  console.log('Logo positions in JerseyFront:', Array.from(logoPositions.entries()));
  console.log('Logo array in JerseyFront:', logos);
  
  // Draw logos based on position - first draw chest positions
  logos.forEach(logo => {
    console.log(`Processing logo: ${logo.id}, position: ${logo.position}`);
    
    if (!logo.id) {
      console.log('Logo missing id, skipping');
      return;
    }
    
    const img = loadedLogos.get(logo.id);
    if (!img) {
      console.log(`No loaded image found for logo ${logo.id}`);
      return;
    }
    
    if (logo.position === 'sleeve_left' || logo.position === 'sleeve_right') {
      return; // Skip sleeve logos for now, will handle separately
    }
    
    const position = logoPositions.get(logo.id) || { 
      x: logo.position === 'chest_left' ? 80 : 
         logo.position === 'chest_right' ? 220 : 150,
      y: logo.position === 'chest_center' ? 100 : 60,
      scale: 1.0
    };
    
    console.log(`Drawing chest logo: ${logo.id} at position:`, position);
    
    // Use enhanced drawing function with proper dimensions
    drawLogo(img, position.x, position.y, position.scale, logo.id);
  });
  
  // Draw logos on sleeves (separately to control layering)
  logos.forEach(logo => {
    if (!logo.id || logo.position !== 'sleeve_left' && logo.position !== 'sleeve_right') {
      return;
    }
    
    const img = loadedLogos.get(logo.id);
    if (!img) {
      console.log(`No loaded image found for sleeve logo ${logo.id}`);
      return;
    }
    
    const position = logoPositions.get(logo.id) || 
      (logo.position === 'sleeve_left' ? { x: 30, y: 40, scale: 1.0 } : { x: 270, y: 40, scale: 1.0 });
    
    console.log(`Drawing sleeve logo: ${logo.id} at position:`, position);
    
    // Use enhanced drawing function with smaller dimensions for sleeves
    drawLogo(img, position.x, position.y, position.scale, logo.id);
  });
  
  return null; // This component just draws on the canvas, doesn't return JSX
};
