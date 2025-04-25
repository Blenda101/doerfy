import React, { useState, useRef, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { XIcon, PlusIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface LabelEditorProps {
  labels: string[];
  onChange: (labels: string[]) => void;
}

export const LabelEditor: React.FC<LabelEditorProps> = ({
  labels,
  onChange,
}) => {
  const [newLabel, setNewLabel] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const commonLabels = [
    'work', 'personal', 'urgent', 'important', 'meeting',
    'project', 'follow-up', 'review', 'deadline', 'planning',
    'research', 'development', 'design', 'documentation'
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        if (newLabel.trim()) {
          handleAddLabel(newLabel);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [newLabel]);

  const handleAddLabel = (labelToAdd: string) => {
    const trimmedLabel = labelToAdd.trim().toLowerCase();
    if (trimmedLabel && !labels.includes(trimmedLabel)) {
      onChange([...labels, trimmedLabel]);
    }
    setNewLabel('');
    setShowSuggestions(false);
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    onChange(labels.filter(label => label !== labelToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewLabel(value);

    if (value.trim()) {
      const filtered = commonLabels
        .filter(label => 
          label.toLowerCase().includes(value.toLowerCase()) && 
          !labels.includes(label)
        );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newLabel.trim()) {
        handleAddLabel(newLabel);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setNewLabel('');
      inputRef.current?.blur();
    }
  };

  const handleInputFocus = () => {
    if (newLabel.trim()) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label htmlFor="labels" className="font-medium text-base dark:text-slate-200">Labels</Label>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
        {labels.map((label) => (
          <Badge
            key={label}
            className={cn(
              "h-6 rounded-[20px] px-3 flex items-center group",
              "bg-[#efefef] dark:bg-[#334155]",
              "text-black dark:text-slate-200",
              "hover:bg-[#e5e5e5] dark:hover:bg-[#475569]"
            )}
          >
            {label}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRemoveLabel(label);
              }}
              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 outline-none"
            >
              <XIcon className="h-3 w-3 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="relative">
        <Input
          ref={inputRef}
          id="labels"
          name="labels"
          type="text"
          value={newLabel}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder="Type to add or search labels"
          className={cn(
            "w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5036b0] focus:border-transparent",
            "bg-white dark:bg-[#334155]",
            "border-gray-300 dark:border-slate-600",
            "text-black dark:text-slate-200",
            "placeholder:text-gray-500 dark:placeholder:text-slate-400"
          )}
          autoComplete="off"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className={cn(
              "absolute z-10 w-full mt-1 rounded-md shadow-lg max-h-48 overflow-y-auto",
              "bg-white dark:bg-[#334155]",
              "border border-gray-200 dark:border-slate-600"
            )}
          >
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                className={cn(
                  "w-full text-left px-4 py-2 flex items-center justify-between",
                  "hover:bg-gray-100 dark:hover:bg-slate-600",
                  "text-black dark:text-slate-200"
                )}
                onClick={() => handleAddLabel(suggestion)}
              >
                <span>{suggestion}</span>
                <PlusIcon className="h-4 w-4 text-gray-500 dark:text-slate-400" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};