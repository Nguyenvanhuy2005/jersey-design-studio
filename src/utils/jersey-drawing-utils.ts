
// Common utility functions for jersey drawing
export const drawBasicJersey = (
  ctx: CanvasRenderingContext2D,
  color: string = '#FFD700'
) => {
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;
  
  // Calculate proportional measurements
  const shoulderWidth = canvasWidth * 0.45; // 45% of canvas width
  const bodyWidth = canvasWidth * 0.65;     // 65% of canvas width
  const jerseyHeight = canvasHeight * 0.8;   // 80% of canvas height
  
  // Center the jersey horizontally
  const centerX = canvasWidth / 2;
  const startX = centerX - shoulderWidth / 2;
  const endX = centerX + shoulderWidth / 2;
  
  // Draw main body with angled shoulders - using relative positioning
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(startX, canvasHeight * 0.1);                    // Left shoulder start
  ctx.lineTo(endX, canvasHeight * 0.1);                      // Right shoulder
  ctx.lineTo(centerX + bodyWidth/2, canvasHeight * 0.3);     // Right armpit
  ctx.lineTo(centerX + bodyWidth/2, jerseyHeight);           // Right bottom
  ctx.lineTo(centerX - bodyWidth/2, jerseyHeight);           // Left bottom
  ctx.lineTo(centerX - bodyWidth/2, canvasHeight * 0.3);     // Left armpit
  ctx.closePath();
  ctx.fill();
  
  // Draw collar (black V-neck) - scaled proportionally
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.moveTo(centerX - shoulderWidth * 0.2, canvasHeight * 0.1);
  ctx.lineTo(centerX + shoulderWidth * 0.2, canvasHeight * 0.1);
  ctx.lineTo(centerX + shoulderWidth * 0.15, canvasHeight * 0.2);
  ctx.arc(centerX, canvasHeight * 0.2, shoulderWidth * 0.15, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  
  // Draw left sleeve - scaled with canvas
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(startX, canvasHeight * 0.1);
  ctx.lineTo(centerX - bodyWidth/2, canvasHeight * 0.3);
  ctx.lineTo(canvasWidth * 0.1, canvasHeight * 0.35);
  ctx.lineTo(canvasWidth * 0.15, canvasHeight * 0.2);
  ctx.closePath();
  ctx.fill();
  
  // Draw right sleeve - scaled with canvas
  ctx.beginPath();
  ctx.moveTo(endX, canvasHeight * 0.1);
  ctx.lineTo(centerX + bodyWidth/2, canvasHeight * 0.3);
  ctx.lineTo(canvasWidth * 0.9, canvasHeight * 0.35);
  ctx.lineTo(canvasWidth * 0.85, canvasHeight * 0.2);
  ctx.closePath();
  ctx.fill();
};

export const setupCanvas = (ctx: CanvasRenderingContext2D) => {
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
};

