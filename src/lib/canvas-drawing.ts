// interface DrawContext {
//   ctx: CanvasRenderingContext2D;
//   offset: number;
//   scale: number;
//   scaledWidth: number;
//   scaledHeight: number;
// }

export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  offset: Point,
  scale: number,
  scaledWidth: number,
  scaledHeight: number
) => {
  const gridSize = 0.01;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.font = '2px Arial';
  ctx.textAlign = 'left';

  // Draw vertical lines
  for (let x = 0; x <= 1; x += gridSize) {
    const screenX = offset.x + scaledWidth * x;
    ctx.beginPath();
    ctx.moveTo(screenX, offset.y);
    ctx.lineTo(screenX, offset.y + scaledHeight);
    ctx.stroke();

    // Draw coordinate label
    if (x % 0.1 === 0) {
      ctx.fillText(x.toFixed(2), screenX + 2, offset.y + 12);
    }
  }

  // Draw horizontal lines
  for (let y = 0; y <= 1; y += gridSize) {
    const screenY = offset.y + scaledHeight * y;
    ctx.beginPath();
    ctx.moveTo(offset.x, screenY);
    ctx.lineTo(offset.x + scaledWidth, screenY);
    ctx.stroke();

    // Draw coordinate label
    if (y % 0.1 === 0) {
      ctx.fillText(y.toFixed(2), offset.x + 2, screenY + 12);
    }
  }
};

export const drawConnectingLine = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  color: string
) => {
  ctx.beginPath();
  ctx.moveTo(startX, startY - 24); // Start from top of circle
  ctx.lineTo(startX, startY - 50); // Go straight up
  ctx.lineTo(startX + 30, startY - 80); // First angle to right
  ctx.lineTo(startX + 30, startY - 120); // Straight up again
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw diamond at end
  ctx.beginPath();
  ctx.moveTo(startX + 30, startY - 120);
  ctx.lineTo(startX + 24, startY - 126);
  ctx.lineTo(startX + 30, startY - 132);
  ctx.lineTo(startX + 36, startY - 126);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
};

export const drawStartPointCircles = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string
) => {
  // Outer white circle
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#000';
  ctx.fill();

  // Colored ring
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Inner white ring
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#000';
  ctx.fill();

  // Colored center
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
};

export const drawLocationPoint = (
  ctx: CanvasRenderingContext2D,
  point: LocationPoint,
  isSelected: boolean,
  offset: Point,
  scale: number,
  scaledWidth: number,
  scaledHeight: number
) => {
  const x = offset.x + scaledWidth * point.x;
  const y = offset.y + scaledHeight * point.y;

  // Outer white circle
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#000';
  ctx.fill();

  // Inner colored circle
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fillStyle = isSelected ? '#ff0000' : point.color ? point.color : '#000';
  ctx.fill();

  // Draw label
  drawLocationLabel(ctx, x, y, point.name);
};

export const drawLocationLabel = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string
) => {
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';

  // Calculate background dimensions
  const textMetrics = ctx.measureText(text);
  const padding = 20;
  const boxWidth = textMetrics.width + padding * 2;
  const boxHeight = 30;
  const radius = 8;

  // Draw rounded rectangle background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.beginPath();

  // Top left corner
  ctx.moveTo(x - boxWidth / 2 + radius, y - 55);

  // Top edge and right corner
  ctx.lineTo(x + boxWidth / 2 - radius, y - 55);
  ctx.quadraticCurveTo(
    x + boxWidth / 2,
    y - 55,
    x + boxWidth / 2,
    y - 55 + radius
  );

  // Right edge and bottom right corner
  ctx.lineTo(x + boxWidth / 2, y - 55 + boxHeight - radius);
  ctx.quadraticCurveTo(
    x + boxWidth / 2,
    y - 55 + boxHeight,
    x + boxWidth / 2 - radius,
    y - 55 + boxHeight
  );

  // Bottom edge and left corner
  ctx.lineTo(x - boxWidth / 2 + radius, y - 55 + boxHeight);
  ctx.quadraticCurveTo(
    x - boxWidth / 2,
    y - 55 + boxHeight,
    x - boxWidth / 2,
    y - 55 + boxHeight - radius
  );

  // Left edge and back to start
  ctx.lineTo(x - boxWidth / 2, y - 55 + radius);
  ctx.quadraticCurveTo(
    x - boxWidth / 2,
    y - 55,
    x - boxWidth / 2 + radius,
    y - 55
  );

  ctx.closePath();
  ctx.fill();

  // Draw text
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, x, y - 35);
};

export const drawPath = (
  ctx: CanvasRenderingContext2D,
  path: Point[],
  pathProgress: number,
  color: string,
  offset: Point,
  scaledWidth: number,
  scaledHeight: number
) => {
  const totalLength = path.length - 1;
  const exactProgress = totalLength * pathProgress;
  const currentSegment = Math.floor(exactProgress);
  const segmentProgress = exactProgress - currentSegment;

  ctx.beginPath();

  // Draw completed segments
  path.slice(0, currentSegment + 1).forEach((point, index) => {
    const x = offset.x + scaledWidth * point.x;
    const y = offset.y + scaledHeight * point.y;
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  // Draw partial segment
  if (currentSegment < path.length - 1) {
    const currentPoint = path[currentSegment];
    const nextPoint = path[currentSegment + 1];
    const x =
      offset.x +
      scaledWidth *
        (currentPoint.x + (nextPoint.x - currentPoint.x) * segmentProgress);
    const y =
      offset.y +
      scaledHeight *
        (currentPoint.y + (nextPoint.y - currentPoint.y) * segmentProgress);
    ctx.lineTo(x, y);
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();
};
