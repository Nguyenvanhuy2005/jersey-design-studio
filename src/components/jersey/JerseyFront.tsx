
import React from 'react';
import { Logo, DesignData } from '@/types';
import { drawBasicJersey, setupCanvas } from '@/utils/jersey-drawing-utils';

interface JerseyFrontProps {
  ctx: CanvasRenderingContext2D;
  playerNumber?: string;  // Changed from number to string
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
  isGoalkeeper?: boolean;
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
  designData,
  isGoalkeeper = false
}: JerseyFrontProps) => {
  const canvasWidth = ctx.canvas.width / window.devicePixelRatio;
  const canvasHeight = ctx.canvas.height / window.devicePixelRatio;
  
  // Choose jersey color based on uniform type
  let jerseyColor = isGoalkeeper ? '#4CAF50' : '#FFD700';
  
  console.log(`Rendering JerseyFront on canvas ${canvasWidth}x${canvasHeight} with ${loadedLogos.size} logos, isGoalkeeper: ${isGoalkeeper}`);
  
  // Draw the basic jersey shape using utility function
  drawBasicJersey(ctx, jerseyColor);
  
  // Setup canvas for text rendering
  setupCanvas(ctx);
  
  // Draw chest text OR chest number if enabled in designData
  if (designData?.chest_text && designData.chest_text.content && designData.chest_text.content.length > 0) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = 50;
    // Use the correct font for chest text (from font_text instead of font_number)
    const font = designData?.font_text?.font || fontFamily || 'Arial';
    ctx.font = `bold ${fontSize}px "${font}"`;
    ctx.fillText(designData.chest_text.content, 150, 140);
    console.log(`Drew chest text with font: ${font}`);
  } else if (designData?.chest_number?.enabled && playerNumber !== undefined) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = 50;
    const font = designData?.font_number?.font || numberFontFamily || 'Arial';
    ctx.font = `bold ${fontSize}px "${font}"`;
    ctx.fillText(playerNumber.toString(), 150, 140);
    console.log(`Drew chest number with font: ${font}`);
  }
  
  // Draw logos with fixed positions and sizes
  if (loadedLogos.size > 0) {
    console.log(`Drawing ${loadedLogos.size} logos on jersey`);
    
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
        console.log(`Logo ${logo.id} position ${logo.position} is disabled in designData`);
        return;
      }
      
      const img = loadedLogos.get(logo.id);
      
      if (!img) {
        console.warn(`Image not found for logo ID ${logo.id}`);
        return;
      }
      
      try {
        // Get fixed position for this logo type
        const fixedPosition = FIXED_POSITIONS[logo.position as keyof typeof FIXED_POSITIONS];
        if (!fixedPosition) {
          console.warn(`No fixed position defined for logo position: ${logo.position}`);
          return;
        }

        // Use fixed scale based on position
        const scale = LOGO_SCALES[logo.position as keyof typeof LOGO_SCALES] || 1.0;
        
        // Calculate logo dimensions with fixed scale
        const baseSize = 100; // Base size for logos (100px = 10cm)
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
        
        // Draw the logo at fixed position with fixed size
        ctx.drawImage(
          img, 
          fixedPosition.x - drawWidth/2,  // Center horizontally
          fixedPosition.y - drawHeight/2, // Center vertically
          drawWidth, 
          drawHeight
        );
        
        console.log(`Drew logo ${logo.id} at fixed position (${fixedPosition.x},${fixedPosition.y}) with scale ${scale}`);
      } catch (error) {
        console.error(`Error drawing logo ${logo.id}:`, error);
      }
    });
  }
  
  console.log("JerseyFront rendering complete");
  
  return null;
};
