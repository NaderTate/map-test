export const calculateCoverScale = (
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number
) => {
  const widthScale = containerWidth / imageWidth;
  const heightScale = containerHeight / imageHeight;
  return Math.max(widthScale, heightScale);
};

export const getBoundedOffset = (
  newOffset: { x: number; y: number },
  scale: number,
  canvas: HTMLCanvasElement,
  image: HTMLImageElement
) => {
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;

  const minX = Math.min(0, canvas.width - scaledWidth);
  const minY = Math.min(0, canvas.height - scaledHeight);
  const maxX = Math.max(0, canvas.width - scaledWidth);
  const maxY = Math.max(0, canvas.height - scaledHeight);

  return {
    x: Math.min(maxX, Math.max(minX, newOffset.x)),
    y: Math.min(maxY, Math.max(minY, newOffset.y)),
  };
};
