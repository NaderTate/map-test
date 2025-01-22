interface Unit {
  id: string;
  name: string;
  color: string;
  groupId?: string;
  area: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    clipPath?: string;
  };
}

interface Point {
  x: number;
  y: number;
}

// interface LocationPoint {
//   id: number;
//   x: number;
//   y: number;
//   name: string;
//   distance?: string;
//   duration?: string;
//   description?: string;
//   color?: string;
//   pathPoints?: PathPoint[];
// }

// interface StartPoint {
//   id: string;
//   x: number;
//   y: number;
//   name: string;
//   color: string;
//   locations: LocationPoint[];
// }

// interface LocationPoint {
//   id: number;
//   x: number;
//   y: number;
//   name: string;
//   description?: string;
//   distance?: string;
//   duration?: string;
//   color?: string;
//   startPointId?: string;
//   pathPoints?: Point[];
// }

interface StartPoint {
  id: string;
  lat: number;
  lng: number;
  name: string;
  color: string;
  locations: LocationPoint[];
}

interface LocationPoint {
  id: number;
  lat: number;
  lng: number;
  name: string;
  color?: string;
  distance?: string;
  duration?: string;
  description?: string;
  startPointId?: string;
}
