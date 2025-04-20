
// Common utility functions for jersey drawing
export const drawBasicJersey = (
  ctx: CanvasRenderingContext2D,
  color: string = '#FFD700',
  scale: number = 1,
  isFront: boolean = true
) => {
  const canvasWidth = (ctx.canvas.width / window.devicePixelRatio) * scale;
  const canvasHeight = (ctx.canvas.height / window.devicePixelRatio) * scale;
  
  // Calculate proportional measurements
  const shoulderWidth = canvasWidth * 0.8;
  const bodyWidth = canvasWidth * 0.7;
  const jerseyBottom = canvasHeight * 0.85;
  
  // Center the jersey
  const centerX = canvasWidth / 2;
  
  // Draw main body
  ctx.fillStyle = color;
  ctx.beginPath();
  
  // Start from left shoulder
  ctx.moveTo(centerX - shoulderWidth/2, canvasHeight * 0.15);
  
  // Left side
  ctx.bezierCurveTo(
    centerX - shoulderWidth/2, canvasHeight * 0.3,
    centerX - bodyWidth/2, canvasHeight * 0.4,
    centerX - bodyWidth/2, jerseyBottom
  );
  
  // Bottom
  ctx.lineTo(centerX + bodyWidth/2, jerseyBottom);
  
  // Right side
  ctx.bezierCurveTo(
    centerX + bodyWidth/2, canvasHeight * 0.4,
    centerX + shoulderWidth/2, canvasHeight * 0.3,
    centerX + shoulderWidth/2, canvasHeight * 0.15
  );
  
  ctx.closePath();
  ctx.fill();

  // Draw collar based on front/back
  if (isFront) {
    drawFrontCollar(ctx, centerX, canvasHeight);
  } else {
    drawBackCollar(ctx, centerX, canvasHeight);
  }
  
  // Draw sleeves with cuffs
  drawSleeves(ctx, centerX, canvasHeight, shoulderWidth, color);

  // Add shadow effect for depth
  const gradient = ctx.createLinearGradient(0, 0, 0, jerseyBottom);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
  
  ctx.fillStyle = gradient;
  ctx.fill();
};

const drawFrontCollar = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  canvasHeight: number
) => {
  // V-neck collar for front
  const neckWidth = 40;
  const neckDepth = canvasHeight * 0.2;
  
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(centerX - neckWidth, canvasHeight * 0.15);
  ctx.lineTo(centerX, neckDepth);
  ctx.lineTo(centerX + neckWidth, canvasHeight * 0.15);
  ctx.closePath();
  ctx.fill();
  
  // Collar trim
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 2;
  ctx.stroke();
};

const drawBackCollar = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  canvasHeight: number
) => {
  // Round neck for back
  const neckWidth = 35;
  
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(centerX - neckWidth, canvasHeight * 0.15);
  ctx.quadraticCurveTo(
    centerX, canvasHeight * 0.17,
    centerX + neckWidth, canvasHeight * 0.15
  );
  ctx.closePath();
  ctx.fill();
  
  // Collar trim
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 2;
  ctx.stroke();
};

