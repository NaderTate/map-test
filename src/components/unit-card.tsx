import { Badge } from "./ui/badge";

import { Card, CardContent, CardTitle, CardHeader } from "./ui/card";

import { BedDouble, Bath, Square, Building } from "lucide-react";

type Props = { unit: Unit_ };

const UnitCard = ({ unit }: Props) => {
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
            <span className="font-medium">{getFloorLabel(unit.floor)}</span>
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
  );
};

export default UnitCard;
