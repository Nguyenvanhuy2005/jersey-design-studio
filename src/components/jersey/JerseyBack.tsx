
import React from 'react';
import { drawBasicJersey, setupCanvas } from '@/utils/jersey-drawing-utils';
import { DesignData } from '@/types';

interface JerseyBackProps {
  ctx: CanvasRenderingContext2D;
  teamName?: string;
  playerName?: string;
  playerNumber?: string;
  fontFamily?: string;
  designData?: Partial<DesignData>;
}

export const JerseyBack = ({ 
  ctx, 
  teamName, 
  playerName, 
  playerNumber,
  fontFamily,
  designData
}: JerseyBackProps) => {
  console.log(`Rendering JerseyBack with fonts:`, {
    textFont: designData?.font_text?.font,
    numberFont: designData?.font_number?.font,
    fallbackFont: fontFamily
  });
  
  // Draw the basic jersey shape using utility function
  drawBasicJersey(ctx);
  
  // Setup canvas for text rendering
  setupCanvas(ctx);
  
  // Draw player name
  if (playerName) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = 35;
    const textFont = designData?.font_text?.font || fontFamily || 'Arial';
    ctx.font = `bold ${fontSize}px "${textFont}"`;
    const playerNameDisplayed = playerName.length > 15 ? playerName.substring(0, 15) + '...' : playerName;
    ctx.fillText(playerNameDisplayed, 150, 80);
    console.log(`Drew player name with font: ${textFont}`);
  }
  
  // Draw player number
  if (playerNumber) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = 140;
    const numberFont = designData?.font_number?.font || fontFamily || 'Arial';
    ctx.font = `bold ${fontSize}px "${numberFont}"`;
    ctx.fillText(playerNumber, 150, 180);
    console.log(`Drew player number with font: ${numberFont}`);
  }
  
  // Draw team name
  if (teamName) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = 35;
    const textFont = designData?.font_text?.font || fontFamily || 'Arial';
    ctx.font = `bold ${fontSize}px "${textFont}"`;
    ctx.fillText(teamName, 150, 260);
    console.log(`Drew team name with font: ${textFont}`);
  }
  
  return null;
};
