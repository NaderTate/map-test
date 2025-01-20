import React, { useEffect, useRef, useState } from "react";

interface Unit {
  id: string;
  name: string;
  color: string;
  area: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    clipPath?: string;
  };
}

const units: Unit[] = [
  {
    id: "villa-a",
    name: "Villa A",
    color: "rgba(188, 140, 34, 0.69)",
    area: {
      x: -50,
      y: -55,
      width: 1800,
      height: 1000,
      rotation: -6.5,
      clipPath:
        "polygon(6% 67%, 18% 100%, 32% 100%, 37% 96%, 31% 79%, 26% 71%, 26% 71%, 21% 59%, 21% 57%, 19% 51%, 18% 53%, 17% 50%, 12% 55%, 9% 59%, 10% 64%);",
    },
  },
];

const CanvasPropertyMask: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [hoveredUnit, setHoveredUnit] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  // Helper function to convert clip-path polygon to points
  const getPolygonPoints = (clipPath: string, unit: Unit, scale: number) => {
    return clipPath
      .match(/polygon\((.*?)\)/)?.[1]
      .split(",")
      .map((point) => {
        const [x, y] = point.trim().split(" ");
        return {
          x: (parseFloat(x) / 100) * unit.area.width * scale,
          y: (parseFloat(y) / 100) * unit.area.height * scale,
        };
      });
  };

  // Point in polygon test
  const isPointInPolygon = (
    x: number,
    y: number,
    unit: Unit,
    transformedPoints: { x: number; y: number }[]
  ): boolean => {
    let inside = false;

    // Get canvas-space coordinates
    const centerX = offset.x + unit.area.x * scale;
    const centerY = offset.y + unit.area.y * scale;

    // Apply inverse rotation to the test point
    const rotation = ((unit.area.rotation || 0) * Math.PI) / 180;
    const dx = x - centerX;
    const dy = y - centerY;
    const rotatedX = dx * Math.cos(-rotation) - dy * Math.sin(-rotation);
    const rotatedY = dx * Math.sin(-rotation) + dy * Math.cos(-rotation);

    for (
      let i = 0, j = transformedPoints.length - 1;
      i < transformedPoints.length;
      j = i++
    ) {
      const xi = transformedPoints[i].x;
      const yi = transformedPoints[i].y;
      const xj = transformedPoints[j].x;
      const yj = transformedPoints[j].y;

      const intersect =
        yi > rotatedY !== yj > rotatedY &&
        rotatedX < ((xj - xi) * (rotatedY - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }

    return inside;
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
    return Math.max(widthScale, heightScale);
  };

  // Load and initialize image
  useEffect(() => {
    const image = imageRef.current;
    image.src = "/master.png";
    image.onload = () => {
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
      setIsLoaded(true);
    };
  }, []);

  // Draw function
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

    units.forEach((unit) => {
      if (selectedUnit === null || selectedUnit === unit.id) {
        ctx.save();

        const centerX = offset.x + unit.area.x * scale;
        const centerY = offset.y + unit.area.y * scale;

        ctx.translate(centerX, centerY);
        ctx.rotate(((unit.area.rotation || 0) * Math.PI) / 180);

        if (unit.area.clipPath) {
          const points = getPolygonPoints(unit.area.clipPath, unit, scale);

          if (points) {
            ctx.beginPath();
            points.forEach((point, index) => {
              if (index === 0) {
                ctx.moveTo(point.x, point.y);
              } else {
                ctx.lineTo(point.x, point.y);
              }
            });
            ctx.closePath();

            // Adjust opacity if unit is hovered
            const baseColor = unit.color;
            const color =
              hoveredUnit === unit.id
                ? baseColor.replace(/[\d.]+\)$/, "0.4)") // Reduce opacity when hovered
                : baseColor;

            ctx.fillStyle = color;
            ctx.fill();
          }
        }

        ctx.restore();
      }
    });
  }, [isLoaded, offset, scale, selectedUnit, hoveredUnit]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newOffset = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };
      const boundedOffset = getBoundedOffset(newOffset);
      setOffset(boundedOffset);
    } else {
      // Check for hover within polygon
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const mouseX = x * scaleX;
      const mouseY = y * scaleY;

      const hoveredUnit = units.find((unit) => {
        if (!unit.area.clipPath) return false;
        const points = getPolygonPoints(unit.area.clipPath, unit, scale);
        return points && isPointInPolygon(mouseX, mouseY, unit, points);
      });

      setHoveredUnit(hoveredUnit?.id || null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoveredUnit(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;

    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const minScale = calculateCoverScale(
      image.width,
      image.height,
      canvas.width,
      canvas.height
    );

    const newScale = Math.min(Math.max(minScale, scale * zoomFactor), 5);
    setScale(newScale);
    setOffset(getBoundedOffset(offset, newScale));
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = x * scaleX;
    const mouseY = y * scaleY;

    const clickedUnit = units.find((unit) => {
      if (!unit.area.clipPath) return false;
      const points = getPolygonPoints(unit.area.clipPath, unit, scale);
      return points && isPointInPolygon(mouseX, mouseY, unit, points);
    });

    setSelectedUnit(clickedUnit?.id || null);
  };

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
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
      />
      <div className="mt-4 space-y-2">
        <div className="font-medium text-lg mb-2">Units Filter</div>
        {units.map((unit) => (
          <button
            key={unit.id}
            className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
              selectedUnit === unit.id
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() =>
              setSelectedUnit(unit.id === selectedUnit ? null : unit.id)
            }
          >
            {unit.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CanvasPropertyMask;
