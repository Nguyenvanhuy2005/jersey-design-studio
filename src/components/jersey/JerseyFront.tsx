import React from 'react';
import { Logo, DesignData } from '@/types';
import { drawBasicJersey, setupCanvas } from '@/utils/jersey-drawing-utils';

interface JerseyFrontProps {
  ctx: CanvasRenderingContext2D;
  playerNumber?: string;
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

const FIXED_POSITIONS = {
  'chest_left': { x: 80, y: 50, scale: 0.7 },
  'chest_right': { x: 220, y: 50, scale: 0.7 },
  'chest_center': { x: 150, y: 100, scale: 1.0 },
  'sleeve_left': { x: 30, y: 50, scale: 0.5 },
  'sleeve_right': { x: 270, y: 50, scale: 0.5 }
};

const LOGO_SCALES = {
  'chest_left': 0.7,
  'chest_right': 0.7,
  'chest_center': 1.0,
  'sleeve_left': 0.5,
  'sleeve_right': 0.5
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
  
  let jerseyColor = isGoalkeeper ? '#4CAF50' : '#FFD700';
  
  console.log(`Rendering JerseyFront on canvas ${canvasWidth}x${canvasHeight} with ${loadedLogos.size} logos, isGoalkeeper: ${isGoalkeeper}`);
  
  drawBasicJersey(ctx, jerseyColor);
  setupCanvas(ctx);
  
  if (designData?.upper_text?.enabled && designData.upper_text.content) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = 50;
    const font = designData?.font_number?.font || numberFontFamily || 'Arial';
    ctx.font = `bold ${fontSize}px "${font}"`;
    ctx.fillText(designData.upper_text.content, 150, 90);
    console.log(`Drew upper text with font: ${font}`);
  }

  if (designData?.chest_number?.enabled && playerNumber !== undefined) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = 50;
    const font = designData?.font_number?.font || numberFontFamily || 'Arial';
    ctx.font = `bold ${fontSize}px "${font}"`;
    ctx.fillText(playerNumber.toString(), 150, 140);
    console.log(`Drew chest number with font: ${font}`);
  }

  if (designData?.lower_text?.enabled && designData.lower_text.content) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = 50;
    const font = designData?.font_number?.font || numberFontFamily || 'Arial';
    ctx.font = `bold ${fontSize}px "${font}"`;
    ctx.fillText(designData.lower_text.content, 150, 190);
    console.log(`Drew lower text with font: ${font}`);
  }
  
  if (loadedLogos.size > 0) {
    console.log(`Drawing ${loadedLogos.size} logos on jersey`);
    
    logos.forEach(logo => {
      if (!logo.id) {
        console.warn(`Logo missing ID:`, logo);
        return;
      }
      
      if (logo.position === 'pants') return;
      
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
        const fixedPosition = FIXED_POSITIONS[logo.position as keyof typeof FIXED_POSITIONS];
        if (!fixedPosition) {
          console.warn(`No fixed position defined for logo position: ${logo.position}`);
          return;
        }

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
        
        console.log(`Drew logo ${logo.id} at fixed position (${fixedPosition.x},${fixedPosition.y}) with scale ${scale}`);
      } catch (error) {
        console.error(`Error drawing logo ${logo.id}:`, error);
      }
    });
  }
  
  console.log("JerseyFront rendering complete");
  
  return null;
};
