import React, { useEffect, useRef, useState } from 'react';

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
    color: 'rgba(188, 140, 34, 0.4)',
    area: {
      x: -50,
      y: -55,
      width: 1800,
      height: 1000,
      rotation: -6.5,
      clipPath:
        'polygon(6% 67%, 18% 100%, 32% 100%, 37% 96%, 31% 79%, 26% 71%, 26% 71%, 21% 59%, 21% 57%, 19% 51%, 18% 53%, 17% 50%, 12% 55%, 9% 59%, 10% 64%);',
    },
  },
  //   {
  //     id: 'villa-c',
  //     name: 'Villa C',
  //     color: 'rgba(169, 107, 76, 0.4)',
  //     area: {
  //       x: 160,
  //       y: 180,
  //       width: 500,
  //       height: 500,
  //     },
  //   },
  //   {
  //     id: 'villa-d',
  //     name: 'Villa D',
  //     color: 'rgba(164, 74, 89, 0.4)',
  //     area: {
  //       x: 370,
  //       y: 180,
  //       width: 200,
  //       height: 100,
  //     },
  //   },
  //   {
  //     id: 'villa-g',
  //     name: 'Villa G',
  //     color: 'rgba(122, 62, 89, 0.4)',
  //     area: {
  //       x: 580,
  //       y: 180,
  //       width: 200,
  //       height: 100,
  //     },
  //   },
];

const CanvasPropertyMask: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

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
    image.src = '/master.png';
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

          // Center the image initially
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
          // Convert clip-path polygon string to array of points
          const points = unit.area.clipPath
            .match(/polygon\((.*?)\)/)?.[1]
            .split(',')
            .map((point) => {
              const [x, y] = point.trim().split(' ');
              return {
                x: (parseFloat(x) / 100) * unit.area.width * scale,
                y: (parseFloat(y) / 100) * unit.area.height * scale,
              };
            });

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
            ctx.fillStyle = unit.color;
            ctx.fill();
          }
        } else {
          // Fallback to rectangle
          ctx.fillStyle = unit.color;
          ctx.fillRect(0, 0, unit.area.width * scale, unit.area.height * scale);
        }

        ctx.restore();
      }
    });
  }, [isLoaded, offset, scale, selectedUnit]);

  //   const isPointInPolygon = (x: number, y: number, unit: Unit): boolean => {
  //     if (!unit.area.points) {
  //       // Fallback to rectangle hit detection
  //       return (
  //         x >= unit.area.x &&
  //         x <= unit.area.x + unit.area.width &&
  //         y >= unit.area.y &&
  //         y <= unit.area.y + unit.area.height
  //       );
  //     }

  //     let inside = false;
  //     const points = unit.area.points;

  //     for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
  //       const xi = unit.area.x + points[i][0];
  //       const yi = unit.area.y + points[i][1];
  //       const xj = unit.area.x + points[j][0];
  //       const yj = unit.area.y + points[j][1];

  //       const intersect =
  //         yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
  //       if (intersect) inside = !inside;
  //     }

  //     return inside;
  //   };

  // Mouse handlers
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
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;

    // Get minimum scale required to cover the screen
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const minScale = calculateCoverScale(
      image.width,
      image.height,
      canvas.width,
      canvas.height
    );

    // Calculate new scale while ensuring it doesn't go below minimum
    const newScale = Math.min(Math.max(minScale, scale * zoomFactor), 5);
    setScale(newScale);

    // Update offset to ensure image stays bounded
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

    const clickX = x * scaleX;
    const clickY = y * scaleY;

    const clickedUnit = units.find((unit) => {
      const { area } = unit;
      return (
        clickX >= area.x &&
        clickX <= area.x + area.width &&
        clickY >= area.y &&
        clickY <= area.y + area.height
      );
    });

    setSelectedUnit(clickedUnit?.id || null);

    // const clickedUnit = units.find((unit) => isPointInPolygon(x, y, unit));
    // setSelectedUnit(clickedUnit?.id || null);
  };

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
        onWheel={handleWheel}
        onClick={handleCanvasClick}
      />
      {/* Unit selection controls */}
      <div className="mt-4 space-y-2">
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