const drawSleeves = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  canvasHeight: number,
  shoulderWidth: number,
  color: string
) => {
  ctx.fillStyle = color;
  
  // Left sleeve with cuff
  ctx.beginPath();
  ctx.moveTo(centerX - shoulderWidth/2, canvasHeight * 0.15);
  ctx.quadraticCurveTo(
    centerX - shoulderWidth/1.5, canvasHeight * 0.25,
    centerX - shoulderWidth/1.3, canvasHeight * 0.35
  );
  // Draw cuff
  ctx.lineTo(centerX - shoulderWidth/1.4, canvasHeight * 0.35);
  ctx.quadraticCurveTo(
    centerX - shoulderWidth/1.8, canvasHeight * 0.3,
    centerX - shoulderWidth/2, canvasHeight * 0.15
  );
  ctx.fill();
  
  // Right sleeve with cuff
  ctx.beginPath();
  ctx.moveTo(centerX + shoulderWidth/2, canvasHeight * 0.15);
  ctx.quadraticCurveTo(
    centerX + shoulderWidth/1.5, canvasHeight * 0.25,
    centerX + shoulderWidth/1.3, canvasHeight * 0.35
  );
  // Draw cuff
  ctx.lineTo(centerX + shoulderWidth/1.4, canvasHeight * 0.35);
  ctx.quadraticCurveTo(
    centerX + shoulderWidth/1.8, canvasHeight * 0.3,
    centerX + shoulderWidth/2, canvasHeight * 0.15
  );
  ctx.fill();
  
  // Add cuff details
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  // Left cuff
  ctx.moveTo(centerX - shoulderWidth/1.3, canvasHeight * 0.35);
  ctx.lineTo(centerX - shoulderWidth/1.4, canvasHeight * 0.35);
  // Right cuff
  ctx.moveTo(centerX + shoulderWidth/1.3, canvasHeight * 0.35);
  ctx.lineTo(centerX + shoulderWidth/1.4, canvasHeight * 0.35);
  ctx.stroke();
};

export const setupCanvas = (ctx: CanvasRenderingContext2D) => {
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
};

// Improved shorts drawing with separate legs
export const drawPants = (
  ctx: CanvasRenderingContext2D,
  color: string = '#FFD700',
  scale: number = 1
) => {
  const canvasWidth = (ctx.canvas.width / window.devicePixelRatio) * scale;
  const canvasHeight = (ctx.canvas.height / window.devicePixelRatio) * scale;
  
  const centerX = canvasWidth / 2;
  const shortsTop = canvasHeight * 0.2;
  
  // Athletic shorts dimensions
  const waistWidth = canvasWidth * 0.5;
  const shortsLength = canvasHeight * 0.4;
  const legWidth = waistWidth * 0.3;
  
  ctx.fillStyle = color;
  
  // Draw waistband
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(
    centerX - waistWidth/2,
    shortsTop,
    waistWidth,
    5
  );
  
  // Main shorts color
  ctx.fillStyle = color;
  
  // Left leg
  ctx.beginPath();
  ctx.moveTo(centerX - waistWidth/2, shortsTop);
  ctx.lineTo(centerX - waistWidth/2, shortsTop + shortsLength);
  ctx.quadraticCurveTo(
    centerX - waistWidth/2 + legWidth/2, shortsTop + shortsLength + 10,
    centerX - waistWidth/4, shortsTop + shortsLength
  );
  ctx.lineTo(centerX - waistWidth/4, shortsTop);
  ctx.closePath();
  ctx.fill();
  
  // Right leg
  ctx.beginPath();
  ctx.moveTo(centerX + waistWidth/2, shortsTop);
  ctx.lineTo(centerX + waistWidth/2, shortsTop + shortsLength);
  ctx.quadraticCurveTo(
    centerX + waistWidth/2 - legWidth/2, shortsTop + shortsLength + 10,
    centerX + waistWidth/4, shortsTop + shortsLength
  );
  ctx.lineTo(centerX + waistWidth/4, shortsTop);
  ctx.closePath();
  ctx.fill();
  
  // Center piece
  ctx.beginPath();
  ctx.moveTo(centerX - waistWidth/4, shortsTop);
  ctx.lineTo(centerX - waistWidth/4, shortsTop + shortsLength - 10);
  ctx.lineTo(centerX + waistWidth/4, shortsTop + shortsLength - 10);
  ctx.lineTo(centerX + waistWidth/4, shortsTop);
  ctx.closePath();
  ctx.fill();

  // Add shadow effect for depth
  const gradient = ctx.createLinearGradient(0, shortsTop, 0, shortsTop + shortsLength);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
  
  ctx.fillStyle = gradient;
  ctx.fill();
};
