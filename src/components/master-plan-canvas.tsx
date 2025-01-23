import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import UnitsFilter from "./UnitFilter";
import { Link } from "react-router-dom";
import { useCanvas } from "../hooks/useCanvas";
import { units } from "../data/units";

const CanvasPropertyMask: React.FC = () => {
  const {
    canvasRef,
    imageRef,
    isLoaded,
    isDragging,
    setIsDragging,
    offset,
    setOffset,
    scale,
    setScale,
    dragStart,
    handleMouseDown,
    handleMouseUp,
    handleWheel,
    getBoundedOffset,
    calculateCoverScale,
  } = useCanvas({
    imageSrc: "/master-1.jpg",
  });

  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [hoveredUnit, setHoveredUnit] = useState<string | null>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [visibleGroups, setVisibleGroups] = useState<string[]>(
    Array.from(
      new Set(
        units
          .map((unit) => unit.groupId)
          .filter((id): id is string => id !== undefined)
      )
    )
  );

  const handleToggleGroup = (groupId: string) => {
    setVisibleGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

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
        setOffset(
          getBoundedOffset(
            { x: currentX, y: currentY },
            currentScale,
            canvas,
            image
          )
        );

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

  // Add cleanup for zoom animation
  useEffect(() => {
    return () => {
      if (zoomAnimationRef.current) {
        cancelAnimationFrame(zoomAnimationRef.current);
      }
    };
  }, []);

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
      if (
        (selectedUnit === null || selectedUnit === unit.id) &&
        (!unit.groupId || visibleGroups.includes(unit.groupId))
      ) {
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
            if (unit.id === hoveredUnit) {
              const baseColorMatch = unit.color.match(
                /^rgba\((\d+),\s*(\d+),\s*(\d+)/
              );
              if (baseColorMatch) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [_, r, g, b] = baseColorMatch;
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentOpacity})`;
              }
            } else {
              ctx.fillStyle = unit.color;
            }

            ctx.fill();
          }
        }

        ctx.restore();
      }
    });
  }, [
    isLoaded,
    offset,
    scale,
    selectedUnit,
    hoveredUnit,
    currentOpacity,
    visibleGroups,
    canvasRef,
    imageRef,
  ]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newOffset = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };
      const boundedOffset = getBoundedOffset(
        newOffset,
        scale,
        canvasRef.current!,
        imageRef.current
      );
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

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoveredUnit(null);
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
      handleResetView();
    }
  };

  const handleResetView = () => {
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
      <div className="bg-white absolute top-4 left-4  rounded-lg">
        <Link to="/">
          <img src="/logo.png" className="w-[50px]" />
        </Link>
      </div>
      <UnitsFilter
        units={units}
        visibleGroups={visibleGroups}
        onToggleGroup={handleToggleGroup}
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
                  {units.find((u) => u.id === selectedUnit)?.area.width} x{" "}
                  {units.find((u) => u.id === selectedUnit)?.area.height} m²
                </span>
              </div>
              <button
                onClick={handleResetView}
                className="w-full mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Reset View
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CanvasPropertyMask;
