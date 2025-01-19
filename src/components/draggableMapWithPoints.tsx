import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

interface Point {
  id: number;
  x: number;
  y: number;
  pattern: string;
  color: string;
  name: string;
  distance: string;
  duration: string;
  description: string;
}

interface Offset {
  x: number;
  y: number;
}

interface InteractiveMapProps {
  mapImageUrl: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ mapImageUrl }) => {
  // Canvas state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<Offset>({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Points interaction state
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [animationKey, setAnimationKey] = useState<number>(0);
  const svgRef = useRef<SVGSVGElement>(null);

  // Define base coordinates for points
  const baseStartPoint: Omit<
    Point,
    "pattern" | "color" | "name" | "distance" | "duration" | "description"
  > = {
    id: 0,
    x: 200,
    y: 200,
  };

  const basePoints: Point[] = [
    {
      id: 1,
      x: 100,
      y: 20,
      pattern: "5,5",
      color: "#FFFFFF",
      name: "Majd-Qurtubah",
      distance: "3.2 km",
      duration: "12 min",
      description: "Historical district with modern amenities",
    },
    {
      id: 2,
      x: 300,
      y: 100,
      pattern: "10,5",
      color: "#FFFFFF",
      name: "Al Munsiyah",
      distance: "4.5 km",
      duration: "15 min",
      description: "Vibrant community hub with shopping centers",
    },
    {
      id: 3,
      x: 300,
      y: 300,
      pattern: "15,3,3,3",
      color: "#FFFFFF",
      name: "Majd-AL Murjan",
      distance: "2.8 km",
      duration: "10 min",
      description: "Peaceful residential area with parks",
    },
    {
      id: 4,
      x: 100,
      y: 300,
      pattern: "2,8,2,2",
      color: "#FFFFFF",
      name: "Roshn Front",
      distance: "5.1 km",
      duration: "18 min",
      description: "Business district with modern architecture",
    },
  ];

  // Transform coordinates based on current offset and scale
  const transformPoint = <T extends { x: number; y: number }>(point: T): T => ({
    ...point,
    x: point.x * scale + offset.x,
    y: point.y * scale + offset.y,
  });

  const startPoint = useMemo(
    () => transformPoint(baseStartPoint),
    [scale, offset]
  );

  const points = useMemo(() => basePoints.map(transformPoint), [scale, offset]);

  const calculateCoverScale = (
    imageWidth: number,
    imageHeight: number,
    containerWidth: number,
    containerHeight: number
  ): number => {
    const widthScale = containerWidth / imageWidth;
    const heightScale = containerHeight / imageHeight;
    return Math.max(widthScale, heightScale);
  };

  // Load the image
  useEffect(() => {
    const image = new Image();
    image.src = mapImageUrl;
    image.onload = () => {
      imageRef.current = image;
      setIsLoaded(true);

      if (containerRef.current) {
        const container = containerRef.current;
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
    };
  }, [mapImageUrl]);

  // Draw the map on canvas
  useEffect(() => {
    if (!isLoaded || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const container = containerRef.current;

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
  }, [offset, isLoaded, scale]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !imageRef.current) return;

      const container = containerRef.current;
      const image = imageRef.current;

      const newScale = calculateCoverScale(
        image.width,
        image.height,
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
    newOffset: Offset,
    currentScale: number = scale
  ): Offset => {
    if (!containerRef.current || !imageRef.current) return newOffset;

    const container = containerRef.current;
    const image = imageRef.current;
    const scaledWidth = image.width * currentScale;
    const scaledHeight = image.height * currentScale;

    const minX = Math.min(0, container.clientWidth - scaledWidth);
    const minY = Math.min(0, container.clientHeight - scaledHeight);
    const maxX = Math.max(0, container.clientWidth - scaledWidth);
    const maxY = Math.max(0, container.clientHeight - scaledHeight);

    return {
      x: Math.min(maxX, Math.max(minX, newOffset.x)),
      y: Math.min(maxY, Math.max(minY, newOffset.y)),
    };
  };

  interface PathPoint {
    x: number;
    y: number;
  }

  const generatePath = (
    start: PathPoint,
    end: PathPoint,
    seed: number
  ): PathPoint[] => {
    const pseudoRandom = (index: number): number => {
      return (Math.sin(seed * index) + 1) / 2;
    };

    const segments = Math.floor(pseudoRandom(1) * 3) + 2;
    const points: PathPoint[] = [start];

    for (let i = 0; i < segments; i++) {
      const prevPoint = points[points.length - 1];
      const nextPoint: PathPoint = {
        x: prevPoint.x + (end.x - prevPoint.x) / (segments - i),
        y: prevPoint.y,
      };

      if (i < segments - 1) {
        nextPoint.x += (pseudoRandom(i + 2) - 0.5) * 50 * scale;
        nextPoint.y += (pseudoRandom(i + 3) - 0.5) * 100 * scale;
      } else {
        nextPoint.x = end.x;
        nextPoint.y = end.y;
      }

      points.push(nextPoint);
    }

    return points;
  };

  const pathStrings = useMemo(() => {
    return points.reduce<Record<number, string>>((acc, point) => {
      const pathPoints = generatePath(startPoint, point, point.id);
      const pathString = pathPoints.reduce((path, pathPoint, index) => {
        return `${path}${index === 0 ? "M" : "L"} ${pathPoint.x} ${
          pathPoint.y
        } `;
      }, "");
      return { ...acc, [point.id]: pathString };
    }, {});
  }, [points, startPoint, scale]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if ((e.target as HTMLElement).tagName === "circle") return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
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

  const handlePointClick = (point: Point, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPoint(point);
    setAnimationKey((prev) => prev + 1);
  };

  const handleBackgroundClick = () => {
    setSelectedPoint(null);
  };

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      <div
        className={`absolute inset-0 bg-black transition-opacity duration-500 ${
          selectedPoint ? "opacity-50" : "opacity-0"
        }`}
        onClick={handleBackgroundClick}
      />

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        ref={svgRef}
        style={{
          width: containerRef.current?.clientWidth || "100%",
          height: containerRef.current?.clientHeight || "100%",
        }}
      >
        {selectedPoint && (
          <path
            key={animationKey}
            d={pathStrings[selectedPoint.id]}
            stroke={selectedPoint.color}
            strokeWidth={4 * scale}
            fill="none"
            strokeDasharray={selectedPoint.pattern
              .split(",")
              .map((n) => parseFloat(n) * scale)
              .join(",")}
            className="animate-draw"
          />
        )}

        <circle
          cx={startPoint.x}
          cy={startPoint.y}
          r={8 * scale}
          fill="#4CAF50"
          className="cursor-pointer pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        />

        {points.map((point) => (
          <g key={point.id}>
            <circle
              cx={point.x}
              cy={point.y}
              r={6 * scale}
              fill={point.color}
              className="cursor-pointer hover:opacity-80 transition-colors pointer-events-auto"
              onClick={(e) => handlePointClick(point, e)}
            />
            <line
              x1={point.x - 15 * scale}
              y1={point.y + 15 * scale}
              x2={point.x + 15 * scale}
              y2={point.y + 15 * scale}
              stroke={point.color}
              strokeWidth={4 * scale}
              strokeDasharray={point.pattern
                .split(",")
                .map((n) => parseFloat(n) * scale)
                .join(",")}
            />
          </g>
        ))}
      </svg>

      <div className="fixed bottom-4 left-4 z-50">
        <Card
          className={`w-64 bg-black/80 text-white border-gray-700 transition-opacity duration-300 ${
            selectedPoint ? "opacity-100" : "opacity-0"
          }`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {selectedPoint ? selectedPoint.name : "Select a location"}
            </CardTitle>
          </CardHeader>
          {selectedPoint && (
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
                <p className="text-gray-300 mt-2">
                  {selectedPoint.description}
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* <style jsx>{`
        @keyframes draw {
          from {
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        .animate-draw {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw 2s cubic-bezier(0.87, 0, 0.13, 1) forwards;
        }
      `}</style> */}
    </div>
  );
};

export default InteractiveMap;
