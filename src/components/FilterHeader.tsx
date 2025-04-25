import React from 'react';
import { FilterBadge } from './FilterBadge';
import { cn } from '../lib/utils';
import { Theme } from '../utils/theme';
import { Bell, ListIcon, User, MapPin, Zap, BookOpen } from 'lucide-react';
import { useFilterStore } from '../store/filterStore';

interface FilterHeaderProps {
  theme?: Theme;
  view: 'timebox' | 'lists' | 'calendar';
}

export const FilterHeader: React.FC<FilterHeaderProps> = ({ 
  theme = 'light',
  view 
}) => {
  const { filters } = useFilterStore();
  const currentFilters = filters[view];

  const getFilterIcon = (key: string) => {
    switch (key) {
      case 'timeStage':
        return <ListIcon className="w-4 h-4" />;
      case 'priority':
        return <Bell className="w-4 h-4" />;
      case 'assignee':
        return <User className="w-4 h-4" />;
      case 'location':
        return <MapPin className="w-4 h-4" />;
      case 'energy':
        return <Zap className="w-4 h-4" />;
      case 'story':
        return <BookOpen className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getFilterOptions = (key: string): string[] => {
    switch (key) {
      case 'timeStage':
        return ['All', 'Queue', 'Do', 'Doing', 'Today', 'Done'];
      case 'priority':
        return ['All', 'High', 'Medium', 'Low'];
      case 'assignee':
        return ['All', 'Me', 'Unassigned'];
      case 'location':
        return ['All', 'Home', 'Office', 'Outside'];
      case 'energy':
        return ['All', 'High', 'Medium', 'Low'];
      case 'story':
        return ['All', 'Brazil Vacation', 'Home Renovation', 'Career Goals'];
      default:
        return ['All'];
    }
  };

  const getFilterLabel = (key: string): string => {
    switch (key) {
      case 'timeStage':
        return 'Time Stage';
      case 'priority':
        return 'Priority';
      case 'assignee':
        return 'Assignee';
      case 'location':
        return 'Location';
      case 'energy':
        return 'Energy';
      case 'story':
        return 'Story';
      default:
        return key;
    }
  };

  const activeFilters = Object.entries(currentFilters)
    .filter(([_, value]) => value !== undefined && value !== null);

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "h-14 min-h-[56px] px-6 flex items-center space-x-4 border-b  border-b-[#E4E7EC] dark:border-b-[#1E293B] bg-white dark:bg-[#F9FAFB] rounded-lg",
      theme === 'dark' && "bg-[#1E293B]"
    )}>
      {activeFilters.map(([key, value]) => (
        <FilterBadge
          key={key}
          label={getFilterLabel(key)}
          value={value}
          options={getFilterOptions(key)}
          icon={getFilterIcon(key)}
          view={view}
          filterKey={key}
          theme={theme}
        />
      ))}
    </div>
  );
};