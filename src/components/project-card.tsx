/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import UnitsPopup from "./units-popup";

interface ProjectCardProps {
  project: Project;
  handleLocationClick: (point: LocationPoint | Project) => void;
}

const ProjectCard = ({ project, handleLocationClick }: ProjectCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [unitsData, setUnitsData] = useState<{ units: Unit_[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUnitsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://aleen-server.wessal.app/api/landing/compounds/${project._id}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      setUnitsData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnitsData();
  }, [isDialogOpen]);

  return (
    <>
      <div className="fixed bottom-4 left-4 flex flex-col md:flex-row md:items-end gap-4 z-20">
        {/* Main Card */}
        <div
          className="w-80 h-auto min-h-[15rem] rounded-lg overflow-hidden relative"
          style={{
            backgroundImage: `url(${
              project.imageUrl || "/default-location.jpg"
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

          <div className="relative h-full p-4 flex flex-col justify-between text-white">
            <h3 className="text-xl font-bold mb-2">{project.arabicName}</h3>

            <div className="flex flex-col gap-4">
              {/* Stats - Modified container */}
              <div className="grid grid-cols-3 items-center gap-4 md:absolute md:-bottom-44 md:left-0 md:right-0 md:px-4 md:pb-4">
                <div className="text-center">
                  <span className="block text-lg font-bold">
                    {project.locations.length}
                  </span>
                  <span className="text-xs text-gray-300">الاماكن القريبة</span>
                </div>
                {project.units && project.units > 0 ? (
                  <div
                    onClick={() => setIsDialogOpen(true)}
                    className="text-center cursor-pointer hover:bg-white/10 rounded-lg p-2 transition-colors m-auto mb-0"
                  >
                    <span className="block text-lg font-bold">
                      {project.units || 0}
                    </span>
                    <span className="text-xs text-gray-300">عدد الوحدات</span>
                  </div>
                ) : (
                  <span className="whitespace-nowrap"> تحت الانشاء</span>
                )}
              </div>

              {/* Mobile Locations - Inside card (unchanged) */}
              <div className="flex flex-wrap gap-2 md:hidden">
                {project.locations.map((location) => (
                  <div
                    onClick={() => handleLocationClick(location)}
                    tabIndex={0}
                    key={location.id}
                    className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-xs cursor-pointer hover:bg-white/20 transition-colors"
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
        </div>

        {/* Desktop Locations Panel */}
        <div className="hidden md:flex flex-col gap-2 bg-black/80 p-4 rounded-lg backdrop-blur-sm">
          <h4 className="text-white text-lg font-semibold mb-2">
            المواقع القريبة
          </h4>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {project.locations.map((location) => (
              <div
                onClick={() => handleLocationClick(location)}
                tabIndex={0}
                key={location.id}
                className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded cursor-pointer hover:bg-white/20 transition-colors text-white"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: location.color || project.color,
                  }}
                />
                <span className="text-sm">{location.arabicName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-w-[90vw] max-h-[80vh] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-right mb-4 mr-3">
              {project.arabicName} - تفاصيل الوحدات
            </DialogTitle>
          </DialogHeader>

          {isLoading && (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-center p-4">
              حدث خطأ في تحميل البيانات. الرجاء المحاولة مرة أخرى.
            </div>
          )}

          {unitsData && <UnitsPopup unitsData={unitsData} />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectCard;
