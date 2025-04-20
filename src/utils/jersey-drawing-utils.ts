// Common utility functions for jersey drawing
export const drawBasicJersey = (
  ctx: CanvasRenderingContext2D,
  color: string = '#FFD700',
  scale: number = 1
) => {
  const canvasWidth = (ctx.canvas.width / window.devicePixelRatio) * scale;
  const canvasHeight = (ctx.canvas.height / window.devicePixelRatio) * scale;
  
  // Calculate proportional measurements
  const shoulderWidth = canvasWidth * 0.8;
  const bodyWidth = canvasWidth * 0.7;
  const neckWidth = shoulderWidth * 0.2;
  const neckDepth = canvasHeight * 0.15;
  const jerseyBottom = canvasHeight * 0.85;
  
  // Center the jersey
  const centerX = canvasWidth / 2;
  
  // Draw main body with curved sides
  ctx.fillStyle = color;
  ctx.beginPath();
  
  // Start from left shoulder
  ctx.moveTo(centerX - shoulderWidth/2, canvasHeight * 0.15);
  
  // Draw left side with curve
  ctx.bezierCurveTo(
    centerX - shoulderWidth/2, canvasHeight * 0.3,
    centerX - bodyWidth/2, canvasHeight * 0.4,
    centerX - bodyWidth/2, jerseyBottom
  );
  
  // Draw bottom
  ctx.lineTo(centerX + bodyWidth/2, jerseyBottom);
  
  // Draw right side with curve
  ctx.bezierCurveTo(
    centerX + bodyWidth/2, canvasHeight * 0.4,
    centerX + shoulderWidth/2, canvasHeight * 0.3,
    centerX + shoulderWidth/2, canvasHeight * 0.15
  );
  
  ctx.closePath();
  ctx.fill();

  // Draw V-neck collar
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(centerX - neckWidth, canvasHeight * 0.15);
  ctx.lineTo(centerX, neckDepth);
  ctx.lineTo(centerX + neckWidth, canvasHeight * 0.15);
  ctx.closePath();
  ctx.fill();
  
  // Add collar trim
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw sleeves with rounded curves
  ctx.fillStyle = color;
  
  // Left sleeve
  ctx.beginPath();
  ctx.moveTo(centerX - shoulderWidth/2, canvasHeight * 0.15);
  ctx.quadraticCurveTo(
    centerX - shoulderWidth/1.5, canvasHeight * 0.25,
    centerX - shoulderWidth/1.3, canvasHeight * 0.35
  );
  ctx.quadraticCurveTo(
    centerX - shoulderWidth/1.8, canvasHeight * 0.3,
    centerX - shoulderWidth/2, canvasHeight * 0.15
  );
  ctx.fill();
  
  // Right sleeve
  ctx.beginPath();
  ctx.moveTo(centerX + shoulderWidth/2, canvasHeight * 0.15);
  ctx.quadraticCurveTo(
    centerX + shoulderWidth/1.5, canvasHeight * 0.25,
    centerX + shoulderWidth/1.3, canvasHeight * 0.35
  );
  ctx.quadraticCurveTo(
    centerX + shoulderWidth/1.8, canvasHeight * 0.3,
    centerX + shoulderWidth/2, canvasHeight * 0.15
  );
  ctx.fill();

  // Add shadow effect
  const gradient = ctx.createLinearGradient(0, 0, 0, jerseyBottom);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
  
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
  
  // Athletic shorts dimensions
  const waistWidth = canvasWidth * 0.5;
  const shortsLength = canvasHeight * 0.5; // Shorter length for athletic shorts
  const bottomWidth = waistWidth * 1.1; // Slightly wider at bottom
  
  // Draw improved shorts shape
  ctx.fillStyle = color;
  
  // Main shorts shape
  ctx.beginPath();
  
  // Start from left waist
  ctx.moveTo(centerX - waistWidth/2, canvasHeight * 0.2);
  
  // Left side curve
  ctx.bezierCurveTo(
    centerX - waistWidth/2, canvasHeight * 0.3,
    centerX - bottomWidth/2, canvasHeight * 0.4,
    centerX - bottomWidth/2, canvasHeight * 0.2 + shortsLength
  );
  
  // Bottom curve
  ctx.quadraticCurveTo(
    centerX, canvasHeight * 0.2 + shortsLength + 10,
    centerX + bottomWidth/2, canvasHeight * 0.2 + shortsLength
  );
  
  // Right side curve
  ctx.bezierCurveTo(
    centerX + bottomWidth/2, canvasHeight * 0.4,
    centerX + waistWidth/2, canvasHeight * 0.3,
    centerX + waistWidth/2, canvasHeight * 0.2
  );
  
  // Close the path
  ctx.closePath();
  ctx.fill();

  // Add waistband
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(
    centerX - waistWidth/2,
    canvasHeight * 0.2,
    waistWidth,
    5
  );

  // Add shadow effect for depth
  const gradient = ctx.createLinearGradient(0, canvasHeight * 0.2, 0, canvasHeight * 0.2 + shortsLength);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
  
  ctx.fillStyle = gradient;
  ctx.fill();
};
