import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Link } from 'react-router-dom';
import { useCanvas } from '../hooks/useCanvas';
import { usePathAnimation } from '../hooks/usePathAnimation';
import { startPoint, locationPoints } from '../data/locations';

const getCustomPath = (point: LocationPoint): PathPoint[] => {
  if (point.pathPoints) {
    return point.pathPoints;
  }

  // Fallback to direct path if no custom path is defined
  return [startPoint, { x: point.x, y: point.y }];
};

const CanvasMap = ({ mapImageUrl }: { mapImageUrl: string }) => {
  const {
    canvasRef,
    imageRef,
    isLoaded,
    isDragging,
    offset,
    scale,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
  } = useCanvas({
    imageSrc: mapImageUrl,
  });

  const { animatePath, animationFrameRef, pathProgress, setPathProgress } =
    usePathAnimation();

  const [selectedPoint, setSelectedPoint] = useState<LocationPoint | null>(
    null
  );

  const [showOverlay, setShowOverlay] = useState(false);

  const generatePath = (
    start: { x: number; y: number },
    end: { x: number; y: number },
    seed: number
  ) => {
    const pseudoRandom = (index: number) => {
      return (Math.sin(seed * index) + 1) / 2;
    };

    const segments = Math.floor(pseudoRandom(1) * 3) + 2;
    const points = [start];

    for (let i = 0; i < segments; i++) {
      const prevPoint = points[points.length - 1];
      const nextPoint = {
        x: prevPoint.x + (end.x - prevPoint.x) / (segments - i),
        y: prevPoint.y,
      };

      if (i < segments - 1) {
        nextPoint.x += (pseudoRandom(i + 2) - 0.5) * 0.1;
        nextPoint.y += (pseudoRandom(i + 3) - 0.5) * 0.1;
      } else {
        nextPoint.x = end.x;
        nextPoint.y = end.y;
      }

      points.push(nextPoint);
    }

    return points;
  };

  useEffect(() => {
    if (!isLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;

    if (!ctx || !container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaledWidth = imageRef.current.width * scale;
    const scaledHeight = imageRef.current.height * scale;

    ctx.drawImage(
      imageRef.current,
      offset.x,
      offset.y,
      scaledWidth,
      scaledHeight
    );

    if (selectedPoint && showOverlay) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(offset.x, offset.y, scaledWidth, scaledHeight);
    }

    // Draw start point
    if (selectedPoint) {
      const path = getCustomPath(selectedPoint);
      ctx.beginPath();

      const totalLength = path.length - 1;
      const exactProgress = totalLength * pathProgress;
      const currentSegment = Math.floor(exactProgress);
      const segmentProgress = exactProgress - currentSegment;

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

      // Interpolate the final point
      if (currentSegment < path.length - 1) {
        const currentPoint = path[currentSegment];
        const nextPoint = path[currentSegment + 1];
        const interpolatedX =
          currentPoint.x + (nextPoint.x - currentPoint.x) * segmentProgress;
        const interpolatedY =
          currentPoint.y + (nextPoint.y - currentPoint.y) * segmentProgress;

        const x = offset.x + scaledWidth * interpolatedX;
        const y = offset.y + scaledHeight * interpolatedY;
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = selectedPoint.color || '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    const startX = offset.x + scaledWidth * startPoint.x;
    const startY = offset.y + scaledHeight * startPoint.y;

    ctx.beginPath();
    ctx.moveTo(startX, startY - 24); // Start from the top of the circle
    ctx.lineTo(startX, startY - 50); // Go straight up
    ctx.lineTo(startX + 30, startY - 80); // First angle to the right
    ctx.lineTo(startX + 30, startY - 120); // Straight up again
    ctx.strokeStyle = '#FFFFFF'; // White color as shown in the image
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw small diamond at path end
    ctx.beginPath();
    ctx.moveTo(startX + 30, startY - 120); // Center point
    ctx.lineTo(startX + 24, startY - 126); // Left point
    ctx.lineTo(startX + 30, startY - 132); // Top point
    ctx.lineTo(startX + 36, startY - 126); // Right point
    ctx.closePath();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF'; // Changed to white to match image
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw start point circles
    ctx.beginPath();
    ctx.arc(startX, startY, 24, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(startX, startY, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#009a43';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(startX, startY, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(startX, startY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#009a43';
    ctx.fill();

    // Draw location points
    locationPoints.forEach((point) => {
      const x = offset.x + scaledWidth * point.x;
      const y = offset.y + scaledHeight * point.y;

      ctx.beginPath();
      ctx.arc(x, y, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fillStyle = point.color || '#FFFFFF';
      ctx.fill();

      // Draw inner black circle
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = selectedPoint?.id === point.id ? '#ff0000' : '#000000';
      ctx.fill();

      // Draw label
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';

      // Measure text width
      const textMetrics = ctx.measureText(point.name);
      const textWidth = textMetrics.width;
      const padding = 20;
      const boxWidth = textWidth + padding * 2;
      const boxHeight = 30;
      const radius = 8; // Border radius

      // Draw rounded rectangle background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.moveTo(x - boxWidth / 2 + radius, y - 55);
      ctx.lineTo(x + boxWidth / 2 - radius, y - 55);
      ctx.quadraticCurveTo(
        x + boxWidth / 2,
        y - 55,
        x + boxWidth / 2,
        y - 55 + radius
      );
      ctx.lineTo(x + boxWidth / 2, y - 55 + boxHeight - radius);
      ctx.quadraticCurveTo(
        x + boxWidth / 2,
        y - 55 + boxHeight,
        x + boxWidth / 2 - radius,
        y - 55 + boxHeight
      );
      ctx.lineTo(x - boxWidth / 2 + radius, y - 55 + boxHeight);
      ctx.quadraticCurveTo(
        x - boxWidth / 2,
        y - 55 + boxHeight,
        x - boxWidth / 2,
        y - 55 + boxHeight - radius
      );
      ctx.lineTo(x - boxWidth / 2, y - 55 + radius);
      ctx.quadraticCurveTo(
        x - boxWidth / 2,
        y - 55,
        x - boxWidth / 2 + radius,
        y - 55
      );
      ctx.closePath();
      ctx.fill();

      // Draw label text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(point.name, x, y - 35);
    });
  }, [
    offset,
    isLoaded,
    scale,
    selectedPoint,
    pathProgress,
    showOverlay,
    canvasRef,
    imageRef,
  ]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const scaledWidth = imageRef.current.width * scale;
    const scaledHeight = imageRef.current.height * scale;

    const clickedPoint = locationPoints.find((point) => {
      const pointX = offset.x + scaledWidth * point.x;
      const pointY = offset.y + scaledHeight * point.y;
      const distance = Math.sqrt(
        Math.pow(clickX - pointX, 2) + Math.pow(clickY - pointY, 2)
      );
      return distance < 50;
    });

    if (clickedPoint) {
      setSelectedPoint(clickedPoint);
      setShowOverlay(true);
      setPathProgress(0);

      // Cancel any existing animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Start new animation
      animationFrameRef.current = requestAnimationFrame(() =>
        animatePath(
          generatePath(startPoint, clickedPoint, clickedPoint.id),
          performance.now()
        )
      );
    } else {
      setSelectedPoint(null);
      setShowOverlay(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-gray-100">
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
      />

      {/* Start Point Card */}
      <div
        className="fixed transform -translate-x-1/2"
        style={{
          left: `${
            offset.x + imageRef.current.width * scale * startPoint.x + 30
          }px`,
          top: `${
            offset.y + imageRef.current.height * scale * startPoint.y - 280
          }px`,
        }}
      >
        <Link to="/master-plan-canvas">
          <Card className=" bg-white/90 backdrop-blur-sm border border-gray-200">
            <CardContent className="p-0">
              <div className="flex items-center justify-center">
                <img src="logo.png" alt="Project Logo" className="h-36 w-36" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {selectedPoint && (
        <Card className="fixed bottom-4 left-4 w-64 bg-black/80 text-white border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{selectedPoint.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Distance:</span>
                <span>{selectedPoint.distance}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{selectedPoint.duration}</span>
              </div>
              <p className="text-gray-300 mt-2">{selectedPoint.description}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CanvasMap;
