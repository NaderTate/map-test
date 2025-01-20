import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

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
    id: 'villa-a',
    name: 'Villa A',
    color: 'rgba(188, 140, 34, 0.69)',
    area: {
      x: 230,
      y: 1900,
      width: 1400,
      height: 1300,
      rotation: 0,
      clipPath:
        'polygon(, 1% 31%1% 31%, 51% 97%, 51% 97%, 91% 73%, 91% 73%, 37% 10%, 37% 10%, 35% 11%, 35% 11%, 32% 8%, 32% 8%, 18% 14%, 18% 14%, 18% 14%, 18% 14%, 9% 19%, 9% 19%, 10% 26%, 10% 26%, 4% 28%, 4% 28%);',
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
  const [isZooming, setIsZooming] = useState(false);
  const zoomAnimationRef = useRef<number>();

  const zoomToUnit = useCallback(
    (unit: Unit) => {
      if (!canvasRef.current || !imageRef.current) return;

      const canvas = canvasRef.current;
      const image = imageRef.current;

      // Calculate the target scale to fit unit with padding
      const padding = 50;

      const zoomFactor = 1.5;
      const targetScaleX =
        ((canvas.width - padding * 2) / unit.area.width) * zoomFactor;
      const targetScaleY =
        ((canvas.height - padding * 2) / unit.area.height) * zoomFactor;
      const unitTargetScale = Math.min(targetScaleX, targetScaleY, 8);

      // Ensure we maintain minimum scale for image coverage
      const coverScale = calculateCoverScale(
        image.width,
        image.height,
        canvas.width,
        canvas.height
      );
      const newScale = Math.max(unitTargetScale, coverScale);

      // Calculate target offset to center the unit
      const targetX =
        canvas.width / 2 - (unit.area.x + unit.area.width / 2) * newScale;
      const targetY =
        canvas.height / 2 - (unit.area.y + unit.area.height / 2) * newScale;

      // Start zoom animation
      const startTime = performance.now();
      const startScale = scale;
      const startOffset = { ...offset };
      const duration = 800;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        const currentScale =
          startScale + (newScale - startScale) * easeProgress;
        const currentX =
          startOffset.x + (targetX - startOffset.x) * easeProgress;
        const currentY =
          startOffset.y + (targetY - startOffset.y) * easeProgress;

        setScale(currentScale);
        setOffset(getBoundedOffset({ x: currentX, y: currentY }, currentScale));

        if (progress < 1) {
          zoomAnimationRef.current = requestAnimationFrame(animate);
        } else {
          setIsZooming(false);
        }
      };

      setIsZooming(true);
      if (zoomAnimationRef.current) {
        cancelAnimationFrame(zoomAnimationRef.current);
      }
      zoomAnimationRef.current = requestAnimationFrame(animate);
    },
    [scale, offset]
  );

  // Helper function to convert clip-path polygon to points
  const getPolygonPoints = (clipPath: string, unit: Unit, scale: number) => {
    return clipPath
      .match(/polygon\((.*?)\)/)?.[1]
      .split(',')
      .map((point) => {
        const [x, y] = point.trim().split(' ');
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
    image.src = '/master-1.jpg';
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

  interface OpacityAnimation {
    startTime: number;
    startOpacity: number;
    targetOpacity: number;
    duration: number;
  }

  const ANIMATION_DURATION = 200; // Animation duration in milliseconds
  const DEFAULT_OPACITY = 0.69; // Your default opacity
  const HOVER_OPACITY = 0.4; // Your target hover opacity

  // Add these state variables to your component
  const [currentOpacity, setCurrentOpacity] = useState(DEFAULT_OPACITY);
  const animationRef = useRef<number>();
  const animationState = useRef<OpacityAnimation | null>(null);

  // Add this animation function to your component
  const animateOpacity = useCallback((timestamp: number) => {
    if (!animationState.current) return;

    const { startTime, startOpacity, targetOpacity, duration } =
      animationState.current;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease the animation with a simple easing function
    const easeProgress =
      progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;

    const newOpacity =
      startOpacity + (targetOpacity - startOpacity) * easeProgress;
    setCurrentOpacity(newOpacity);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animateOpacity);
    }
  }, []);

  // Add this effect to handle hover state changes
  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const targetOpacity = hoveredUnit ? HOVER_OPACITY : DEFAULT_OPACITY;

    animationState.current = {
      startTime: performance.now(),
      startOpacity: currentOpacity,
      targetOpacity,
      duration: ANIMATION_DURATION,
    };

    animationRef.current = requestAnimationFrame(animateOpacity);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [hoveredUnit, animateOpacity]);

  // Draw function
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

            // Use the animated opacity
            const baseColorMatch = unit.color.match(
              /^rgba\((\d+),\s*(\d+),\s*(\d+)/
            );
            if (baseColorMatch) {
              const [_, r, g, b] = baseColorMatch;
              ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentOpacity})`;
            } else {
              ctx.fillStyle = unit.color;
            }

            ctx.fill();
          }
        }

        ctx.restore();
      }
    });
  }, [isLoaded, offset, scale, selectedUnit, hoveredUnit, currentOpacity]);

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
    if (!canvas || isZooming) return;

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

    if (clickedUnit) {
      setSelectedUnit(clickedUnit.id);
      zoomToUnit(clickedUnit);
    } else if (selectedUnit) {
      // Reset zoom when clicking outside
      setSelectedUnit(null);
      zoomToUnit({
        ...units[0],
        area: {
          x: 0,
          y: 0,
          width: imageRef.current?.width || 1,
          height: imageRef.current?.height || 1,
        },
      });
    }
  };

  // Add cleanup for zoom animation
  useEffect(() => {
    return () => {
      if (zoomAnimationRef.current) {
        cancelAnimationFrame(zoomAnimationRef.current);
      }
    };
  }, []);

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
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
      />
      {selectedUnit && (
        <Card className="absolute bottom-4 left-4 w-80 bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle>
              {units.find((u) => u.id === selectedUnit)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Dimensions</span>
                <span className="font-medium">
                  {units.find((u) => u.id === selectedUnit)?.area.width} x{' '}
                  {units.find((u) => u.id === selectedUnit)?.area.height} m²
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedUnit(null);
                  // Reset view
                  const canvas = canvasRef.current;
                  const image = imageRef.current;
                  if (canvas && image) {
                    const newScale = calculateCoverScale(
                      image.width,
                      image.height,
                      canvas.width,
                      canvas.height
                    );
                    setScale(newScale);
                    const centerX = (canvas.width - image.width * newScale) / 2;
                    const centerY =
                      (canvas.height - image.height * newScale) / 2;
                    setOffset({ x: centerX, y: centerY });
                  }
                }}
                className="w-full mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Reset View
              </button>
            </div>
          </CardContent>
        </Card>
      )}
      <div className=" mt-4 space-y-2">
        <div className="font-medium text-lg mb-2">Units Filter</div>
        {units.map((unit) => (
          <button
            key={unit.id}
            className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
              selectedUnit === unit.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
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
