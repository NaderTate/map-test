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

interface Unit_ {
  _id: string;
  name: string;
  type: "apartment";
  compound: string;
  area: number;
  bedrooms: number;
  livingRooms: number;
  bathrooms: number;
  floor: Floor;
  price: number;
  building: string | null;
  street: string;
  status: UnitStatus;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
  images?: string[];
  hasDiningRoom?: boolean;
  hasDriverRoom?: boolean;
  hasElevator?: boolean;
  hasKitchen?: boolean;
  hasMaidRoom?: boolean;
  hasPool?: boolean;
  hasReception?: boolean;
  hasStorehouse?: boolean;
  hasWashingRoom?: boolean;
}

type UnitStatus = "vacant" | "occupied";
type Floor = "ground" | "first" | "second" | "attic";
interface FloorLabels {
  [key: string]: string;
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

type PorjectStatus = "sold" | "forSale" | "underConstruction";
interface Project {
  _id: string;
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
  status?: PorjectStatus;
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
