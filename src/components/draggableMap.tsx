import React, { useEffect, useRef, useState } from 'react';

interface LocationPoint {
  id: number;
  x: number;
  y: number;
  name: string;
}

const locationPoints: LocationPoint[] = [
  { id: 1, x: 0.2, y: 0.3, name: 'Location A' },
  { id: 2, x: 0.6, y: 0.4, name: 'Location B' },
  { id: 3, x: 0.8, y: 0.7, name: 'Location C' },
];

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

  // Calculate scale to cover entire screen
  const calculateCoverScale = (
    imageWidth,
    imageHeight,
    containerWidth,
    containerHeight
  ) => {
    const widthScale = containerWidth / imageWidth;
    const heightScale = containerHeight / imageHeight;
    // Use the larger scale to ensure full coverage
    return Math.max(widthScale, heightScale);
  };

  // Load the image
  useEffect(() => {
    const image = new Image();
    image.src = mapImageUrl;
    image.onload = () => {
      imageRef.current = image;
      setIsLoaded(true);

      // Calculate initial scale to cover screen
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const container = canvas.parentElement;
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
    };
  }, [mapImageUrl]);

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

    // Draw the base image
    ctx.drawImage(
      imageRef.current,
      offset.x,
      offset.y,
      scaledWidth,
      scaledHeight
    );

    locationPoints.forEach((point) => {
      const x = offset.x + scaledWidth * point.x;
      const y = offset.y + scaledHeight * point.y;

      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = selectedPoint?.id === point.id ? '#ff0000' : '#0000ff';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '14px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(point.name, x, y - 15);
    });
  }, [offset, isLoaded, scale, selectedPoint]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !imageRef.current) return;

      const canvas = canvasRef.current;
      const container = canvas.parentElement;
      const image = imageRef.current;

      // Update canvas dimensions
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      // Recalculate scale to cover viewport
      const newScale = calculateCoverScale(
        image.width,
        image.height,
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
  const getBoundedOffset = (newOffset, currentScale = scale) => {
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

  //   const handleWheel = (e: React.WheelEvent) => {
  //     e.preventDefault();
  //     const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
  //     setScale((prevScale) => Math.min(Math.max(0.1, prevScale * zoomFactor), 5));
  //   };

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

    setSelectedPoint(clickedPoint || null);
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
        // onWheel={handleWheel}
      />
      {selectedPoint && (
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg">
          <h3 className="font-bold">{selectedPoint.name}</h3>
        </div>
      )}
    </div>
  );
};

export default CanvasMap;
