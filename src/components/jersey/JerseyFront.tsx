import React from 'react';
import { Logo, DesignData } from '@/types';

interface JerseyFrontProps {
  ctx: CanvasRenderingContext2D;
  playerNumber?: number;  // Keep as number for backward compatibility
  loadedLogos: Map<string, HTMLImageElement>;
  logoPositions: Map<string, { x: number, y: number, scale: number }>;
  logos: Logo[];
  fontFamily: string;
  numberFontFamily: string;
  highQuality?: boolean;
  selectedLogo?: string | null;
  onLogoMove?: (id: string, x: number, y: number) => void;
  onLogoResize?: (id: string, scale: number) => void;
  onLogoDelete?: (id: string) => void;
  designData?: Partial<DesignData>;
}

// Fixed positions for logos (in canvas coordinates)
const FIXED_POSITIONS = {
  'chest_left': { x: 80, y: 50, scale: 0.7 },   // Left chest logo
  'chest_right': { x: 220, y: 50, scale: 0.7 }, // Right chest logo
  'chest_center': { x: 150, y: 100, scale: 1.0 }, // Center chest logo
  'sleeve_left': { x: 30, y: 50, scale: 0.5 },  // Left sleeve logo
  'sleeve_right': { x: 270, y: 50, scale: 0.5 } // Right sleeve logo
};

// Fixed sizes for logos (relative to base size)
const LOGO_SCALES = {
  'chest_left': 0.7,   // 70% of base size (7cm x 7cm)
  'chest_right': 0.7,  // 70% of base size
  'chest_center': 1.0, // 100% of base size (10cm x 10cm)
  'sleeve_left': 0.5,  // 50% of base size (5cm x 5cm)
  'sleeve_right': 0.5  // 50% of base size
};

export const JerseyFront = ({
  ctx,
  playerNumber,
  loadedLogos,
  logoPositions,
  logos,
  fontFamily,
  numberFontFamily,
  highQuality = false,
  selectedLogo,
  onLogoMove,
  onLogoResize,
  onLogoDelete,
  designData
}: JerseyFrontProps) => {
  // Clear canvas
  const canvasWidth = ctx.canvas.width / window.devicePixelRatio;
  const canvasHeight = ctx.canvas.height / window.devicePixelRatio;
  
  // Choose jersey color based on uniform type from designData
  let jerseyColor = '#FFD700'; // Default is gold/yellow
  if (designData?.uniform_type === 'goalkeeper') {
    jerseyColor = '#4CAF50'; // Green for goalkeeper
  }
  
  console.log(`Rendering JerseyFront on canvas ${canvasWidth}x${canvasHeight} with ${loadedLogos.size} logos`);
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Draw front jersey - main body
  ctx.fillStyle = jerseyColor;
  ctx.beginPath();
  ctx.moveTo(80, 0);
  ctx.lineTo(220, 0);
  ctx.lineTo(250, 80);
  ctx.lineTo(250, 300);
  ctx.lineTo(50, 300);
  ctx.lineTo(50, 80);
  ctx.closePath();
  ctx.fill();
  
  // Draw collar
  ctx.fillStyle = '#1A1A1A'; // Black collar
  ctx.beginPath();
  ctx.moveTo(120, 0);
  ctx.lineTo(180, 0);
  ctx.lineTo(180, 30);
  ctx.arc(150, 30, 30, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  
  // Draw sleeves
  ctx.fillStyle = jerseyColor;
  ctx.beginPath();
  ctx.moveTo(80, 0);
  ctx.lineTo(50, 80);
  ctx.lineTo(0, 100);
  ctx.lineTo(10, 50);
  ctx.lineTo(50, 20);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(220, 0);
  ctx.lineTo(250, 80);
  ctx.lineTo(300, 100);
  ctx.lineTo(290, 50);
  ctx.lineTo(250, 20);
  ctx.closePath();
  ctx.fill();
  
  // Set high quality text rendering
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  
  // Draw chest number if enabled in designData - fixed position at center chest
  if (designData?.chest_number?.enabled && playerNumber !== undefined) {
    ctx.fillStyle = designData.chest_number.color === 'Đen' ? '#1A1A1A' : '#FFFFFF';
    const fontSize = 40; // Fixed size for chest number
    ctx.font = `bold ${fontSize}px ${numberFontFamily.split(',')[0].replace(/['"]+/g, '')}`;
    ctx.fillText(playerNumber.toString(), 150, 140); 
  }
  
  // Draw logos with fixed positions and sizes
  if (loadedLogos.size > 0) {
    logos.forEach(logo => {
      if (!logo.id || logo.position === 'pants') return;
      
      const positionKey = `logo_${logo.position}` as keyof DesignData;
      if (designData && designData[positionKey] && !(designData[positionKey] as any)?.enabled) {
        return;
      }
      
      const img = loadedLogos.get(logo.id);
      if (!img) return;
      
      try {
        const fixedPosition = FIXED_POSITIONS[logo.position as keyof typeof FIXED_POSITIONS];
        if (!fixedPosition) return;

        const scale = LOGO_SCALES[logo.position as keyof typeof LOGO_SCALES] || 1.0;
        
        const baseSize = 100;
        const logoWidth = baseSize * scale;
        const logoHeight = baseSize * scale;
        
        const aspectRatio = img.width / img.height;
        let drawWidth = logoWidth;
        let drawHeight = logoHeight;
        
        if (aspectRatio > 1) {
          drawHeight = drawWidth / aspectRatio;
        } else {
          drawWidth = drawHeight * aspectRatio;
        }
        
        ctx.drawImage(
          img, 
          fixedPosition.x - drawWidth/2,
          fixedPosition.y - drawHeight/2, 
          drawWidth, 
          drawHeight
        );
      } catch (error) {
        console.error(`Error drawing logo ${logo.id}:`, error);
      }
    });
  }
  
  console.log("JerseyFront rendering complete");
  
  return null; // This component just draws on the canvas, doesn't return JSX
};
