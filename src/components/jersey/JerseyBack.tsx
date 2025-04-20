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
  console.log(`Rendering JerseyBack with data: teamName=${teamName}, playerName=${playerName}, playerNumber=${playerNumber}`);
  
  // Draw the basic jersey shape using utility function
  drawBasicJersey(ctx);
  
  // Setup canvas for text rendering
  setupCanvas(ctx);
  
  // Draw player name
  if (playerName) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = 120;
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    const playerNameDisplayed = playerName.length > 15 ? playerName.substring(0, 15) + '...' : playerName;
    ctx.fillText(playerNameDisplayed, 150, 80);
    console.log(`Drew player name: ${playerNameDisplayed}`);
  }
  
  // Draw player number
  if (playerNumber) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = 400;
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    ctx.fillText(playerNumber, 150, 160);
    console.log(`Drew player number: ${playerNumber}`);
  }
  
  // Draw team name
  if (teamName) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = 120;
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    ctx.fillText(teamName, 150, 240);
    console.log(`Drew team name: ${teamName}`);
  }
  
  return null;
};
