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
  const shoulderWidth = canvasWidth * 0.85;
  const bodyWidth = canvasWidth * 0.75;
  const jerseyBottom = canvasHeight * 0.85;
  
  // Center the jersey
  const centerX = canvasWidth / 2;
  
  // Draw main body
  ctx.fillStyle = color;
  ctx.beginPath();
  
  // Start from left shoulder
  ctx.moveTo(centerX - shoulderWidth/2, canvasHeight * 0.15);
  
  // Left side - straight line
  ctx.lineTo(centerX - bodyWidth/2, canvasHeight * 0.3);
  ctx.lineTo(centerX - bodyWidth/2, jerseyBottom);
  
  // Bottom - straight line
  ctx.lineTo(centerX + bodyWidth/2, jerseyBottom);
  
  // Right side - straight line
  ctx.lineTo(centerX + bodyWidth/2, canvasHeight * 0.3);
  ctx.lineTo(centerX + shoulderWidth/2, canvasHeight * 0.15);
  
  ctx.closePath();
  ctx.fill();

  // Draw collar based on front/back
  if (isFront) {
    drawFrontCollar(ctx, centerX, canvasHeight);
  } else {
    drawBackCollar(ctx, centerX, canvasHeight);
  }
  
  // Draw sleeves
  drawSleeves(ctx, centerX, canvasHeight, shoulderWidth);
};

const drawFrontCollar = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  canvasHeight: number
) => {
  // V-neck collar
  const neckWidth = 45;
  const neckDepth = canvasHeight * 0.22;
  
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.moveTo(centerX - neckWidth, canvasHeight * 0.15);
  ctx.lineTo(centerX, neckDepth);
  ctx.lineTo(centerX + neckWidth, canvasHeight * 0.15);
  ctx.closePath();
  ctx.fill();
};

const drawBackCollar = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  canvasHeight: number
) => {
  // Round neck for back
  const neckWidth = 40;
  
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.moveTo(centerX - neckWidth, canvasHeight * 0.15);
  ctx.quadraticCurveTo(
    centerX, canvasHeight * 0.17,
    centerX + neckWidth, canvasHeight * 0.15
  );
  ctx.closePath();
  ctx.fill();
};

const drawSleeves = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  canvasHeight: number,
  shoulderWidth: number
) => {
  const sleeveLength = canvasHeight * 0.25;
  const sleeveWidth = shoulderWidth * 0.2;
  
  // Left sleeve
  ctx.beginPath();
  ctx.moveTo(centerX - shoulderWidth/2, canvasHeight * 0.15);
  ctx.lineTo(centerX - shoulderWidth/2 - sleeveWidth, canvasHeight * 0.15 + sleeveLength);
  ctx.lineTo(centerX - shoulderWidth/2 + sleeveWidth, canvasHeight * 0.15 + sleeveLength);
  ctx.closePath();
  ctx.fill();
  
  // Right sleeve
  ctx.beginPath();
  ctx.moveTo(centerX + shoulderWidth/2, canvasHeight * 0.15);
  ctx.lineTo(centerX + shoulderWidth/2 + sleeveWidth, canvasHeight * 0.15 + sleeveLength);
  ctx.lineTo(centerX + shoulderWidth/2 - sleeveWidth, canvasHeight * 0.15 + sleeveLength);
  ctx.closePath();
  ctx.fill();
};

export const setupCanvas = (ctx: CanvasRenderingContext2D) => {
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
};

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
  
  // Main shorts color
  ctx.fillStyle = color;
  
  // Left leg
  ctx.beginPath();
  ctx.moveTo(centerX - waistWidth/2, shortsTop);
  ctx.lineTo(centerX - waistWidth/2, shortsTop + shortsLength);
  ctx.lineTo(centerX - waistWidth/4, shortsTop + shortsLength);
  ctx.lineTo(centerX - waistWidth/4, shortsTop);
  ctx.closePath();
  ctx.fill();
  
  // Right leg
  ctx.beginPath();
  ctx.moveTo(centerX + waistWidth/2, shortsTop);
  ctx.lineTo(centerX + waistWidth/2, shortsTop + shortsLength);
  ctx.lineTo(centerX + waistWidth/4, shortsTop + shortsLength);
  ctx.lineTo(centerX + waistWidth/4, shortsTop);
  ctx.closePath();
  ctx.fill();
  
  // Center piece
  ctx.beginPath();
  ctx.moveTo(centerX - waistWidth/4, shortsTop);
  ctx.lineTo(centerX - waistWidth/4, shortsTop + shortsLength);
  ctx.lineTo(centerX + waistWidth/4, shortsTop + shortsLength);
  ctx.lineTo(centerX + waistWidth/4, shortsTop);
  ctx.closePath();
  ctx.fill();

  // Draw waistband
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(
    centerX - waistWidth/2,
    shortsTop,
    waistWidth,
    5
  );
};
