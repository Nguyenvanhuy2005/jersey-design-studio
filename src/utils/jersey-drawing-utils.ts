
// Common utility functions for jersey drawing
export const drawBasicJersey = (
  ctx: CanvasRenderingContext2D,
  color: string = '#FFD700',
  scale: number = 1
) => {
  const canvasWidth = (ctx.canvas.width / window.devicePixelRatio) * scale;
  const canvasHeight = (ctx.canvas.height / window.devicePixelRatio) * scale;
  
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
  
  // Draw left sleeve with improved style (straight lines)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(startX, canvasHeight * 0.15); // Connection point with body
  ctx.lineTo(centerX - bodyWidth/2, canvasHeight * 0.3); // Bottom of sleeve connection
  ctx.lineTo(canvasWidth * 0.05, canvasHeight * 0.4); // Bottom edge of sleeve
  ctx.lineTo(canvasWidth * 0.08, canvasHeight * 0.15); // Top edge of sleeve
  ctx.closePath();
  ctx.fill();

  // Add white trim to left sleeve
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(canvasWidth * 0.05, canvasHeight * 0.4);
  ctx.lineTo(canvasWidth * 0.08, canvasHeight * 0.15);
  ctx.stroke();
  
  // Draw right sleeve with improved style (straight lines)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(endX, canvasHeight * 0.15); // Connection point with body
  ctx.lineTo(centerX + bodyWidth/2, canvasHeight * 0.3); // Bottom of sleeve connection
  ctx.lineTo(canvasWidth * 0.95, canvasHeight * 0.4); // Bottom edge of sleeve
  ctx.lineTo(canvasWidth * 0.92, canvasHeight * 0.15); // Top edge of sleeve
  ctx.closePath();
  ctx.fill();

  // Add white trim to right sleeve
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(canvasWidth * 0.95, canvasHeight * 0.4);
  ctx.lineTo(canvasWidth * 0.92, canvasHeight * 0.15);
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

// Improved pants drawing function with tapered design
export const drawPants = (
  ctx: CanvasRenderingContext2D,
  color: string = '#FFD700',
  scale: number = 1
) => {
  const canvasWidth = (ctx.canvas.width / window.devicePixelRatio) * scale;
  const canvasHeight = (ctx.canvas.height / window.devicePixelRatio) * scale;
  
  const centerX = canvasWidth / 2;
  
  // Improved pants dimensions
  const waistWidth = canvasWidth * 0.5; // Narrower waist
  const bottomWidth = canvasWidth * 0.6; // Wider at bottom for tapered look
  const pantsHeight = canvasHeight * 0.7;
  
  // Draw improved pants shape - more tapered
  ctx.fillStyle = color;
  ctx.beginPath();
  
  // Draw left leg
  ctx.moveTo(centerX - waistWidth/2, canvasHeight * 0.2); // Waist left
  ctx.lineTo(centerX - bottomWidth/2, canvasHeight * 0.85); // Bottom left
  ctx.lineTo(centerX - waistWidth/8, canvasHeight * 0.85); // Bottom inner left
  ctx.lineTo(centerX - waistWidth/6, canvasHeight * 0.2); // Inseam top left
  ctx.closePath();
  ctx.fill();
  
  // Draw right leg
  ctx.beginPath();
  ctx.moveTo(centerX + waistWidth/2, canvasHeight * 0.2); // Waist right
  ctx.lineTo(centerX + bottomWidth/2, canvasHeight * 0.85); // Bottom right
  ctx.lineTo(centerX + waistWidth/8, canvasHeight * 0.85); // Bottom inner right
  ctx.lineTo(centerX + waistWidth/6, canvasHeight * 0.2); // Inseam top right
  ctx.closePath();
  ctx.fill();

  // Add white trim at bottom of each leg
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  
  // Left leg trim
  ctx.beginPath();
  ctx.moveTo(centerX - bottomWidth/2, canvasHeight * 0.85);
  ctx.lineTo(centerX - waistWidth/8, canvasHeight * 0.85);
  ctx.stroke();
  
  // Right leg trim
  ctx.beginPath();
  ctx.moveTo(centerX + waistWidth/8, canvasHeight * 0.85);
  ctx.lineTo(centerX + bottomWidth/2, canvasHeight * 0.85);
  ctx.stroke();

  // Add white stripes on sides
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  
  // Left stripe
  ctx.beginPath();
  ctx.moveTo(centerX - waistWidth/3, canvasHeight * 0.25);
  ctx.lineTo(centerX - bottomWidth/3, canvasHeight * 0.85);
  ctx.stroke();
  
  // Right stripe
  ctx.beginPath();
  ctx.moveTo(centerX + waistWidth/3, canvasHeight * 0.25);
  ctx.lineTo(centerX + bottomWidth/3, canvasHeight * 0.85);
  ctx.stroke();

  // Add subtle shadow effect
  const gradient = ctx.createLinearGradient(0, 0, 0, pantsHeight);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
  
  ctx.fillStyle = gradient;
  ctx.fill();
};
