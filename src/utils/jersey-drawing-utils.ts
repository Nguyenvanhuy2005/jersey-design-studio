
// Common utility functions for jersey drawing
export const drawBasicJersey = (
  ctx: CanvasRenderingContext2D,
  color: string = '#FFD700'
) => {
  // Draw main body with angled shoulders
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(80, 0);  // Start at left shoulder
  ctx.lineTo(220, 0); // Right shoulder
  ctx.lineTo(250, 80); // Right armpit
  ctx.lineTo(250, 300); // Right bottom
  ctx.lineTo(50, 300); // Left bottom
  ctx.lineTo(50, 80);  // Left armpit
  ctx.closePath();
  ctx.fill();
  
  // Draw collar (black V-neck)
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.moveTo(120, 0);
  ctx.lineTo(180, 0);
  ctx.lineTo(180, 30);
  ctx.arc(150, 30, 30, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  
  // Draw left sleeve
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(80, 0);
  ctx.lineTo(50, 80);
  ctx.lineTo(0, 100);
  ctx.lineTo(10, 50);
  ctx.closePath();
  ctx.fill();
  
  // Draw right sleeve
  ctx.beginPath();
  ctx.moveTo(220, 0);
  ctx.lineTo(250, 80);
  ctx.lineTo(300, 100);
  ctx.lineTo(290, 50);
  ctx.lineTo(250, 20);
  ctx.closePath();
  ctx.fill();
};

export const setupCanvas = (ctx: CanvasRenderingContext2D) => {
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
};

