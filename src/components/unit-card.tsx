import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardTitle, CardHeader } from "./ui/card";
import { BedDouble, Bath, Square, Building } from "lucide-react";

type Props = { unit: Unit_; onClick?: () => void };

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
        <CardContent className="pt-6">
          {" "}
          <div className="space-y-4">
            {" "}
            <div className="flex items-center justify-between">
              {" "}
              <span className="font-medium whitespace-nowrap">
                <div className="flex">
                  {" "}
                  {unit.area} <span>م²</span>
                </div>
              </span>{" "}
              <div className="flex items-center gap-2">
                {" "}
                <span className="text-sm"> المساحة </span>
                {"  "}
                <Square className="w-5 h-5 text-gray-500" />{" "}
              </div>{" "}
            </div>{" "}
            <div className="flex items-center justify-between">
              {" "}
              <span className="font-medium">{unit.bedrooms}</span>{" "}
              <div className="flex items-center gap-2">
                {" "}
                <span className="text-sm">غرف النوم</span>{" "}
                <BedDouble className="w-5 h-5 text-gray-500" />{" "}
              </div>{" "}
            </div>{" "}
            <div className="flex items-center justify-between">
              {" "}
              <span className="font-medium">{unit.bathrooms}</span>{" "}
              <div className="flex items-center gap-2">
                {" "}
                <span className="text-sm">الحمامات</span>{" "}
                <Bath className="w-5 h-5 text-gray-500" />{" "}
              </div>{" "}
            </div>{" "}
            <div className="flex items-center justify-between">
              {" "}
              <span className="font-medium">
                {getFloorLabel(unit.floor)}
              </span>{" "}
              <div className="flex items-center gap-2">
                {" "}
                <span className="text-sm">الطابق</span>{" "}
                <Building className="w-5 h-5 text-gray-500" />{" "}
              </div>{" "}
            </div>{" "}
            {unit.status === "vacant" && (
              <div className="mt-4 pt-4 border-t">
                {" "}
                <div className="flex justify-between items-center">
                  {" "}
                  <span className="text-lg font-bold text-green-600">
                    {" "}
                    {formatPrice(unit.price)}{" "}
                  </span>{" "}
                  <span className="text-sm font-medium">السعر</span>{" "}
                </div>{" "}
              </div>
            )}{" "}
          </div>{" "}
        </CardContent>
      </CardContent>
    </Card>
  );
};

export default UnitCard;
