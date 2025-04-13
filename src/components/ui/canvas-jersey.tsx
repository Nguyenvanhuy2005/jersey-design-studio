
import React, { forwardRef, useEffect, useRef } from 'react';
import { Logo, Player, PrintConfig, DesignData } from '@/types';
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
  const actualRef = ref || canvasRef;

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

    const fontFamily = getTextFont(
      viewMode === 'front' 
        ? designData?.font_text?.font || printConfig.fontText.font
        : designData?.font_number?.font || printConfig.fontNumber.font
    );
    
    // Render the appropriate view
    if (viewMode === 'front') {
      JerseyFront({
        ctx,
        playerName: player.name,
        playerNumber: player.number,
        fontFamily,
        logos
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
  }, [player, printConfig, logos, viewMode, teamName, designData, actualRef]);

  return (
    <canvas
      ref={actualRef}
      className="w-full h-full" 
      style={{ width: '100%', height: '100%' }}
    />
  );
});

CanvasJersey.displayName = 'CanvasJersey';
