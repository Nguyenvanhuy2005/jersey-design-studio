
import React from 'react';
import { setupCanvas } from '@/utils/jersey-drawing-utils';

interface JerseyPantsProps {
  ctx: CanvasRenderingContext2D;
  playerNumber?: string;
  fontFamily: string;
  pants_number_enabled?: boolean;
  logo?: {
    image: HTMLImageElement;
    position: { x: number; y: number; scale: number };
  };
}

export const JerseyPants = ({ 
  ctx, 
  playerNumber, 
  fontFamily,
  pants_number_enabled = true,
  logo
}: JerseyPantsProps) => {
  // Lấy kích thước canvas thực tế để đảm bảo tỉ lệ đúng
  const canvasWidth = ctx.canvas.width / window.devicePixelRatio;
  const canvasHeight = ctx.canvas.height / window.devicePixelRatio;
  
  // Xóa canvas trước khi vẽ
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // Vẽ quần theo tỉ lệ của canvas
  const centerX = canvasWidth / 2;
  const pantsWidth = canvasWidth * 0.4; // 40% chiều rộng của canvas
  const pantsHeight = canvasHeight * 0.7; // 70% chiều cao của canvas
  
  // Vẽ quần với tỉ lệ mới
  ctx.fillStyle = '#1A1A1A';
  
  // Bên trái
  ctx.beginPath();
  ctx.moveTo(centerX - pantsWidth/4, canvasHeight * 0.15);
  ctx.lineTo(centerX + pantsWidth/4, canvasHeight * 0.15);
  ctx.lineTo(centerX + pantsWidth/2, canvasHeight * 0.8);
  ctx.lineTo(centerX - pantsWidth/2, canvasHeight * 0.8);
  ctx.closePath();
  ctx.fill();

  // Setup canvas for text rendering
  setupCanvas(ctx);
  
  // Draw player number if enabled
  if (playerNumber !== undefined && pants_number_enabled) {
    ctx.fillStyle = '#FFFFFF'; // Số màu trắng để tương phản với quần đen
    const fontSize = canvasWidth * 0.15; // 15% chiều rộng canvas
    ctx.font = fontFamily.replace(/\d+px/, `${fontSize}px`);
    ctx.fillText(playerNumber.toString(), centerX, canvasHeight * 0.45);
  }
  
  // Draw logo if provided
  if (logo?.image) {
    const logoWidth = canvasWidth * 0.15; // 15% chiều rộng canvas
    const logoHeight = canvasWidth * 0.15;
    const x = centerX + pantsWidth * 0.3;
    const y = canvasHeight * 0.35;
    
    ctx.drawImage(
      logo.image, 
      x - logoWidth/2, 
      y - logoHeight/2, 
      logoWidth, 
      logoHeight
    );
  }
  
  return null;
};
