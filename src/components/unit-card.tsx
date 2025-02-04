import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardTitle, CardHeader } from "./ui/card";
import { BedDouble, Bath, Square, Building } from "lucide-react";

type Props = { unit: Unit_; onClick?: () => void };

const InfoField = ({
  value,
  label,
  icon,
}: {
  value: React.ReactNode;
  label: string;
  icon: React.ReactNode;
}) => (
  <div className="flex w-full items-center justify-between gap-x-2">
    <span className="font-medium whitespace-nowrap">{value}</span>
    <div className="flex items-center gap-2">
      <span className="text-sm">{label}</span>
      {icon}
    </div>
  </div>
);

const UnitCard = ({ unit, onClick }: Props) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const dummyImage =
    "https://media.istockphoto.com/id/506903162/photo/luxurious-villa-with-pool.jpg?s=612x612&w=0&k=20&c=Ek2P0DQ9nHQero4m9mdDyCVMVq3TLnXigxNPcZbgX2E=";

  const images =
    !unit?.images || unit?.images.length == 0 ? [dummyImage] : unit.images;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getStatusColor = (status: UnitStatus): string => {
    return status === "vacant"
      ? "bg-green-100 hover:bg-green-100 text-green-800"
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
    <Card
      onClick={onClick}
      className={`overflow-hidden hover:shadow-lg transition-transform duration-300 ${
        onClick && "cursor-pointer hover:scale-[1.02]"
      }`}
    >
      <CardHeader className="relative p-0 overflow-hidden h-48">
        <div className="relative h-full">
          <img
            src={images[currentImageIndex]}
            alt="Unit image"
            className="w-full h-full object-cover"
          />

          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/30 to-transparent">
            <Badge className={getStatusColor(unit.status)}>
              {getStatusText(unit.status)}
            </Badge>
            <CardTitle className="text-xl font-bold text-white">
              شقة رقم {unit.name}
            </CardTitle>
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="flex flex-col items-end gap-y-4">
          <InfoField
            value={
              <div className="flex">
                {unit.area}
                <span>م²</span>
              </div>
            }
            label="المساحة"
            icon={<Square className="w-5 h-5 text-gray-500" />}
          />

          {unit?.outdoorPatio && (
            <InfoField
              value={
                <div className="flex">
                  {unit.outdoorPatio}
                  <span>م²</span>
                </div>
              }
              label="مساحة الفناء الخارجي"
              icon={<Square className="w-5 h-5 text-gray-500 flex-shrink-0" />}
            />
          )}

          <InfoField
            value={unit.bedrooms}
            label="غرف النوم"
            icon={<BedDouble className="w-5 h-5 text-gray-500" />}
          />

          <InfoField
            value={unit.bathrooms}
            label="الحمامات"
            icon={<Bath className="w-5 h-5 text-gray-500" />}
          />

          <InfoField
            value={getFloorLabel(unit.floor)}
            label="الطابق"
            icon={<Building className="w-5 h-5 text-gray-500" />}
          />

          {unit.status === "vacant" && (
            <div className="mt-4 pt-4 border-t w-full">
              <div className="flex justify-between gap-x-2 items-center">
                <span className="text-lg font-bold text-green-600">
                  {formatPrice(unit.price)}
                </span>
                <span className="text-sm font-medium">السعر</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UnitCard;
