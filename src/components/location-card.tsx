interface LocationCardProps {
  location: LocationPoint;
}

const LocationCard = ({ location }: LocationCardProps) => {
  return (
    <div className="fixed bottom-4 left-4 w-64 bg-black/80 text-white rounded-lg p-4 z-20">
      <h3 className="text-lg font-bold mb-2">{location.arabicName}</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Distance:</span>
          <span>{location.distance}</span>
        </div>
        <div className="flex justify-between">
          <span>Duration:</span>
          <span>{location.duration}</span>
        </div>
        <p className="text-gray-300 mt-2">{location.description}</p>
      </div>
    </div>
  );
};

export default LocationCard;
