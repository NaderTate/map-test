import { useState, useRef, useEffect, useCallback } from 'react';

import {
  GoogleMap,
  MarkerF,
  useLoadScript,
  PolylineF as Polyline,
} from '@react-google-maps/api';

import { startPoints } from '../data/locations';

interface RouteInfo {
  route: PathPoint[];
  distance: string;
  duration: string;
}

interface DirectionsResult {
  routes: {
    overview_path: google.maps.LatLng[];
  }[];
}

type PathPoint = google.maps.LatLngLiteral;

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 24.75654746918181,
  lng: 46.70669713520228,
};

const restriction = {
  latLngBounds: {
    north: 25,
    south: 24.5,
    west: 46.5,
    east: 47,
  },
};

const zoom = 12;

const customMapStyle = [
  {
    featureType: 'administrative',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off',
      },
      {
        hue: '#ff0000',
      },
      {
        gamma: '0.00',
      },
      {
        lightness: '37',
      },
    ],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'administrative.country',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'administrative.province',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'administrative.province',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'administrative.province',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'geometry',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels.text',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'landscape',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'landscape.natural.landcover',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.medical',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {
        visibility: 'simplified',
      },
      {
        color: '#74243d',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [
      {
        weight: '0.60',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [
      {
        weight: '2.50',
      },
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'all',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'road.arterial',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry.stroke',
    stylers: [
      {
        visibility: 'on',
      },
      {
        gamma: '0.00',
      },
      {
        weight: '0.01',
      },
    ],
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road.local',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry.stroke',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'transit',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'transit',
    elementType: 'geometry.stroke',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'transit.station.airport',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
];

const CustomMap = () => {
  const [activeStartPoint, setActiveStartPoint] = useState<StartPoint | null>(
    null
  );
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationPoint | null>(null);
  const animationRef = useRef<number>();
  const [path, setPath] = useState<PathPoint[]>([]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    // libraries: ['places'],
  });

  const handleLocationClick = (point: LocationPoint | StartPoint) => {
    if ('locations' in point) {
      setActiveStartPoint(point);
      setSelectedLocation(null);
    } else if (activeStartPoint) {
      fetchDirections(activeStartPoint, point);
      setSelectedLocation(point);
    }
  };

  const fetchDirections = (origin: StartPoint, destination: LocationPoint) => {
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (
        result: DirectionsResult | null,
        status: google.maps.DirectionsStatus
      ) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          const route = result.routes[0].overview_path.map((point) => ({
            lat: point.lat(),
            lng: point.lng(),
          }));

          const leg = result.routes[0].legs[0];
          const routeInfo: RouteInfo = {
            route,
            distance: leg.distance?.text || '',
            duration: leg.duration?.text || '',
          };

          setSelectedLocation((prev) =>
            prev
              ? {
                  ...prev,
                  distance: routeInfo.distance,
                  duration: routeInfo.duration,
                }
              : null
          );

          animatePolyline(route);
        } else {
          console.error(`Error fetching directions ${status}`);
        }
      }
    );
  };

  const animatePolyline = (route: PathPoint[]) => {
    setPath([]);
    setShowOverlay(true);
    let index = 0;
    const animationDuration = 200;
    const stepDuration = animationDuration / route.length;

    const animate = () => {
      if (index < route.length) {
        setPath((prevPath) => [...prevPath, route[index]]);
        index++;
        animationRef.current = setTimeout(() => {
          requestAnimationFrame(animate);
        }, stepDuration) as unknown as number;
      }
    };

    animate();
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        setShowOverlay(false);
        clearTimeout(animationRef.current);
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const getMarkerIcon = (
    point: StartPoint | LocationPoint,
    isSelected: boolean
  ) => {
    const scale = 1;
    const size = isSelected ? 38 : 30;
    const innerSize = size * 0.6;
    const centerSize = size * 0.2;
    const padding = 8;
    const fontSize = 12;

    // Create canvas for marker and label
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    // Set font for measuring text
    ctx.font = `${fontSize}px Arial`;
    const textWidth = ctx.measureText(point.name).width;
    const totalWidth = Math.max(size, textWidth + padding * 2);
    const totalHeight = size + fontSize + padding * 2;

    // Set canvas size to accommodate both marker and label
    canvas.width = totalWidth;
    canvas.height = totalHeight;

    // Re-get context after resize and set font again
    const context = canvas.getContext('2d');
    if (!context) return undefined;
    context.font = `${fontSize}px Arial`;

    // Draw marker circles
    const centerX = totalWidth / 2;
    // Outer white circle
    context.beginPath();
    context.arc(centerX, size / 2, size / 2, 0, Math.PI * 2);
    context.fillStyle = '#FFFFFF';
    context.fill();

    // Middle colored circle
    context.beginPath();
    context.arc(centerX, size / 2, innerSize / 2, 0, Math.PI * 2);
    context.fillStyle = point.color || '#000000';
    context.fill();

    // Inner white circle
    context.beginPath();
    context.arc(centerX, size / 2, innerSize / 2 - 2, 0, Math.PI * 2);
    context.fillStyle = '#FFFFFF';
    context.fill();

    // Center colored circle
    context.beginPath();
    context.arc(centerX, size / 2, centerSize / 2, 0, Math.PI * 2);
    context.fillStyle = isSelected ? '#ff0000' : point.color || '#000000';
    context.fill();

    // Draw label background
    context.fillStyle = 'rgba(255, 255, 255, 0.9)';
    context.fillRect(0, size + padding / 2, totalWidth, fontSize + padding);

    // Draw text
    context.fillStyle = '#000000';
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.fillText(point.name, totalWidth / 2, size + padding);

    return {
      url: canvas.toDataURL(),
      scaledSize: new google.maps.Size(totalWidth * scale, totalHeight * scale),
      anchor: new google.maps.Point(
        (totalWidth * scale) / 2,
        (size * scale) / 2
      ),
    };
  };

  const handleMapClick = useCallback(() => {
    // setActiveStartPoint(null);
    setSelectedLocation(null);
    setShowOverlay(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setPath([]);
  }, []);

  if (loadError) return 'Error loading maps';
  if (!isLoaded) return 'Loading Maps';

  return (
    <div className="w-screen h-screen">
      {/* {showOverlay && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 2,
          }}
        />
      )} */}
      <GoogleMap
        mapContainerStyle={{
          ...mapContainerStyle,
          position: 'relative',
          zIndex: 1,
        }}
        zoom={zoom}
        center={center}
        options={{
          styles: customMapStyle,
          restriction,
          disableDefaultUI: true,
          zoomControl: false,
        }}
        onClick={handleMapClick}
      >
        {/* {showOverlay && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              pointerEvents: 'none',
              zIndex: 1, // Below markers but above map
            }}
          />
        )} */}

        {startPoints.map((startPoint) => (
          <MarkerF
            key={startPoint.id}
            position={{ lat: startPoint.lat, lng: startPoint.lng }}
            onClick={() => handleLocationClick(startPoint)}
            icon={getMarkerIcon(
              startPoint,
              activeStartPoint?.id === startPoint.id
            )}
            options={{
              title: startPoint.name,
              opacity: activeStartPoint?.id === startPoint.id ? 1 : 0.7,
            }}
          />
        ))}

        {activeStartPoint?.locations.map((location) => (
          <MarkerF
            key={location.id}
            position={{ lat: location.lat, lng: location.lng }}
            onClick={() => handleLocationClick(location)}
            icon={getMarkerIcon(location, selectedLocation?.id === location.id)}
            options={
              {
                //   opacity: selectedLocation?.id === location.id ? 1 : 0.7,
              }
            }
          />
        ))}

        <Polyline
          path={path}
          options={{
            strokeColor: '#fff',
            strokeWeight: 4,
            zIndex: 998,
          }}
        />
      </GoogleMap>

      {/* Start Point info card */}
      {activeStartPoint && !selectedLocation && (
        <div className="fixed bottom-4 left-4 w-64 bg-black/80 text-white rounded-lg p-4 z-20">
          <h3 className="text-lg font-bold mb-2">{activeStartPoint.name}</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Nearby Locations:</span>
              <span>{activeStartPoint.locations.length}</span>
            </div>
            <div className="mt-2">
              <h4 className="font-medium mb-1">Available Destinations:</h4>
              <ul className="space-y-1">
                {activeStartPoint.locations.map((location) => (
                  <li
                    key={location.id}
                    className="flex items-center space-x-2 text-xs"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          location.color || activeStartPoint.color,
                      }}
                    />
                    <span>{location.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Location info card */}
      {selectedLocation && (
        <div className="fixed bottom-4 left-4 w-64 bg-black/80 text-white rounded-lg p-4 z-20">
          <h3 className="text-lg font-bold mb-2">{selectedLocation.name}</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Distance:</span>
              <span>{selectedLocation.distance}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span>{selectedLocation.duration}</span>
            </div>
            <p className="text-gray-300 mt-2">{selectedLocation.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomMap;
