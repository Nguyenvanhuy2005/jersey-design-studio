
import React from 'react';
import { Logo, DesignData } from '@/types';

interface JerseyFrontProps {
  ctx: CanvasRenderingContext2D;
  playerNumber?: number;
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
  
  // Draw chest number if enabled in designData
  if (designData?.chest_number?.enabled && playerNumber !== undefined) {
    ctx.fillStyle = designData.chest_number.color === 'Đen' ? '#1A1A1A' : 
                    designData.chest_number.color === 'Trắng' ? '#FFFFFF' :
                    designData.chest_number.color === 'Đỏ' ? '#FF0000' :
                    designData.chest_number.color === 'Xanh' ? '#0000FF' : '#1A1A1A';
    const fontSize = 45;
    ctx.font = numberFontFamily.replace('20px', `${fontSize}px`);
    ctx.fillText(playerNumber.toString(), 150, 120);
    console.log(`Drew chest number: ${playerNumber} with font: ${ctx.font}`);
  }
  
  // Draw chest text if enabled in designData
  if (designData?.chest_text?.enabled && designData.chest_text.content) {
    ctx.fillStyle = designData.chest_text.color === 'Đen' ? '#1A1A1A' : 
                    designData.chest_text.color === 'Trắng' ? '#FFFFFF' :
                    designData.chest_text.color === 'Đỏ' ? '#FF0000' :
                    designData.chest_text.color === 'Xanh' ? '#0000FF' : '#1A1A1A';
    const fontSize = 24;
    ctx.font = fontFamily.replace('20px', `${fontSize}px`);
    ctx.fillText(designData.chest_text.content, 150, 80, 180);
    console.log(`Drew chest text: ${designData.chest_text.content} with font: ${ctx.font}`);
  }
  
  // Draw logos
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
      const position = logoPositions.get(logo.id);
      
      if (!img) {
        console.warn(`Image not found for logo ID ${logo.id}`);
        return;
      }
      
      if (!position) {
        console.warn(`Position not found for logo ID ${logo.id}`);
        return;
      }
      
      try {
        // Calculate logo dimensions with scale
        const logoWidth = img.width * position.scale;
        const logoHeight = img.height * position.scale;
        
        // Draw the logo
        ctx.drawImage(img, position.x - logoWidth/2, position.y - logoHeight/2, logoWidth, logoHeight);
        console.log(`Drew logo ${logo.id} at position ${position.x},${position.y} with scale ${position.scale}`);
        
        // Draw highlight if this logo is selected
        if (selectedLogo === logo.id) {
          ctx.strokeStyle = '#3b82f6'; // Blue highlight
          ctx.lineWidth = 2;
          ctx.strokeRect(position.x - logoWidth/2, position.y - logoHeight/2, logoWidth, logoHeight);
          
          // Draw resize handles on corners
          const handleSize = 8;
          ctx.fillStyle = 'white';
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1;
          
          // Top-left handle
          ctx.fillRect(position.x - logoWidth/2 - handleSize/2, position.y - logoHeight/2 - handleSize/2, handleSize, handleSize);
          ctx.strokeRect(position.x - logoWidth/2 - handleSize/2, position.y - logoHeight/2 - handleSize/2, handleSize, handleSize);
          
          // Top-right handle
          ctx.fillRect(position.x + logoWidth/2 - handleSize/2, position.y - logoHeight/2 - handleSize/2, handleSize, handleSize);
          ctx.strokeRect(position.x + logoWidth/2 - handleSize/2, position.y - logoHeight/2 - handleSize/2, handleSize, handleSize);
          
          // Bottom-left handle
          ctx.fillRect(position.x - logoWidth/2 - handleSize/2, position.y + logoHeight/2 - handleSize/2, handleSize, handleSize);
          ctx.strokeRect(position.x - logoWidth/2 - handleSize/2, position.y + logoHeight/2 - handleSize/2, handleSize, handleSize);
          
          // Bottom-right handle
          ctx.fillRect(position.x + logoWidth/2 - handleSize/2, position.y + logoHeight/2 - handleSize/2, handleSize, handleSize);
          ctx.strokeRect(position.x + logoWidth/2 - handleSize/2, position.y + logoHeight/2 - handleSize/2, handleSize, handleSize);
        }
      } catch (error) {
        console.error(`Error drawing logo ${logo.id}:`, error);
      }
    });
  }
  
  console.log("JerseyFront rendering complete");
  
  return null; // This component just draws on the canvas, doesn't return JSX
};
