import React, { useState } from 'react';
import { Switch } from './ui/switch';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ChevronDown } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(false);

  // Get unique groups from units
  const groups = Array.from(
    new Set(units.map((unit) => unit.groupId).filter(Boolean))
  );

  // Count units in each group
  const groupCounts = groups.reduce((acc, groupId) => {
    acc[groupId || ''] = units.filter(
      (unit) => unit.groupId === groupId
    ).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="fixed top-4 left-20 w-72  backdrop-blur-md shadow-lg rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between transition-colors"
      >
        <span className="font-medium">Units Filter</span>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <CardContent className="bg-white p-4">
          <div className="space-y-3">
            {groups.map((groupId) => {
              const isVisible = visibleGroups.includes(groupId || '');
              const unitCount = groupCounts[groupId || ''];

              return (
                <div
                  key={groupId}
                  className="flex items-center justify-between rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-gray-700">{groupId}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {unitCount} {unitCount === 1 ? 'unit' : 'units'}
                      </Badge>
                    </div>
                  </div>
                  <Switch
                    checked={isVisible}
                    onCheckedChange={() => onToggleGroup(groupId || '')}
                    className="data-[state=checked]:bg-gray-600"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default UnitsFilter;
