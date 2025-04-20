
import React from 'react';
import { drawBasicJersey, setupCanvas } from '@/utils/jersey-drawing-utils';

interface JerseyBackProps {
  ctx: CanvasRenderingContext2D;
  teamName?: string;
  playerName?: string;
  playerNumber?: string;
  fontFamily: string;
}

export const JerseyBack = ({ 
  ctx, 
  teamName, 
  playerName, 
  playerNumber,
  fontFamily
}: JerseyBackProps) => {
  const canvasWidth = ctx.canvas.width / window.devicePixelRatio;
  const canvasHeight = ctx.canvas.height / window.devicePixelRatio;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // Draw the basic jersey shape with back collar
  drawBasicJersey(ctx, '#FFD700', 1, false);
  
  // Setup canvas for text rendering
  setupCanvas(ctx);
  
  // Draw player name (line 1)
  if (playerName) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = Math.min(35, canvasWidth * 0.11);
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    const playerNameDisplayed = playerName.length > 15 ? playerName.substring(0, 15) + '...' : playerName;
    ctx.fillText(playerNameDisplayed, canvasWidth / 2, canvasHeight * 0.25);
  }
  
  // Draw player number (line 2)
  if (playerNumber) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = Math.min(120, canvasWidth * 0.35);
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillText(playerNumber, canvasWidth / 2, canvasHeight * 0.5);
  }
  
  // Draw team name (line 3)
  if (teamName) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = Math.min(35, canvasWidth * 0.11);
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    const teamNameDisplayed = teamName.length > 15 ? teamName.substring(0, 15) + '...' : teamName;
    ctx.fillText(teamNameDisplayed, canvasWidth / 2, canvasHeight * 0.75);
  }
  
  return null;
};
