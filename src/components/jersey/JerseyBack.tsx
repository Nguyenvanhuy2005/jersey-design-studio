
import React from 'react';
import { getFont } from '@/utils/jersey-utils';

interface JerseyBackProps {
  ctx: CanvasRenderingContext2D;
  teamName?: string;
  playerName?: string;
  playerNumber?: number;
  fontFamily: string;
}

export const JerseyBack = ({ 
  ctx, 
  teamName, 
  playerName, 
  playerNumber,
  fontFamily
}: JerseyBackProps) => {
  // Draw back jersey
  ctx.fillStyle = '#FFD700'; // Yellow jersey
  ctx.beginPath();
  ctx.moveTo(50, 0);
  ctx.lineTo(250, 0);
  ctx.lineTo(250, 300);
  ctx.lineTo(50, 300);
  ctx.closePath();
  ctx.fill();
  
  // Draw collar
  ctx.fillStyle = '#1A1A1A'; // Black collar
  ctx.beginPath();
  ctx.moveTo(125, 0);
  ctx.lineTo(175, 0);
  ctx.lineTo(175, 20);
  ctx.lineTo(125, 20);
  ctx.closePath();
  ctx.fill();
  
  // Draw sleeves
  ctx.fillStyle = '#FFD700'; // Yellow sleeves
  ctx.beginPath();
  ctx.moveTo(50, 0);
  ctx.lineTo(20, 80);
  ctx.lineTo(50, 80);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(250, 0);
  ctx.lineTo(280, 80);
  ctx.lineTo(250, 80);
  ctx.closePath();
  ctx.fill();
  
  // Set high quality text rendering
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  
  // Draw player name (upper back - above number)
  if (playerName) {
    ctx.fillStyle = '#1A1A1A';
    ctx.font = fontFamily.replace('20px', '24px'); // Adjust size for player name
    const playerNameDisplayed = playerName.length > 15 ? playerName.substring(0, 15) + '...' : playerName;
    ctx.fillText(playerNameDisplayed, 150, 50, 180);
  }
  
  // Draw player number (center back)
  if (playerNumber !== undefined) {
    ctx.fillStyle = '#1A1A1A';
    ctx.font = fontFamily.replace('20px', '100px'); // Adjust size for player number
    ctx.fillText(playerNumber.toString(), 150, 150);
  }
  
  // Draw team name (lower back - below number)
  if (teamName) {
    ctx.fillStyle = '#1A1A1A';
    ctx.font = fontFamily.replace('20px', '18px'); // Adjust size for team name
    const teamNameDisplayed = teamName.length > 20 ? teamName.substring(0, 20) + '...' : teamName;
    ctx.fillText(teamNameDisplayed, 150, 230, 180);
  }
  
  return null; // This component just draws on the canvas, doesn't return JSX
};
