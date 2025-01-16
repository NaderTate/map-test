import React, { useState, useRef, MouseEvent } from 'react';

interface DraggableMapProps {
  mapImageUrl: string;
}

const DraggableMap: React.FC<DraggableMapProps> = ({ mapImageUrl }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="map-container"
      style={{
        overflow: 'hidden',
        width: '100%',
        height: '100vh',
        position: 'relative',
      }}
    >
      <div
        ref={mapRef}
        style={{
          position: 'absolute',
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={mapImageUrl}
          alt="Draggable Map"
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
          draggable={false}
        />
      </div>
    </div>
  );
};

export default DraggableMap;
