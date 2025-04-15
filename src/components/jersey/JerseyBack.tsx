
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
  
  // Draw back jersey - main body with angled shoulders
  ctx.fillStyle = '#FFD700'; // Yellow jersey
  ctx.beginPath();
  ctx.moveTo(80, 0);  // Start at left shoulder
  ctx.lineTo(220, 0); // Right shoulder
  ctx.lineTo(250, 80); // Right armpit
  ctx.lineTo(250, 300); // Right bottom
  ctx.lineTo(50, 300); // Left bottom
  ctx.lineTo(50, 80);  // Left armpit
  ctx.closePath();
  ctx.fill();
  
  // Draw collar (black V-neck)
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.moveTo(120, 0);
  ctx.lineTo(180, 0);
  ctx.lineTo(180, 30);
  ctx.arc(150, 30, 30, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  
  // Draw left sleeve
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.moveTo(80, 0);
  ctx.lineTo(50, 80);
  ctx.lineTo(0, 100);
  ctx.lineTo(10, 50);
  ctx.closePath();
  ctx.fill();
  
  // Draw right sleeve
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
  
  // Draw player name (top) - positioned at the upper part of jersey
  if (playerName) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = 120;
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    const playerNameDisplayed = playerName.length > 15 ? playerName.substring(0, 15) + '...' : playerName;
    ctx.fillText(playerNameDisplayed, 150, 80);
    console.log(`Drew player name: ${playerNameDisplayed} with font: ${ctx.font}`);
  }
  
  // Draw player number (middle) - positioned in center of jersey
  if (playerNumber) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = 400;
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    ctx.fillText(playerNumber, 150, 160);
    console.log(`Drew player number: ${playerNumber} with font: ${ctx.font}`);
  }
  
  // Draw team name (bottom) - positioned at lower back
  if (teamName) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = 120;
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    ctx.fillText(teamName, 150, 240);
    console.log(`Drew team name: ${teamName} with font: ${ctx.font}`);
  }
  
  return null;
};

