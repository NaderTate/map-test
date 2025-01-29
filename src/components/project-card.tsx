interface ProjectCardProps {
  project: Project;
  handleLocationClick: (point: LocationPoint | Project) => void;
}

const ProjectCard = ({ project, handleLocationClick }: ProjectCardProps) => {
  return (
    <div
      className="fixed bottom-4 left-4 w-80 h-60 rounded-lg overflow-hidden z-20"
      style={{
        backgroundImage: `url(${project.imageUrl || "/default-location.jpg"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

      {/* Content */}
      <div className="relative h-full p-4 flex flex-col justify-end  text-white">
        <h3 className="text-xl font-bold mb-2">{project.arabicName}</h3>

        <div className="grid grid-cols-3 items-center gap-4 mb-4">
          <div className="text-center">
            <span className="block text-lg font-bold">
              {project.locations.length}
            </span>
            <span className="text-xs text-gray-300">الاماكن القريبة</span>
          </div>
          {project.units && project.units > 0 ? (
            <div className="text-center">
              <span className="block text-lg font-bold">
                {project.units || 0}
              </span>
              <span className="text-xs text-gray-300">عدد الوحدات</span>
            </div>
          ) : (
            <span className="whitespace-nowrap"> تحت الانشاء</span>
          )}

          {project.buildings && (
            <div className="text-center">
              <span className="block text-lg font-bold">
                {project.buildings}
              </span>
              <span className="text-xs text-gray-300">Buildings</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {project.locations.map((location) => (
            <div
              onClick={() => handleLocationClick(location)}
              tabIndex={0}
              key={location.id}
              className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-xs cursor-pointer"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: location.color || project.color,
                }}
              />
              <span>{location.arabicName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
