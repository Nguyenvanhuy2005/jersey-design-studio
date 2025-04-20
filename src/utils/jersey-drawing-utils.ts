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
  const startX = centerX - shoulderWidth / 2;
  const endX = centerX + shoulderWidth / 2;
  
  // Draw main body with slight curve on sides
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(startX, canvasHeight * 0.15);
  ctx.lineTo(endX, canvasHeight * 0.15);
  // Right side with slight curve
  ctx.quadraticCurveTo(
    centerX + bodyWidth / 2 + 10, canvasHeight * 0.5,
    centerX + bodyWidth / 2, jerseyBottom
  );
  // Bottom
  ctx.lineTo(centerX - bodyWidth / 2, jerseyBottom);
  // Left side with slight curve
  ctx.quadraticCurveTo(
    centerX - bodyWidth / 2 - 10, canvasHeight * 0.5,
    startX, canvasHeight * 0.15
  );
  ctx.closePath();
  ctx.fill();

  // Draw white trim on bottom
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX - bodyWidth / 2, jerseyBottom);
  ctx.lineTo(centerX + bodyWidth / 2, jerseyBottom);
  ctx.stroke();

  // Draw collar based on front/back
  if (isFront) {
    drawFrontCollar(ctx, centerX, canvasHeight);
  } else {
    drawBackCollar(ctx, centerX, canvasHeight);
  }
  
  // Draw sleeves with white trim and shoulder detail
  drawSleeves(ctx, centerX, canvasHeight, shoulderWidth);

  // Add white shoulder detail (diagonal stripe)
  ctx.fillStyle = '#FFFFFF';
  // Left shoulder
  ctx.beginPath();
  ctx.moveTo(startX, canvasHeight * 0.15);
  ctx.lineTo(startX + shoulderWidth * 0.2, canvasHeight * 0.15);
  ctx.lineTo(centerX - bodyWidth / 2, canvasHeight * 0.3);
  ctx.closePath();
  ctx.fill();

  // Right shoulder
  ctx.beginPath();
  ctx.moveTo(endX - shoulderWidth * 0.2, canvasHeight * 0.15);
  ctx.lineTo(endX, canvasHeight * 0.15);
  ctx.lineTo(centerX + bodyWidth / 2, canvasHeight * 0.3);
  ctx.closePath();
  ctx.fill();
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

  // Add white trim to V-neck
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - neckWidth, canvasHeight * 0.15);
  ctx.lineTo(centerX, neckDepth);
  ctx.lineTo(centerX + neckWidth, canvasHeight * 0.15);
  ctx.stroke();
};

const drawBackCollar = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  canvasHeight: number
) => {
  // V-neck collar for back (same as front for consistency with design)
  const neckWidth = 45;
  const neckDepth = canvasHeight * 0.22;
  
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.moveTo(centerX - neckWidth, canvasHeight * 0.15);
  ctx.lineTo(centerX, neckDepth);
  ctx.lineTo(centerX + neckWidth, canvasHeight * 0.15);
  ctx.closePath();
  ctx.fill();

  // Add white trim to V-neck
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - neckWidth, canvasHeight * 0.15);
  ctx.lineTo(centerX, neckDepth);
  ctx.lineTo(centerX + neckWidth, canvasHeight * 0.15);
  ctx.stroke();
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
  
  // Add white trim to left sleeve
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - shoulderWidth/2 - sleeveWidth, canvasHeight * 0.15 + sleeveLength);
  ctx.lineTo(centerX - shoulderWidth/2 + sleeveWidth, canvasHeight * 0.15 + sleeveLength);
  ctx.stroke();
  
  // Right sleeve
  ctx.beginPath();
  ctx.moveTo(centerX + shoulderWidth/2, canvasHeight * 0.15);
  ctx.lineTo(centerX + shoulderWidth/2 + sleeveWidth, canvasHeight * 0.15 + sleeveLength);
  ctx.lineTo(centerX + shoulderWidth/2 - sleeveWidth, canvasHeight * 0.15 + sleeveLength);
  ctx.closePath();
  ctx.fill();
  
  // Add white trim to right sleeve
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX + shoulderWidth/2 + sleeveWidth, canvasHeight * 0.15 + sleeveLength);
  ctx.lineTo(centerX + shoulderWidth/2 - sleeveWidth, canvasHeight * 0.15 + sleeveLength);
  ctx.stroke();
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

  // Add white trim at bottom
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - waistWidth/2, shortsTop + shortsLength);
  ctx.lineTo(centerX + waistWidth/2, shortsTop + shortsLength);
  ctx.stroke();

  // Add white stripes on sides
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  
  // Left stripe
  ctx.beginPath();
  ctx.moveTo(centerX - waistWidth/4, shortsTop + 5);
  ctx.lineTo(centerX - waistWidth/3, shortsTop + shortsLength);
  ctx.stroke();
  
  // Right stripe
  ctx.beginPath();
  ctx.moveTo(centerX + waistWidth/4, shortsTop + 5);
  ctx.lineTo(centerX + waistWidth/3, shortsTop + shortsLength);
  ctx.stroke();
};