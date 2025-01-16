import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

interface LocationPoint {
  id: number;
  x: number;
  y: number;
  name: string;
  distance?: string;
  duration?: string;
  description?: string;
  pattern?: string;
  color?: string;
}

const locationPoints: LocationPoint[] = [
  {
    id: 1,
    x: 0.2,
    y: 0.3,
    name: 'Location A',
    pattern: '5,5',
    distance: '3.2 km',
    duration: '12 min',
    description: 'Location A description',
  },
  {
    id: 2,
    x: 0.7,
    y: 0.4,
    name: 'Location B',
    pattern: '3,3',
    distance: '2.1 km',
    duration: '8 min',
    description: 'Location B description',
  },
  {
    id: 3,
    x: 0.3,
    y: 0.8,
    name: 'Location C',
    pattern: '4,4',
    distance: '4.5 km',
    duration: '15 min',
    description: 'Location C description',
  },
  {
    id: 4,
    x: 0.8,
    y: 0.6,
    name: 'Location D',
    pattern: '6,6',
    distance: '3.8 km',
    duration: '11 min',
    description: 'Location D description',
  },
];

const startPoint = { x: 0.5, y: 0.5 };

const CanvasMap = ({ mapImageUrl }: { mapImageUrl: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [selectedPoint, setSelectedPoint] = useState<LocationPoint | null>(
    null
  );
  const [animationKey, setAnimationKey] = useState(0);
  const [pathProgress, setPathProgress] = useState(0);
  const animationFrameRef = useRef<number>();
  const [showOverlay, setShowOverlay] = useState(false);

  const animatePath = (path: { x: number; y: number }[], startTime: number) => {
    const animationDuration = 1000; // Increased to 1 second for smoother animation
    const now = performance.now();
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / animationDuration, 1);

    // Use easing function for smoother animation
    const easeOutQuad = (t: number) => t * (2 - t);
    const easedProgress = easeOutQuad(progress);

    setPathProgress(easedProgress);

    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(() =>
        animatePath(path, startTime)
      );
    }
  };

  // Calculate scale to cover entire screen
  const calculateCoverScale = (
    imageWidth: number,
    imageHeight: number,
    containerWidth: number,
    containerHeight: number
  ) => {
    const widthScale = containerWidth / imageWidth;
    const heightScale = containerHeight / imageHeight;
    // Use the larger scale to ensure full coverage
    return Math.max(widthScale, heightScale);
  };

  // Load the image
  useEffect(() => {
    const image = imageRef.current;
    image.src = mapImageUrl;
    image.onload = () => {
      imageRef.current = image;
      setIsLoaded(true);

      // Calculate initial scale to cover screen
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        if (container) {
          const newScale = calculateCoverScale(
            image.width,
            image.height,
            container.clientWidth,
            container.clientHeight
          );
          setScale(newScale);

          // Center the image initially
          const scaledWidth = image.width * newScale;
          const scaledHeight = image.height * newScale;
          const centerX = (container.clientWidth - scaledWidth) / 2;
          const centerY = (container.clientHeight - scaledHeight) / 2;
          setOffset({ x: centerX, y: centerY });
        }
      }
    };
  }, [mapImageUrl]);

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

    // Draw base image

    // Draw start point
    if (selectedPoint) {
      const path = generatePath(startPoint, selectedPoint, selectedPoint.id);
      ctx.beginPath();

      // Calculate the exact point along the path based on progress
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

      // Draw path to selected point
      ctx.strokeStyle = selectedPoint.color || '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    const startX = offset.x + scaledWidth * startPoint.x;
    const startY = offset.y + scaledHeight * startPoint.y;
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
  }, [offset, isLoaded, scale, selectedPoint, pathProgress, showOverlay]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !imageRef.current) return;

      const canvas = canvasRef.current;
      const container = canvas.parentElement;
      if (!container) return;

      // Update canvas dimensions
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      // Recalculate scale to cover viewport
      const newScale = calculateCoverScale(
        imageRef.current.width,
        imageRef.current.height,
        container.clientWidth,
        container.clientHeight
      );
      setScale(newScale);

      // Ensure image stays within bounds after resize
      const boundedOffset = getBoundedOffset(offset, newScale);
      setOffset(boundedOffset);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [offset]);

  // Calculate bounded offset to keep image within view
  const getBoundedOffset = (
    newOffset: { x: number; y: number },
    currentScale = scale
  ) => {
    if (!canvasRef.current || !imageRef.current) return newOffset;

    const canvas = canvasRef.current;
    const image = imageRef.current;

    // Calculate scaled dimensions
    const scaledWidth = image.width * currentScale;
    const scaledHeight = image.height * currentScale;

    // Calculate bounds to ensure image always covers the screen
    const minX = Math.min(0, canvas.width - scaledWidth);
    const minY = Math.min(0, canvas.height - scaledHeight);
    const maxX = Math.max(0, canvas.width - scaledWidth);
    const maxY = Math.max(0, canvas.height - scaledHeight);

    return {
      x: Math.min(maxX, Math.max(minX, newOffset.x)),
      y: Math.min(maxY, Math.max(minY, newOffset.y)),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const newOffset = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    };

    // Apply bounds checking
    const boundedOffset = getBoundedOffset(newOffset);
    setOffset(boundedOffset);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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
      setAnimationKey((prev) => prev + 1);
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

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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
      />
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
