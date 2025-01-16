import React, { useEffect, useRef, useState } from "react";

const CanvasMap = ({ mapImageUrl }) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scale, setScale] = useState(1);

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

  // Draw the map on canvas
  useEffect(() => {
    if (!isLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const container = canvas.parentElement;

    // Set canvas size to match container
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scaled dimensions
    const scaledWidth = imageRef.current.width * scale;
    const scaledHeight = imageRef.current.height * scale;

    // Draw image with current offset and scale
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

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseMove = (e) => {
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
      />
    </div>
  );
};

export default CanvasMap;
