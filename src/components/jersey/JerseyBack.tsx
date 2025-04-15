
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
  // Clear the canvas before drawing
  const canvasWidth = ctx.canvas.width / window.devicePixelRatio;
  const canvasHeight = ctx.canvas.height / window.devicePixelRatio;
  
  console.log(`Rendering JerseyBack on canvas ${canvasWidth}x${canvasHeight}`);
  console.log(`JerseyBack data: teamName=${teamName}, playerName=${playerName}, playerNumber=${playerNumber}`);
  
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
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
  
  // Draw player name (IN DÒNG 1 - upper back - above number) - Fixed position and size
  if (playerName) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = 25; // Fixed font size 25px
    ctx.font = fontFamily.replace(/\d+px/, `${fontSize}px`); // Adjust size for player name
    const playerNameDisplayed = playerName.length > 15 ? playerName.substring(0, 15) + '...' : playerName;
    // Fixed position: center, 50px from top (5cm from collar)
    ctx.fillText(playerNameDisplayed, 150, 50, 180);
    console.log(`Drew player name: ${playerNameDisplayed} with font: ${ctx.font}`);
  }
  
  // Draw player number (IN DÒNG 2 - middle back - bold number) - Fixed position and size
  // Increased font size from 100px to 180px as requested
  if (playerNumber) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = 180; // Increased font size to 180px as requested
    ctx.font = fontFamily.replace(/\d+px/, `${fontSize}px bold`); // Adjust size for player number and make it bold
    
    // Fixed position: center, 150px from top (15cm from top)
    ctx.fillText(playerNumber, 150, 150, 180);
    console.log(`Drew player number: ${playerNumber} with font: ${ctx.font}`);
  }
  
  // Draw team name (IN DÒNG 3 - lower back - below number) - Fixed position and size
  if (teamName) {
    ctx.fillStyle = '#1A1A1A';
    const fontSize = 25; // Fixed font size 25px
    ctx.font = fontFamily.replace(/\d+px/, `${fontSize}px`); // Adjust size for team name
    
    // Fixed position: center, 220px from top (22cm from top / 7cm below number)
    ctx.fillText(teamName, 150, 220, 180);
    console.log(`Drew team name: ${teamName} with font: ${ctx.font}`);
  }
  
  return null; // This component just draws on the canvas, doesn't return JSX
};
