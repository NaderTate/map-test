import { useRef, useState, useEffect } from 'react';
import { calculateCoverScale, getBoundedOffset } from '../lib/canvas-utils';

interface UseCanvasProps {
  imageSrc: string;
}

export const useCanvas = ({ imageSrc }: UseCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  // Load image and set initial scale/offset
  useEffect(() => {
    const image = imageRef.current;
    image.src = imageSrc;
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
  }, [imageSrc]);

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
      const boundedOffset = getBoundedOffset(
        offset,
        newScale,
        canvas,
        imageRef.current
      );
      setOffset(boundedOffset);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [offset]);

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
    const boundedOffset = getBoundedOffset(
      newOffset,
      scale,
      canvasRef.current!,
      imageRef.current
    );
    setOffset(boundedOffset);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
    setOffset(getBoundedOffset(offset, newScale, canvas, image));
  };

  return {
    canvasRef,
    imageRef,
    isLoaded,
    isDragging,
    offset,
    scale,
    setIsDragging,
    setOffset,
    setScale,
    dragStart,
    setDragStart,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    getBoundedOffset,
    calculateCoverScale,
  };
};
