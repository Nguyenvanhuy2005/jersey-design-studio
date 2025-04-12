
import React, { useEffect, useRef, useState } from 'react';
import { Logo, PrintConfig } from '@/types';
import { loadLogoImages, getFont } from '@/utils/jersey-utils';
import { loadCustomFont } from '@/utils/font-utils';
import { useDragLogos } from '@/components/jersey/useDragLogos';
import { JerseyFront } from '@/components/jersey/JerseyFront';
import { JerseyBack } from '@/components/jersey/JerseyBack';

interface CanvasJerseyProps {
  teamName: string;
  playerName?: string;
  playerNumber?: number;
  logos?: Logo[];
  view: 'front' | 'back';
  printConfig?: PrintConfig;
}

export function CanvasJersey({ 
  teamName, 
  playerName, 
  playerNumber, 
  logos = [], 
  view,
  printConfig
}: CanvasJerseyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedLogos, setLoadedLogos] = useState<Map<string, HTMLImageElement>>(new Map());
  const [logoPositions, setLogoPositions] = useState<Map<string, { x: number, y: number }>>(new Map());
  const [loadedFont, setLoadedFont] = useState<boolean>(false);
  const [fontFace, setFontFace] = useState<FontFace | null>(null);
  
  // Custom hook for logo dragging functionality
  const { startDrag, drag, endDrag } = useDragLogos({
    logos,
    logoPositions,
    setLogoPositions
  });

  // Load custom font if provided
  useEffect(() => {
    if (printConfig?.customFontUrl && printConfig.customFontFile) {
      const fontName = printConfig.customFontFile.name.split('.')[0];
      
      loadCustomFont(printConfig.customFontUrl, fontName)
        .then(loadedFont => {
          if (loadedFont) {
            setFontFace(loadedFont);
            setLoadedFont(true);
          }
        });
    }
  }, [printConfig?.customFontUrl, printConfig?.customFontFile]);

  // Load logos when available
  useEffect(() => {
    loadLogoImages(logos, logoPositions)
      .then(logoMap => {
        setLoadedLogos(logoMap);
      });
  }, [logos]);

  // Draw jersey on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Only proceed if the custom font is loaded or if no custom font is needed
    if ((printConfig?.customFontUrl && !loadedFont) && 
        !['Arial', 'Times New Roman', 'Helvetica', 'Roboto', 'Open Sans'].includes(printConfig?.font || 'Arial')) {
      // Wait for font to load
      setTimeout(() => {
        // Force a re-render
        setLoadedFont(prev => !prev);
      }, 100);
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get the font to use
    const fontToUse = getFont(printConfig);

    // Draw the appropriate jersey view
    if (view === 'front') {
      // Render front jersey
      JerseyFront({
        ctx,
        playerNumber,
        loadedLogos,
        logoPositions,
        logos,
        fontFamily: fontToUse
      });
    } else {
      // Render back jersey
      JerseyBack({
        ctx,
        teamName,
        playerName,
        playerNumber,
        fontFamily: fontToUse
      });
    }
    
  }, [teamName, playerName, playerNumber, loadedLogos, view, logoPositions, logos, printConfig, loadedFont]);

  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={300} 
      className="jersey-canvas mx-auto"
      onMouseDown={startDrag}
      onMouseMove={drag}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
    />
  );
}
