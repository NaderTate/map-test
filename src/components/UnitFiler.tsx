import React from "react";
import { Switch } from "./ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

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
    rotation: number;
    clipPath: string;
  };
}

interface UnitsFilterProps {
  units: Unit[];
  visibleGroups: string[];
  onToggleGroup: (groupId: string) => void;
}

const UnitsFilter: React.FC<UnitsFilterProps> = ({
  units,
  visibleGroups,
  onToggleGroup,
}) => {
  // Get unique groups from units
  const groups = Array.from(
    new Set(units.map((unit) => unit.groupId).filter(Boolean))
  );

  return (
    <Card className="fixed top-4 right-4 w-64 bg-white/90 backdrop-blur-sm shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Units Filter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {groups.map((groupId) => {
            const groupUnits = units.filter((unit) => unit.groupId === groupId);
            const isVisible = visibleGroups.includes(groupId || "");

            return (
              <div key={groupId} className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {groupId
                      ?.replace(/-/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                  <span className="text-xs text-gray-500">
                    {groupUnits.map((u) => u.name).join(", ")}
                  </span>
                </div>
                <Switch
                  checked={isVisible}
                  onCheckedChange={() => onToggleGroup(groupId || "")}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default UnitsFilter;
