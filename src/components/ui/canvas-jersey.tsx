
import React, { useEffect, useRef, useState } from 'react';
import { Logo, PrintConfig } from '@/types';

interface CanvasJerseyProps {
  teamName: string;
  playerName?: string;
  playerNumber?: number;
  logos?: Logo[];
  view: 'front' | 'back';
  printConfig?: PrintConfig;
}

export function CanvasJersey({ 
  teamName, 
  playerName, 
  playerNumber, 
  logos = [], 
  view,
  printConfig
}: CanvasJerseyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedLogos, setLoadedLogos] = useState<Map<string, HTMLImageElement>>(new Map());
  const [draggedLogo, setDraggedLogo] = useState<string | null>(null);
  const [logoPositions, setLogoPositions] = useState<Map<string, { x: number, y: number }>>(new Map());
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [loadedFont, setLoadedFont] = useState<boolean>(false);
  const [fontFace, setFontFace] = useState<FontFace | null>(null);

  // Load custom font if provided
  useEffect(() => {
    if (printConfig?.customFontUrl && printConfig.customFontFile) {
      const fontName = printConfig.customFontFile.name.split('.')[0];
      
      try {
        const font = new FontFace(fontName, `url(${printConfig.customFontUrl})`);
        
        font.load().then((loadedFont) => {
          // Add font to document
          document.fonts.add(loadedFont);
          setFontFace(loadedFont);
          setLoadedFont(true);
          console.log(`Custom font loaded: ${fontName}`);
        }).catch((error) => {
          console.error('Error loading custom font:', error);
        });
      } catch (error) {
        console.error('Error creating FontFace:', error);
      }
    }
  }, [printConfig?.customFontUrl, printConfig?.customFontFile]);

  // Load logos when available
  useEffect(() => {
    const logoMap = new Map<string, HTMLImageElement>();
    const positionMap = new Map<string, { x: number, y: number }>(logoPositions);
    
    // Default positions for each logo location
    const defaultPositions: Record<string, { x: number, y: number }> = {
      'chest_left': { x: 80, y: 40 },
      'chest_right': { x: 220, y: 40 },
      'chest_center': { x: 150, y: 80 },
      'sleeve_left': { x: 30, y: 40 },
      'sleeve_right': { x: 270, y: 40 }
    };
    
    logos.forEach(logo => {
      if (!logo.previewUrl) return;
      
      const img = new Image();
      img.src = logo.previewUrl;
      img.onload = () => {
        logoMap.set(logo.id!, img);
        
        // Set initial position if not already set
        if (!positionMap.has(logo.id!)) {
          const defaultPos = defaultPositions[logo.position] || { x: 150, y: 150 };
          positionMap.set(logo.id!, { ...defaultPos });
        }
        
        setLoadedLogos(new Map(logoMap));
        setLogoPositions(new Map(positionMap));
      };
    });
  }, [logos]);

  // Helper function to get font for text
  const getFont = (size: number = 20): string => {
    let fontFamily = printConfig?.font || 'Arial';
    
    // If it's a default font, add fallbacks
    if (['Arial', 'Times New Roman', 'Helvetica', 'Roboto', 'Open Sans'].includes(fontFamily)) {
      return `bold ${size}px ${fontFamily}, sans-serif`;
    } else {
      // For custom fonts, use the loaded font name
      return `bold ${size}px "${fontFamily}", sans-serif`;
    }
  };

  // Draw jersey on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Only proceed if the custom font is loaded or if no custom font is needed
    if ((printConfig?.customFontUrl && !loadedFont) && 
        !['Arial', 'Times New Roman', 'Helvetica', 'Roboto', 'Open Sans'].includes(printConfig?.font || 'Arial')) {
      // Wait for font to load
      setTimeout(() => {
        // Force a re-render
        setLoadedFont(prev => !prev);
      }, 100);
      return;
    }

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
        ctx.font = getFont(60);
        ctx.textAlign = 'center';
        ctx.fillText(playerNumber.toString(), 150, 150);
      }
      
      // Draw logos based on position
      if (loadedLogos.size > 0) {
        logos.forEach(logo => {
          const img = loadedLogos.get(logo.id!);
          if (!img || logo.position === 'sleeve_left' || logo.position === 'sleeve_right') return;
          
          const position = logoPositions.get(logo.id!) || { x: 150, y: 150 };
          const logoWidth = 60;
          const logoHeight = 60;
          
          ctx.drawImage(img, position.x, position.y, logoWidth, logoHeight);
        });
      }
      
      // Draw logos on sleeves
      if (loadedLogos.size > 0) {
        logos.forEach(logo => {
          if (logo.position !== 'sleeve_left' && logo.position !== 'sleeve_right') return;
          
          const img = loadedLogos.get(logo.id!);
          if (!img) return;
          
          const position = logoPositions.get(logo.id!) || 
            (logo.position === 'sleeve_left' ? { x: 30, y: 40 } : { x: 270, y: 40 });
          const logoWidth = 40;
          const logoHeight = 40;
          
          ctx.drawImage(img, position.x, position.y, logoWidth, logoHeight);
        });
      }
      
      // Position indicators (for guidance)
      ctx.fillStyle = '#1A1A1A';
      ctx.font = getFont(16);
      ctx.textAlign = 'center';
      
      // Chest center position
      ctx.fillText("C", 150, 100); 
      
      // Sleeve positions
      ctx.fillText("SL", 30, 60); // Sleeve left indicator
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
        ctx.font = getFont(24);
        ctx.textAlign = 'center';
        ctx.fillText(playerName, 150, 50);
      }
      
      // Draw player number (center back)
      if (playerNumber) {
        ctx.fillStyle = '#1A1A1A';
        ctx.font = getFont(100);
        ctx.textAlign = 'center';
        ctx.fillText(playerNumber.toString(), 150, 150);
      }
      
      // Draw team name (lower back - below number)
      if (teamName) {
        ctx.fillStyle = '#1A1A1A';
        ctx.font = getFont(18);
        ctx.textAlign = 'center';
        ctx.fillText(teamName, 150, 230);
      }
      
      // Draw pants number indicator
      ctx.font = getFont(20);
      ctx.fillText("PANTS", 150, 280);
    }
    
  }, [teamName, playerName, playerNumber, loadedLogos, view, logoPositions, logos, printConfig, loadedFont]);

  // Handle logo dragging
  const startDrag = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (view !== 'front' || loadedLogos.size === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is within any logo
    let draggedId: string | null = null;
    
    logos.forEach(logo => {
      const position = logoPositions.get(logo.id!) || { x: 0, y: 0 };
      const width = logo.position.includes('sleeve') ? 40 : 60;
      const height = logo.position.includes('sleeve') ? 40 : 60;
      
      if (
        x >= position.x && 
        x <= position.x + width && 
        y >= position.y && 
        y <= position.y + height
      ) {
        draggedId = logo.id!;
      }
    });
    
    if (draggedId) {
      setDraggedLogo(draggedId);
      setStartPosition({ x, y });
    }
  };

  const drag = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedLogo) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const dx = x - startPosition.x;
    const dy = y - startPosition.y;
    
    setLogoPositions(prev => {
      const updatedPositions = new Map(prev);
      const currentPosition = updatedPositions.get(draggedLogo) || { x: 0, y: 0 };
      
      updatedPositions.set(draggedLogo, {
        x: currentPosition.x + dx,
        y: currentPosition.y + dy
      });
      
      return updatedPositions;
    });
    
    setStartPosition({ x, y });
  };

  const endDrag = () => {
    setDraggedLogo(null);
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
