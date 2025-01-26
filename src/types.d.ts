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

interface RouteInfo {
  route: PathPoint[];
  distance: string;
  duration: string;
}

interface DirectionsResult {
  routes: {
    overview_path: google.maps.LatLng[];
    legs: {
      distance?: { text: string };
      duration?: { text: string };
    }[];
  }[];
}

type PathPoint = google.maps.LatLngLiteral;

interface Project {
  id: string;
  lat: number;
  lng: number;
  name: string;
  arabicName: string;
  color?: string;
  locations: LocationPoint[];
  zoomLevel?: number;
  imageUrl?: string;
  units?: number;
  buildings?: number;
}

interface LocationPoint {
  id: number;
  lat: number;
  lng: number;
  name: string;
  arabicName: string;
  color?: string;
  distance?: string;
  duration?: string;
  description?: string;
  startPointId?: string;
}
