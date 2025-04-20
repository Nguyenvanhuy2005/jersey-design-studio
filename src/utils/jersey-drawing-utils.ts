// Common utility functions for jersey drawing
export const drawBasicJersey = (
  ctx: CanvasRenderingContext2D,
  color: string = '#FFD700'
) => {
  const canvasWidth = ctx.canvas.width / window.devicePixelRatio;
  const canvasHeight = ctx.canvas.height / window.devicePixelRatio;
  
  // Calculate proportional measurements
  const shoulderWidth = canvasWidth * 0.7;
  const bodyWidth = canvasWidth * 0.8;
  const jerseyHeight = canvasHeight * 0.85;
  const neckDepth = canvasHeight * 0.18;
  
  // Center the jersey horizontally
  const centerX = canvasWidth / 2;
  const startX = centerX - shoulderWidth / 2;
  const endX = centerX + shoulderWidth / 2;
  
  // Draw main body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(startX, canvasHeight * 0.15);
  ctx.lineTo(endX, canvasHeight * 0.15);
  ctx.lineTo(centerX + bodyWidth/2, canvasHeight * 0.3);
  ctx.lineTo(centerX + bodyWidth/2, jerseyHeight);
  ctx.lineTo(centerX - bodyWidth/2, jerseyHeight);
  ctx.lineTo(centerX - bodyWidth/2, canvasHeight * 0.3);
  ctx.closePath();
  ctx.fill();

  // Draw white trim on bottom
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX - bodyWidth/2, jerseyHeight);
  ctx.lineTo(centerX + bodyWidth/2, jerseyHeight);
  ctx.stroke();
  
  // Draw V-neck collar with white trim
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.moveTo(centerX - shoulderWidth * 0.15, canvasHeight * 0.15);
  ctx.lineTo(centerX, neckDepth);
  ctx.lineTo(centerX + shoulderWidth * 0.15, canvasHeight * 0.15);
  ctx.closePath();
  ctx.fill();

  // Add white trim to V-neck
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - shoulderWidth * 0.15, canvasHeight * 0.15);
  ctx.lineTo(centerX, neckDepth);
  ctx.lineTo(centerX + shoulderWidth * 0.15, canvasHeight * 0.15);
  ctx.stroke();
  
  // Draw left sleeve with white trim
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(startX, canvasHeight * 0.15);
  ctx.lineTo(centerX - bodyWidth/2, canvasHeight * 0.3);
  ctx.lineTo(canvasWidth * 0.12, canvasHeight * 0.35);
  ctx.lineTo(canvasWidth * 0.15, canvasHeight * 0.2);
  ctx.closePath();
  ctx.fill();

  // Add white trim to left sleeve
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(canvasWidth * 0.12, canvasHeight * 0.35);
  ctx.lineTo(canvasWidth * 0.15, canvasHeight * 0.2);
  ctx.stroke();
  
  // Draw right sleeve with white trim
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(endX, canvasHeight * 0.15);
  ctx.lineTo(centerX + bodyWidth/2, canvasHeight * 0.3);
  ctx.lineTo(canvasWidth * 0.88, canvasHeight * 0.35);
  ctx.lineTo(canvasWidth * 0.85, canvasHeight * 0.2);
  ctx.closePath();
  ctx.fill();

  // Add white trim to right sleeve
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(canvasWidth * 0.88, canvasHeight * 0.35);
  ctx.lineTo(canvasWidth * 0.85, canvasHeight * 0.2);
  ctx.stroke();

  // Add subtle shadow effect
  const gradient = ctx.createLinearGradient(0, 0, 0, jerseyHeight);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
  
  ctx.fillStyle = gradient;
  ctx.fill();
};

export const setupCanvas = (ctx: CanvasRenderingContext2D) => {
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
};

// New utility function for drawing pants with white stripes
export const drawPants = (
  ctx: CanvasRenderingContext2D,
  color: string = '#FFD700'
) => {
  const canvasWidth = ctx.canvas.width / window.devicePixelRatio;
  const canvasHeight = ctx.canvas.height / window.devicePixelRatio;
  
  const centerX = canvasWidth / 2;
  const pantsWidth = canvasWidth * 0.6;
  const pantsHeight = canvasHeight * 0.7;
  
  // Draw main pants shape
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(centerX - pantsWidth/4, canvasHeight * 0.2);
  ctx.lineTo(centerX + pantsWidth/4, canvasHeight * 0.2);
  ctx.lineTo(centerX + pantsWidth/2, canvasHeight * 0.85);
  ctx.lineTo(centerX - pantsWidth/2, canvasHeight * 0.85);
  ctx.closePath();
  ctx.fill();

  // Add white trim at bottom
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - pantsWidth/2, canvasHeight * 0.85);
  ctx.lineTo(centerX + pantsWidth/2, canvasHeight * 0.85);
  ctx.stroke();

  // Add white stripes on sides
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  
  // Left stripe
  ctx.beginPath();
  ctx.moveTo(centerX - pantsWidth/4, canvasHeight * 0.25);
  ctx.lineTo(centerX - pantsWidth/3, canvasHeight * 0.85);
  ctx.stroke();
  
  // Right stripe
  ctx.beginPath();
  ctx.moveTo(centerX + pantsWidth/4, canvasHeight * 0.25);
  ctx.lineTo(centerX + pantsWidth/3, canvasHeight * 0.85);
  ctx.stroke();

  // Add subtle shadow effect
  const gradient = ctx.createLinearGradient(0, 0, 0, pantsHeight);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
  
  ctx.fillStyle = gradient;
  ctx.fill();
};
