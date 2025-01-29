/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardTitle, CardHeader } from "./ui/card";
import { BedDouble, Bath, Square, Building } from "lucide-react";

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

  const getStatusColor = (status: UnitStatus): string => {
    return status === "vacant"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getStatusText = (status: UnitStatus): string => {
    return status === "vacant" ? "متاح" : "مشغول";
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getFloorLabel = (floor: Floor): string => {
    const labels: FloorLabels = {
      ground: "الأرضي",
      first: "الأول",
      second: "الثاني",
      attic: "العلوي",
    };
    return labels[floor] || floor;
  };

  return (
    <>
      <div
        className="fixed bottom-4 left-4 w-80 h-60 rounded-lg overflow-hidden z-20"
        style={{
          backgroundImage: `url(${
            project.imageUrl || "/default-location.jpg"
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        <div className="relative h-full p-4 flex flex-col justify-end text-white">
          <h3 className="text-xl font-bold mb-2">{project.arabicName}</h3>

          <div className="grid grid-cols-3 items-center gap-4 mb-4">
            <div className="text-center">
              <span className="block text-lg font-bold">
                {project.locations.length}
              </span>
              <span className="text-xs text-gray-300">الاماكن القريبة</span>
            </div>
            {project.units && project.units > 0 ? (
              <div
                onClick={() => setIsDialogOpen(true)}
                className="text-center cursor-pointer hover:bg-white/10 rounded-lg p-2 transition-colors"
              >
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-w-[90vw] max-h-[80vh] overflow-y-auto rounded-lg">
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

          {unitsData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unitsData?.units?.map((unit: Unit_) => (
                <Card
                  key={unit._id}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <CardHeader className="bg-gray-50">
                    <div className="flex justify-between items-center">
                      <Badge className={getStatusColor(unit.status)}>
                        {getStatusText(unit.status)}
                      </Badge>
                      <CardTitle className="text-xl font-bold">
                        شقة رقم {unit.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{unit.area} م²</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">المساحة</span>
                          <Square className="w-5 h-5 text-gray-500" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium">{unit.bedrooms}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">غرف النوم</span>
                          <BedDouble className="w-5 h-5 text-gray-500" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium">{unit.bathrooms}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">الحمامات</span>
                          <Bath className="w-5 h-5 text-gray-500" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {getFloorLabel(unit.floor)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">الطابق</span>
                          <Building className="w-5 h-5 text-gray-500" />
                        </div>
                      </div>
                      {unit.status === "vacant" && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">السعر</span>
                            <span className="text-lg font-bold text-green-600">
                              {formatPrice(unit.price)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectCard;
