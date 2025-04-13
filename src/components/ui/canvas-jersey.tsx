
import React, { forwardRef, useEffect, useRef } from 'react';
import { Logo, Player, PrintConfig, DesignData, FontConfig } from '@/types';
import { JerseyFront } from '../jersey/JerseyFront';
import { JerseyBack } from '../jersey/JerseyBack';
import { getTextFont } from '@/utils/jersey-utils';

export interface CanvasJerseyProps {
  player: Player;
  printConfig: PrintConfig;
  logos?: Logo[];
  viewMode?: 'front' | 'back';
  teamName?: string;
  designData?: DesignData;
}

export const CanvasJersey = forwardRef<HTMLCanvasElement, CanvasJerseyProps>(({
  player,
  printConfig,
  logos = [],
  viewMode = 'front',
  teamName,
  designData
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Use local ref if forwarded ref is not available
  const actualRef = (ref || canvasRef) as React.RefObject<HTMLCanvasElement>;

  useEffect(() => {
    const canvas = actualRef.current;
    if (!canvas) return;

    // Set canvas DPI for better rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // Clear the canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Get font configuration
    const fontConfigText: FontConfig = {
      font: designData?.font_text?.font || printConfig.fontText.font
    };

    const fontConfigNumber: FontConfig = {
      font: designData?.font_number?.font || printConfig.fontNumber.font
    };
    
    const fontFamily = getTextFont(
      viewMode === 'front' ? fontConfigText : fontConfigNumber
    );
    
    // Setup initial logo positions and images
    const loadedLogos = new Map<string, HTMLImageElement>();
    const logoPositions = new Map<string, { x: number, y: number, scale: number }>();
    
    // Render the appropriate view
    if (viewMode === 'front') {
      JerseyFront({
        ctx,
        playerNumber: player.number,
        loadedLogos,
        logoPositions,
        logos,
        fontFamily,
        highQuality: false
      });
    } else {
      JerseyBack({
        ctx,
        teamName,
        playerName: player.name,
        playerNumber: player.number,
        fontFamily
      });
    }
  }, [player, printConfig, logos, viewMode, teamName, designData, ref]);

  return (
    <canvas
      ref={actualRef as React.RefObject<HTMLCanvasElement>}
      className="w-full h-full" 
      style={{ width: '100%', height: '100%' }}
    />
  );
});

CanvasJersey.displayName = 'CanvasJersey';
