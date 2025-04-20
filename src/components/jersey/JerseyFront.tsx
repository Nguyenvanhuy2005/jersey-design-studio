import React from 'react';
import { Logo, DesignData } from '@/types';
import { drawBasicJersey, setupCanvas } from '@/utils/jersey-drawing-utils';

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

// Define proper positioning based on percentage of canvas
const FIXED_POSITIONS = {
  'chest_left': { x: 0.25, y: 0.25, scale: 0.7 },   // Left chest logo (25% from left)
  'chest_right': { x: 0.75, y: 0.25, scale: 0.7 },  // Right chest logo (75% from left)
  'chest_center': { x: 0.5, y: 0.35, scale: 1.0 },  // Center chest logo (centered)
  'sleeve_left': { x: 0.1, y: 0.25, scale: 0.5 },   // Left sleeve logo
  'sleeve_right': { x: 0.9, y: 0.25, scale: 0.5 }   // Right sleeve logo
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
  const canvasWidth = ctx.canvas.width / window.devicePixelRatio;
  const canvasHeight = ctx.canvas.height / window.devicePixelRatio;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // Draw the basic jersey shape
  drawBasicJersey(ctx, designData?.uniform_type === 'goalkeeper' ? '#4CAF50' : '#FFD700');
  
  // Setup canvas for text rendering
  setupCanvas(ctx);
  
  // Draw chest number with improved positioning
  if (designData?.chest_number?.enabled && playerNumber !== undefined) {
    ctx.fillStyle = '#1A1A1A';
    
    // Calculate responsive font size (larger than before)
    const fontSize = Math.min(80, canvasWidth * 0.25);
    
    // Use specific number font
    ctx.font = `bold ${fontSize}px ${numberFontFamily}`;
    
    // Center the number both horizontally and vertically
    ctx.fillText(
      playerNumber.toString(),
      canvasWidth * 0.5, // Centered horizontally
      canvasHeight * 0.45  // Positioned lower on chest
    );
  }
  
  // Draw chest text if enabled in designData
  if (designData?.chest_text?.enabled && designData.chest_text.content) {
    ctx.fillStyle = '#1A1A1A'; // Default color
    const fontSize = Math.min(24, canvasWidth * 0.08); // Responsive font size
    ctx.font = fontFamily.replace(/\d+px/, `${fontSize}px`);
    ctx.fillText(designData.chest_text.content, canvasWidth * 0.5, canvasHeight * 0.3, canvasWidth * 0.6);
  }
  
  // Draw logos with fixed positions and sizes
  if (loadedLogos.size > 0) {
    logos.forEach(logo => {
      if (!logo.id) {
        console.warn(`Logo missing ID:`, logo);
        return;
      }
      
      // Only front-visible logos (not pants logos)
      if (logo.position === 'pants') return;
      
      // Check if this logo's position is enabled in designData
      const positionKey = `logo_${logo.position}` as keyof DesignData;
      if (designData && designData[positionKey] && !(designData[positionKey] as any)?.enabled) {
        return;
      }
      
      const img = loadedLogos.get(logo.id);
      
      if (!img) {
        return;
      }
      
      try {
        // Get fixed position for this logo type as percentage of canvas
        const fixedPosition = FIXED_POSITIONS[logo.position as keyof typeof FIXED_POSITIONS];
        if (!fixedPosition) {
          return;
        }

        // Use fixed scale based on position
        const scale = LOGO_SCALES[logo.position as keyof typeof LOGO_SCALES] || 1.0;
        
        // Calculate logo dimensions with fixed scale
        const baseSize = canvasWidth * 0.30; // Base size for logos (30% of canvas width)
        const logoWidth = baseSize * scale;
        const logoHeight = baseSize * scale;
        
        // Calculate aspect ratio to maintain proportions
        const aspectRatio = img.width / img.height;
        let drawWidth = logoWidth;
        let drawHeight = logoHeight;
        
        if (aspectRatio > 1) {
          // Wider than tall
          drawHeight = drawWidth / aspectRatio;
        } else {
          // Taller than wide
          drawWidth = drawHeight * aspectRatio;
        }
        
        // Calculate position based on percentages of canvas dimensions
        const xPos = canvasWidth * fixedPosition.x;
        const yPos = canvasHeight * fixedPosition.y;
        
        // Draw the logo at fixed position with fixed size
        ctx.drawImage(
          img, 
          xPos - drawWidth/2,  // Center horizontally
          yPos - drawHeight/2, // Center vertically
          drawWidth, 
          drawHeight
        );
      } catch (error) {
        console.error(`Error drawing logo ${logo.id}:`, error);
      }
    });
  }
  
  return null;
};
