import { useState, useRef, useEffect, useCallback } from 'react';
import {
  GoogleMap,
  MarkerF,
  useLoadScript,
  PolylineF as Polyline,
} from '@react-google-maps/api';
import ReactDOMServer from 'react-dom/server';

import ProjectCard from './project-card';
import LocationCard from './location-card';
import MapMarker from './map-marker';

import { projects } from '../data/locations';
import {
  customMapStyle,
  mapContainerStyle,
  zoom,
  restriction,
  center,
} from '../data/map-config';

const CustomMap = () => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationPoint | null>(null);
  const animationRef = useRef<number>();
  const [path, setPath] = useState<PathPoint[]>([]);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [showAllProjects, setShowAllProjects] = useState(true);

  const mapRef = useRef<google.maps.Map | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const handleLocationClick = (point: LocationPoint | Project) => {
    if ('locations' in point) {
      setActiveProject(point);
      setSelectedLocation(null);
      setShowAllProjects(false);
      if (mapRef.current) {
        mapRef.current.panTo({ lat: point.lat, lng: point.lng });
        mapRef.current.setZoom(15);
        setCurrentZoom(15);
      }
    } else if (activeProject) {
      fetchDirections(activeProject, point);
      setSelectedLocation(point);
    }
  };

  const handleBackClick = () => {
    setActiveProject(null);
    setSelectedLocation(null);
    setShowAllProjects(true);
    setPath([]);
    if (mapRef.current) {
      mapRef.current.setZoom(zoom);
      mapRef.current.panTo(center);
      setCurrentZoom(zoom);
    }
  };

  const fetchDirections = (origin: Project, destination: LocationPoint) => {
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
        clearTimeout(animationRef.current);
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const getNearbyMarkerIcon = (
    point: Project | LocationPoint,
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
    const textWidth = ctx.measureText(point.arabicName).width;
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

    // Draw text
    context.fillStyle = '#000000';
    context.font = `bold ${fontSize}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.fillText(point.arabicName, totalWidth / 2, size + padding);

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
    setSelectedLocation(null);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setPath([]);
  }, []);

  if (loadError) return 'Error loading maps';
  if (!isLoaded) return 'Loading Maps';

  return (
    <div className="w-screen h-screen">
      {!showAllProjects && (
        <button
          onClick={handleBackClick}
          className="fixed top-4 left-4 z-20 px-4 py-2 bg-white/90 hover:bg-white 
            text-black rounded-lg shadow-lg flex items-center gap-2 transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Back to All Projects
        </button>
      )}

      <GoogleMap
        mapContainerStyle={{
          ...mapContainerStyle,
          position: 'relative',
        }}
        zoom={currentZoom}
        center={center}
        options={{
          styles: customMapStyle,
          restriction,
          disableDefaultUI: true,
          zoomControl: false,
        }}
        onClick={handleMapClick}
        onLoad={onMapLoad}
      >
        {showAllProjects &&
          projects.map((project) => (
            <MarkerF
              key={project.id}
              position={{ lat: project.lat, lng: project.lng }}
              onClick={() => handleLocationClick(project)}
              icon={{
                url: `data:image/svg+xml;utf8,${encodeURIComponent(
                  ReactDOMServer.renderToString(
                    <MapMarker
                      color={project.color}
                      name={project.arabicName}
                      id={project.id.toString()}
                      width={70}
                      height={65}
                    />
                  )
                )}`,
                anchor: new google.maps.Point(17, 42), // Center bottom of marker
              }}
            />
          ))}

        {!showAllProjects && activeProject && (
          <>
            <MarkerF
              key={activeProject.id}
              position={{ lat: activeProject.lat, lng: activeProject.lng }}
              icon={{
                url: `data:image/svg+xml;utf8,${encodeURIComponent(
                  ReactDOMServer.renderToString(
                    <MapMarker
                      color={activeProject.color}
                      id={activeProject.id.toString()}
                      name={activeProject.arabicName}
                      width={70}
                      height={65}
                    />
                  )
                )}`,
                anchor: new google.maps.Point(17, 42),
              }}
              options={{ opacity: 1 }}
            />

            {activeProject.locations.map((location) => (
              <MarkerF
                key={location.id}
                position={{ lat: location.lat, lng: location.lng }}
                onClick={() => handleLocationClick(location)}
                icon={getNearbyMarkerIcon(
                  location,
                  selectedLocation?.id === location.id
                )}
              />
            ))}
          </>
        )}

        <Polyline
          path={path}
          options={{
            strokeColor: '#fff',
            strokeWeight: 4,
            zIndex: 998,
          }}
        />
      </GoogleMap>

      {activeProject && !selectedLocation && (
        <ProjectCard project={activeProject} />
      )}

      {selectedLocation && <LocationCard location={selectedLocation} />}
    </div>
  );
};

export default CustomMap;
