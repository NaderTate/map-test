export const startPoint = { x: 0.445, y: 0.585 };

export const locationPoints: LocationPoint[] = [
  {
    id: 1,
    x: 0.455,
    y: 0.575,
    name: 'مول النخيل',
    distance: '3.2 km',
    duration: '12 min',
    description: 'Location A description',
    pathPoints: [
      startPoint, // Start point
      { x: 0.45, y: 0.5 }, // Via point 1
      { x: 0.425, y: 0.456 }, // Via point 2
      { x: 0.35, y: 0.5 }, // Via point 2
      // { x: 0.3, y: 0.35 }, // Via point 2
      { x: 0.2, y: 0.3 }, // End point
    ],
  },
  {
    id: 2,
    x: 0.46,
    y: 0.09,
    name: 'مطار الملك خالد',
    distance: '2.1 km',
    duration: '8 min',
    description: 'Location B description',
    pathPoints: [
      startPoint,
      { x: 0.57, y: 0.48 },
      { x: 0.61, y: 0.52 },
      { x: 0.7, y: 0.4 },
    ],
  },
];
