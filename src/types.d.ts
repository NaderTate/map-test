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

interface PathPoint {
  x: number;
  y: number;
}

interface LocationPoint {
  id: number;
  x: number;
  y: number;
  name: string;
  distance?: string;
  duration?: string;
  description?: string;
  color?: string;
  pathPoints?: PathPoint[];
}
