import React, { useEffect, useRef, useState } from "react";

const CanvasMap = ({ mapImageUrl }) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load the image
  useEffect(() => {
    const image = new Image();
    image.src = mapImageUrl;
    image.onload = () => {
      imageRef.current = image;
      setIsLoaded(true);
    };
  }, [mapImageUrl]);

  // Draw the map on canvas
  useEffect(() => {
    if (!isLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas size to match container
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image with current offset
    ctx.drawImage(
      imageRef.current,
      offset.x,
      offset.y,
      imageRef.current.width,
      imageRef.current.height
    );
  }, [offset, isLoaded]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      // Ensure image stays within bounds after resize
      if (imageRef.current) {
        const boundedOffset = getBoundedOffset(offset);
        if (boundedOffset.x !== offset.x || boundedOffset.y !== offset.y) {
          setOffset(boundedOffset);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [offset]);

  // Calculate bounded offset to keep image within view
  const getBoundedOffset = (newOffset) => {
    if (!canvasRef.current || !imageRef.current) return newOffset;

    const canvas = canvasRef.current;
    const image = imageRef.current;

    // Calculate bounds
    const minX = -(image.width - canvas.width);
    const minY = -(image.height - canvas.height);
    const maxX = 0;
    const maxY = 0;

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
    <div className="w-full h-screen relative bg-gray-100">
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
