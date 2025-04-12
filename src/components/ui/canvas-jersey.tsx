
import React, { useEffect, useRef, useState } from 'react';

interface CanvasJerseyProps {
  teamName: string;
  playerName?: string;
  playerNumber?: number;
  logoUrl?: string;
  view: 'front' | 'back';
}

export function CanvasJersey({ teamName, playerName, playerNumber, logoUrl, view }: CanvasJerseyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [logoPosition, setLogoPosition] = useState({ x: 80, y: 40 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  // Load logo if available
  useEffect(() => {
    if (logoUrl) {
      const img = new Image();
      img.src = logoUrl;
      img.onload = () => {
        setLogo(img);
      };
    }
  }, [logoUrl]);

  // Draw jersey on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw jersey base
    ctx.fillStyle = '#FFD700'; // Yellow jersey
    
    if (view === 'front') {
      // Draw front jersey
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
      ctx.lineTo(175, 30);
      ctx.lineTo(125, 30);
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

      // Draw player number on front center (chest)
      if (playerNumber) {
        ctx.fillStyle = '#1A1A1A';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(playerNumber.toString(), 150, 150);
      }
      
      // Draw logo on chest if available
      if (logo) {
        const logoWidth = 60;
        const logoHeight = 60;
        ctx.drawImage(logo, logoPosition.x, logoPosition.y, logoWidth, logoHeight);
      }
      
      // Additional positions for front
      // Draw chest left number/text (placeholder)
      ctx.fillStyle = '#1A1A1A';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText("L", 80, 100); // Left chest indicator
      
      // Draw chest right number/text (placeholder)
      ctx.fillText("R", 220, 100); // Right chest indicator
      
      // Draw sleeve left number (placeholder)
      ctx.font = 'bold 16px Arial';
      ctx.fillText("SL", 30, 60); // Sleeve left indicator
      
      // Draw sleeve right number (placeholder)
      ctx.fillText("SR", 270, 60); // Sleeve right indicator
      
    } else {
      // Draw back jersey
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
      
      // Draw player name (upper back - above number)
      if (playerName) {
        ctx.fillStyle = '#1A1A1A';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(playerName, 150, 50);
      }
      
      // Draw player number (center back)
      if (playerNumber) {
        ctx.fillStyle = '#1A1A1A';
        ctx.font = 'bold 100px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(playerNumber.toString(), 150, 150);
      }
      
      // Draw team name (lower back - below number)
      if (teamName) {
        ctx.fillStyle = '#1A1A1A';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(teamName, 150, 230);
      }
      
      // Draw pants number indicator
      ctx.font = 'bold 20px Arial';
      ctx.fillText("PANTS", 150, 280);
    }
    
  }, [teamName, playerName, playerNumber, logo, view, logoPosition]);

  // Handle logo dragging
  const startDrag = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (view !== 'front' || !logo) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is within logo
    if (
      x >= logoPosition.x && 
      x <= logoPosition.x + 60 && 
      y >= logoPosition.y && 
      y <= logoPosition.y + 60
    ) {
      setIsDragging(true);
      setStartPosition({ x, y });
    }
  };

  const drag = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const dx = x - startPosition.x;
    const dy = y - startPosition.y;
    
    setLogoPosition(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
    
    setStartPosition({ x, y });
  };

  const endDrag = () => {
    setIsDragging(false);
  };

  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={300} 
      className="jersey-canvas mx-auto"
      onMouseDown={startDrag}
      onMouseMove={drag}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
    />
  );
}
