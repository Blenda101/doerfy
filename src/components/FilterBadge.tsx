import React, { useState, useRef, useEffect } from 'react';
import { Badge } from './ui/badge';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Theme } from '../utils/theme';
import { useFilterStore } from '../store/filterStore';

interface FilterBadgeProps {
  label: string;
  value: string | string[];
  options: string[];
  icon?: React.ReactNode;
  view: 'timebox' | 'lists' | 'calendar';
  filterKey: string;
  theme?: Theme;
}

export const FilterBadge: React.FC<FilterBadgeProps> = ({
  label,
  value,
  options,
  icon,
  view,
  filterKey,
  theme = 'light'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { setFilter, clearFilter } = useFilterStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        if (!isOpen) {
          setIsOpen(true);
          e.preventDefault();
        }
        break;
    }
  };

  const handleOptionSelect = (option: string) => {
    const newValue = option === 'All' ? undefined : option.toLowerCase();
    setFilter(view, { [filterKey]: newValue });
    setIsOpen(false);
  };

  const getDisplayValue = () => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value;
  };

  return (
    <div 
      ref={dropdownRef}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Badge
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`${label} filter: ${getDisplayValue()}`}
        className={cn(
          "h-[34px] px-4 rounded flex items-center gap-2 group relative cursor-pointer transition-all duration-200",
          theme === 'dark' 
            ? "bg-[#334155] text-gray-200 hover:bg-[#3e4a63]" 
            : "bg-[#efefef] text-black hover:bg-[#e5e5e5]"
        )}
      >
        <div className="flex items-center gap-2 pr-6">
          {icon}
          <span className="font-normal text-sm whitespace-nowrap">{getDisplayValue()}</span>
        </div>

        <div className="absolute right-2 flex items-center gap-1">
          {isHovered && (
            <div className="absolute -top-2 right-6 transform -translate-y-1/2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFilter(view, filterKey as any);
                }}
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center",
                  "transition-all duration-200",
                  "ring-[0.5px] ring-inset",
                  theme === 'dark'
                    ? "bg-slate-600 hover:bg-slate-500 ring-white/10"
                    : "bg-gray-200 hover:bg-gray-300 ring-black/5",
                  "group/close"
                )}
                aria-label={`Clear ${label} filter`}
              >
                <X 
                  className={cn(
                    "w-3 h-3 transition-colors duration-200",
                    theme === 'dark'
                      ? "text-gray-400 group-hover/close:text-white"
                      : "text-gray-500 group-hover/close:text-gray-700"
                  )}
                />
              </button>
            </div>
          )}
          <ChevronDown 
            className={cn(
              "w-4 h-4 transition-all duration-200 opacity-0 group-hover:opacity-100",
              isOpen && "transform rotate-180",
              theme === 'dark' ? "text-gray-400" : "text-gray-600"
            )}
          />
        </div>
      </Badge>

      {isOpen && (
        <div
          className={cn(
            "absolute z-[60] mt-1 py-1 w-48 rounded-md shadow-lg",
            "bg-white dark:bg-slate-800",
            "border border-gray-200 dark:border-slate-600",
            "animate-in fade-in-0 zoom-in-95",
            "overflow-hidden"
          )}
          role="listbox"
          aria-label={`${label} options`}
          style={{ 
            transform: 'translateY(4px)'
          }}
        >
          {options.map((option) => (
            <div
              key={option}
              role="option"
              aria-selected={value === option.toLowerCase()}
              onClick={() => handleOptionSelect(option)}
              className={cn(
                "px-4 py-2 text-sm cursor-pointer transition-colors duration-200",
                "hover:bg-gray-100 dark:hover:bg-slate-700",
                "text-gray-900 dark:text-slate-200",
                value === option.toLowerCase() && (
                  theme === 'dark' 
                    ? "bg-slate-700" 
                    : "bg-gray-100"
                )
              )}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};