import React, { useState, useMemo, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

const Map = () => {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);
  const svgRef = useRef(null);

  const startPoint = { x: 200, y: 200 };
  const points = [
    {
      id: 1,
      x: 100,
      y: 20,
      pattern: "5,5",
      color: "#FFFFFF",
      name: "Majd-Qurtubah",
      distance: "3.2 km",
      duration: "12 min",
      description: "Historical district with modern amenities",
    },
    {
      id: 2,
      x: 300,
      y: 100,
      pattern: "10,5",
      color: "#FFFFFF",
      name: "Al Munsiyah",
      distance: "4.5 km",
      duration: "15 min",
      description: "Vibrant community hub with shopping centers",
    },
    {
      id: 3,
      x: 300,
      y: 300,
      pattern: "15,3,3,3",
      color: "#FFFFFF",
      name: "Majd-AL Murjan",
      distance: "2.8 km",
      duration: "10 min",
      description: "Peaceful residential area with parks",
    },
    {
      id: 4,
      x: 100,
      y: 300,
      pattern: "2,8,2,2",
      color: "#FFFFFF",
      name: "Roshn Front",
      distance: "5.1 km",
      duration: "18 min",
      description: "Business district with modern architecture",
    },
  ];

  const generatePath = (start, end, seed) => {
    const pseudoRandom = (index) => {
      return (Math.sin(seed * index) + 1) / 2;
    };

    const segments = Math.floor(pseudoRandom(1) * 3) + 2;
    const points = [start];

    for (let i = 0; i < segments; i++) {
      const prevPoint = points[points.length - 1];
      const nextPoint = {
        x: prevPoint.x + (end.x - prevPoint.x) / (segments - i),
        y: prevPoint.y,
      };

      if (i < segments - 1) {
        nextPoint.x += (pseudoRandom(i + 2) - 0.5) * 50;
        nextPoint.y += (pseudoRandom(i + 3) - 0.5) * 100;
      } else {
        nextPoint.x = end.x;
        nextPoint.y = end.y;
      }

      points.push(nextPoint);
    }

    return points;
  };

  const pathStrings = useMemo(() => {
    return points.reduce((acc, point) => {
      const pathPoints = generatePath(startPoint, point, point.id);
      const pathString = pathPoints.reduce((path, pathPoint, index) => {
        return (
          path + `${index === 0 ? "M" : "L"} ${pathPoint.x} ${pathPoint.y} `
        );
      }, "");
      return { ...acc, [point.id]: pathString };
    }, {});
  }, []);

  const handlePointClick = (point, e) => {
    e.stopPropagation();
    setSelectedPoint(point);
    setAnimationKey((prev) => prev + 1);
  };

  const handleBackgroundClick = () => {
    setSelectedPoint(null);
  };

  return (
    <div className="relative w-full h-96" onClick={handleBackgroundClick}>
      <img
        src="src/assets/landmark.jpg"
        alt="Map background"
        className="absolute w-full h-screen object-cover"
      />

      <div
        className={`absolute inset-0 bg-black transition-opacity duration-500 h-screen ${
          selectedPoint ? "opacity-50" : "opacity-0"
        }`}
      />

      {/* Fixed Info Card */}
      <div className="fixed bottom-4 left-4 z-50">
        <Card
          className={`w-64 bg-black/80 text-white border-gray-700 transition-opacity duration-300 ${
            selectedPoint ? "opacity-100" : "opacity-0"
          }`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {selectedPoint ? selectedPoint.name : "Select a location"}
            </CardTitle>
          </CardHeader>
          {selectedPoint && (
            <CardContent>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Distance:</span>
                  <span>{selectedPoint.distance}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{selectedPoint.duration}</span>
                </div>
                <p className="text-gray-300 mt-2">
                  {selectedPoint.description}
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 400"
        ref={svgRef}
      >
        {selectedPoint && (
          <path
            key={animationKey}
            d={pathStrings[selectedPoint.id]}
            stroke={selectedPoint.color}
            strokeWidth="4"
            fill="none"
            strokeDasharray={selectedPoint.pattern}
            className="animate-draw"
          />
        )}

        {/* Starting point */}
        <circle
          cx={startPoint.x}
          cy={startPoint.y}
          r="8"
          fill="#4CAF50"
          className="cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Surrounding points */}
        {points.map((point) => (
          <g key={point.id}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill={point.color}
              className="cursor-pointer hover:opacity-80 transition-colors"
              onClick={(e) => handlePointClick(point, e)}
            />
            <line
              x1={point.x - 15}
              y1={point.y + 15}
              x2={point.x + 15}
              y2={point.y + 15}
              stroke={point.color}
              strokeWidth="4"
              strokeDasharray={point.pattern}
              onClick={(e) => e.stopPropagation()}
            />
          </g>
        ))}
      </svg>

      <style jsx>{`
        @keyframes draw {
          from {
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        .animate-draw {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw 2s cubic-bezier(0.87, 0, 0.13, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Map;
