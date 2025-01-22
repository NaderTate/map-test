import { useRef, useState, useEffect } from 'react';

export const usePathAnimation = () => {
  const [pathProgress, setPathProgress] = useState(0);
  const animationFrameRef = useRef<number>();

  const animatePath = (path: Point[], startTime: number) => {
    const animationDuration = 1000;
    const now = performance.now();
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / animationDuration, 1);

    const easeOutQuad = (t: number) => t * (2 - t);
    const easedProgress = easeOutQuad(progress);

    setPathProgress(easedProgress);

    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(() =>
        animatePath(path, startTime)
      );
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    pathProgress,
    setPathProgress,
    animatePath,
    animationFrameRef,
  };
};
