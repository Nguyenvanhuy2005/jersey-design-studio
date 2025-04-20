
// Common utility functions for jersey drawing
export const drawBasicJersey = (
  ctx: CanvasRenderingContext2D,
  color: string = '#FFD700'
) => {
  const canvasWidth = ctx.canvas.width / window.devicePixelRatio;
  const canvasHeight = ctx.canvas.height / window.devicePixelRatio;
  
  // Calculate proportional measurements using percentages
  const shoulderWidth = canvasWidth * 0.7;  // Increased from 0.45 to 0.7
  const bodyWidth = canvasWidth * 0.8;      // Increased from 0.65 to 0.8
  const jerseyHeight = canvasHeight * 0.85; // Increased from 0.8 to 0.85
  
  // Center the jersey horizontally
  const centerX = canvasWidth / 2;
  const startX = centerX - shoulderWidth / 2;
  const endX = centerX + shoulderWidth / 2;
  
  // Draw main body with angled shoulders - using relative positioning
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(startX, canvasHeight * 0.15);                  // Left shoulder start (moved down)
  ctx.lineTo(endX, canvasHeight * 0.15);                    // Right shoulder
  ctx.lineTo(centerX + bodyWidth/2, canvasHeight * 0.3);    // Right armpit
  ctx.lineTo(centerX + bodyWidth/2, jerseyHeight);          // Right bottom
  ctx.lineTo(centerX - bodyWidth/2, jerseyHeight);          // Left bottom
  ctx.lineTo(centerX - bodyWidth/2, canvasHeight * 0.3);    // Left armpit
  ctx.closePath();
  ctx.fill();
  
  // Draw collar (black V-neck) - scaled proportionally
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.moveTo(centerX - shoulderWidth * 0.15, canvasHeight * 0.15);
  ctx.lineTo(centerX + shoulderWidth * 0.15, canvasHeight * 0.15);
  ctx.lineTo(centerX + shoulderWidth * 0.1, canvasHeight * 0.22);
  ctx.arc(centerX, canvasHeight * 0.22, shoulderWidth * 0.1, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  
  // Draw left sleeve - scaled with canvas
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(startX, canvasHeight * 0.15);
  ctx.lineTo(centerX - bodyWidth/2, canvasHeight * 0.3);
  ctx.lineTo(canvasWidth * 0.12, canvasHeight * 0.35);  // Moved in from edge
  ctx.lineTo(canvasWidth * 0.15, canvasHeight * 0.2);
  ctx.closePath();
  ctx.fill();
  
  // Draw right sleeve - scaled with canvas
  ctx.beginPath();
  ctx.moveTo(endX, canvasHeight * 0.15);
  ctx.lineTo(centerX + bodyWidth/2, canvasHeight * 0.3);
  ctx.lineTo(canvasWidth * 0.88, canvasHeight * 0.35);  // Moved in from edge
  ctx.lineTo(canvasWidth * 0.85, canvasHeight * 0.2);
  ctx.closePath();
  ctx.fill();
};

export const setupCanvas = (ctx: CanvasRenderingContext2D) => {
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
};
