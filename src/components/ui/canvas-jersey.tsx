
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
  
  // Device pixel ratio for high-resolution displays
  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  
  // Canvas dimensions - for high-resolution rendering
  const canvasWidth = 300;
  const canvasHeight = 300;

  // Custom hook for logo dragging functionality
  const { startDrag, drag, endDrag } = useDragLogos({
    logos,
    logoPositions,
    setLogoPositions
  });

  // Debug loaded logos
  useEffect(() => {
    console.log('Current logos prop:', logos);
  }, [logos]);

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

  // Load logos when available - with high-quality settings
  useEffect(() => {
    if (logos && logos.length > 0) {
      console.log("Attempting to load logos:", logos.length);
      
      logos.forEach(logo => {
        console.log(`Logo: ${logo.id}, position: ${logo.position}, has file: ${!!logo.file}, preview URL: ${logo.previewUrl?.substring(0, 30)}...`);
      });
      
      loadLogoImages(logos, logoPositions, true)
        .then(logoMap => {
          console.log(`Successfully loaded ${logoMap.size} logos`);
          if (logoMap.size !== logos.length) {
            console.warn(`Warning: Only ${logoMap.size} out of ${logos.length} logos were loaded`);
          }
          setLoadedLogos(logoMap);
        })
        .catch(err => {
          console.error("Error loading logos:", err);
        });
    } else {
      console.log("No logos to load");
      setLoadedLogos(new Map());
    }
  }, [logos]);

  // Configure and render the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('Canvas ref not available');
      return;
    }

    console.log(`Setting up canvas with pixel ratio: ${pixelRatio}`);
    
    // Set the canvas dimensions based on device pixel ratio
    canvas.width = canvasWidth * pixelRatio;
    canvas.height = canvasHeight * pixelRatio;
    
    // Set the display size to maintain visual dimensions
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    // Scale the context to match the device pixel ratio
    ctx.scale(pixelRatio, pixelRatio);
    
    // Enable high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) {
      (ctx as any).imageSmoothingQuality = 'high';
    }

    // Only proceed if the custom font is loaded or if no custom font is needed
    if ((printConfig?.customFontUrl && !loadedFont) && 
        !['Arial', 'Times New Roman', 'Helvetica', 'Roboto', 'Open Sans'].includes(printConfig?.font || 'Arial')) {
      console.log('Waiting for custom font to load...');
      // Wait for font to load
      setTimeout(() => {
        // Force a re-render
        setLoadedFont(prev => !prev);
      }, 100);
      return;
    }

    console.log(`Rendering jersey view: ${view}, with ${loadedLogos.size} loaded logos`);
    
    // Clear canvas with proper scaling
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Get the font to use
    const fontToUse = getFont(printConfig);

    // Draw the appropriate jersey view with proper scaling
    if (view === 'front') {
      console.log('Rendering front jersey view');
      // Render front jersey
      JerseyFront({
        ctx,
        playerNumber,
        loadedLogos,
        logoPositions,
        logos: logos || [],
        fontFamily: fontToUse,
        highQuality: true
      });
    } else {
      console.log('Rendering back jersey view');
      // Render back jersey
      JerseyBack({
        ctx,
        teamName,
        playerName,
        playerNumber,
        fontFamily: fontToUse
      });
    }
    
  }, [teamName, playerName, playerNumber, loadedLogos, view, logoPositions, logos, printConfig, loadedFont, pixelRatio]);

  return (
    <canvas 
      ref={canvasRef} 
      width={canvasWidth * pixelRatio} 
      height={canvasHeight * pixelRatio} 
      className="jersey-canvas mx-auto"
      onMouseDown={startDrag}
      onMouseMove={drag}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      style={{
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`
      }}
    />
  );
}
