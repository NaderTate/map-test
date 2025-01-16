import React, { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

interface LocationPoint {
  id: number;
  x: number;
  y: number;
  name: string;
  distance?: string;
  duration?: string;
  description?: string;
  pathPoints: { x: number; y: number }[];
  color?: string;
}

const locationPoints: LocationPoint[] = [
  {
    id: 1,
    x: 0.2,
    y: 0.3,
    name: "Location A",
    distance: "3.2 km",
    duration: "12 min",
    description: "Location A description",
    pathPoints: [
      { x: 0.5, y: 0.5 },
      { x: 0.4, y: 0.5 },
      { x: 0.3, y: 0.4 },
      { x: 0.2, y: 0.3 },
    ],
  },
  {
    id: 2,
    x: 0.7,
    y: 0.4,
    name: "Location B",
    distance: "2.1 km",
    duration: "8 min",
    description: "Location B description",
    pathPoints: [
      { x: 0.5, y: 0.5 },
      { x: 0.5, y: 0.4 },
      { x: 0.6, y: 0.4 },
      { x: 0.7, y: 0.4 },
    ],
  },
  {
    id: 3,
    x: 0.3,
    y: 0.8,
    name: "Location C",
    distance: "4.5 km",
    duration: "15 min",
    description: "Location C description",
    pathPoints: [
      { x: 0.5, y: 0.5 },
      { x: 0.5, y: 0.6 },
      { x: 0.4, y: 0.7 },
      { x: 0.3, y: 0.8 },
    ],
  },
  {
    id: 4,
    x: 0.8,
    y: 0.6,
    name: "Location D",
    distance: "3.8 km",
    duration: "11 min",
    description: "Location D description",
    pathPoints: [
      { x: 0.5, y: 0.5 },
      { x: 0.6, y: 0.5 },
      { x: 0.7, y: 0.6 },
      { x: 0.8, y: 0.6 },
    ],
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

  const interpolatePoint = (
    point1: { x: number; y: number },
    point2: { x: number; y: number },
    progress: number
  ) => {
    return {
      x: point1.x + (point2.x - point1.x) * progress,
      y: point1.y + (point2.y - point1.y) * progress,
    };
  };

  const animatePath = (startTime: number) => {
    const animationDuration = 1000;
    const now = performance.now();
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / animationDuration, 1);

    const easeOutQuad = (t: number) => t * (2 - t);
    const easedProgress = easeOutQuad(progress);

    setPathProgress(easedProgress);

    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(() =>
        animatePath(startTime)
      );
    }
  };

  const calculateCoverScale = (
    imageWidth: number,
    imageHeight: number,
    containerWidth: number,
    containerHeight: number
  ) => {
    const widthScale = containerWidth / imageWidth;
    const heightScale = containerHeight / imageHeight;
    return Math.max(widthScale, heightScale);
  };

  useEffect(() => {
    const image = imageRef.current;
    image.src = mapImageUrl;
    image.onload = () => {
      imageRef.current = image;
      setIsLoaded(true);

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

          const scaledWidth = image.width * newScale;
          const scaledHeight = image.height * newScale;
          const centerX = (container.clientWidth - scaledWidth) / 2;
          const centerY = (container.clientHeight - scaledHeight) / 2;
          setOffset({ x: centerX, y: centerY });
        }
      }
    };
  }, [mapImageUrl]);

  useEffect(() => {
    if (!isLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const container = canvas.parentElement;

    if (!ctx || !container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaledWidth = imageRef.current.width * scale;
    const scaledHeight = imageRef.current.height * scale;

    // Draw base image
    ctx.drawImage(
      imageRef.current,
      offset.x,
      offset.y,
      scaledWidth,
      scaledHeight
    );

    if (selectedPoint && showOverlay) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(offset.x, offset.y, scaledWidth, scaledHeight);
    }

    // Draw animated path
    if (selectedPoint) {
      const path = selectedPoint.pathPoints;
      ctx.beginPath();

      const totalSegments = path.length - 1;
      const exactProgress = totalSegments * pathProgress;
      const currentSegment = Math.floor(exactProgress);
      const segmentProgress = exactProgress - currentSegment;

      // Draw completed segments
      for (let i = 0; i <= currentSegment && i < path.length - 1; i++) {
        const point = path[i];
        const x = offset.x + scaledWidth * point.x;
        const y = offset.y + scaledHeight * point.y;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      // Draw current animating segment
      if (currentSegment < path.length - 1) {
        const currentPoint = path[currentSegment];
        const nextPoint = path[currentSegment + 1];
        const interpolated = interpolatePoint(
          currentPoint,
          nextPoint,
          segmentProgress
        );

        const x = offset.x + scaledWidth * interpolated.x;
        const y = offset.y + scaledHeight * interpolated.y;
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = selectedPoint.color || "#FFFFFF";
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Draw start point
    const startX = offset.x + scaledWidth * startPoint.x;
    const startY = offset.y + scaledHeight * startPoint.y;
    ctx.beginPath();
    ctx.arc(startX, startY, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#4CAF50";
    ctx.fill();

    // Draw location points
    locationPoints.forEach((point) => {
      const x = offset.x + scaledWidth * point.x;
      const y = offset.y + scaledHeight * point.y;

      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = selectedPoint?.id === point.id ? "#ff0000" : "#0000ff";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = "14px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(point.name, x, y - 15);
    });
  }, [offset, isLoaded, scale, selectedPoint, pathProgress, showOverlay]);

  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !imageRef.current) return;

      const canvas = canvasRef.current;
      const container = canvas.parentElement;
      if (!container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      const newScale = calculateCoverScale(
        imageRef.current.width,
        imageRef.current.height,
        container.clientWidth,
        container.clientHeight
      );
      setScale(newScale);

      const boundedOffset = getBoundedOffset(offset, newScale);
      setOffset(boundedOffset);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [offset]);

  const getBoundedOffset = (
    newOffset: { x: number; y: number },
    currentScale = scale
  ) => {
    if (!canvasRef.current || !imageRef.current) return newOffset;

    const canvas = canvasRef.current;
    const image = imageRef.current;

    const scaledWidth = image.width * currentScale;
    const scaledHeight = image.height * currentScale;

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
      return distance < 10;
    });

    if (clickedPoint) {
      setSelectedPoint(clickedPoint);
      setShowOverlay(true);
      setAnimationKey((prev) => prev + 1);
      setPathProgress(0);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() =>
        animatePath(performance.now())
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
          isDragging ? "cursor-grabbing" : "cursor-grab"
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
