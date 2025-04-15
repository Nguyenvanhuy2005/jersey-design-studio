
import React from 'react';

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
  // Use raw canvas dimensions without devicePixelRatio adjustment
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;
  
  console.log(`Rendering JerseyBack on canvas ${canvasWidth}x${canvasHeight}`);
  console.log(`JerseyBack data: teamName=${teamName}, playerName=${playerName}, playerNumber=${playerNumber}`);
  console.log(`Using font family: ${fontFamily}`);
  
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
  
  // Draw player name (top) - positioned at the upper part of jersey
  if (playerName) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = 90;
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    const playerNameDisplayed = playerName.length > 15 ? playerName.substring(0, 15) + '...' : playerName;
    ctx.fillText(playerNameDisplayed, 150, 80); // Centered horizontally (150), upper back (80)
    console.log(`Drew player name: ${playerNameDisplayed} with font: ${ctx.font}`);
  }
  
  // Draw player number (middle) - positioned in center of jersey
  if (playerNumber) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = 300;
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    ctx.fillText(playerNumber, 150, 160); // Centered horizontally (150), middle of jersey (160)
    console.log(`Drew player number: ${playerNumber} with font: ${ctx.font}`);
  }
  
  // Draw team name (bottom) - positioned at lower back
  if (teamName) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = 90;
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    ctx.fillText(teamName, 150, 240); // Centered horizontally (150), lower back (240)
    console.log(`Drew team name: ${teamName} with font: ${ctx.font}`);
  }
  
  return null;
};

