import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';
import { Theme } from '../utils/theme';
import { Loader2, Undo, Redo, X } from 'lucide-react';

interface PropertySheetData {
  title: string;
  description: string;
  tags: string[];
}

interface PropertySheetEditorProps {
  initialData?: PropertySheetData;
  onSave: (data: PropertySheetData) => Promise<void>;
  onClose: () => void;
  theme?: Theme;
}

export const PropertySheetEditor: React.FC<PropertySheetEditorProps> = ({
  initialData = { title: '', description: '', tags: [] },
  onSave,
  onClose,
  theme = 'light'
}) => {
  const [data, setData] = useState<PropertySheetData>(initialData);
  const [history, setHistory] = useState<PropertySheetData[]>([initialData]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [tagInput, setTagInput] = useState('');
  const saveTimeoutRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const validate = (newData: PropertySheetData): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!newData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (newData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (newData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (newData.tags.length > 10) {
      newErrors.tags = 'Maximum 10 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof PropertySheetData, value: string | string[]) => {
    const newData = { ...data, [field]: value };
    setData(newData);

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Debounced save
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(async () => {
      if (validate(newData)) {
        try {
          setIsSaving(true);
          await onSave(newData);
          toast.success('Changes saved');
        } catch (error) {
          toast.error('Failed to save changes');
        } finally {
          setIsSaving(false);
        }
      }
    }, 500);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setData(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setData(history[historyIndex + 1]);
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !data.tags.includes(newTag) && data.tags.length < 10) {
        handleChange('tags', [...data.tags, newTag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleChange('tags', data.tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "w-[400px] bg-white dark:bg-slate-800 rounded-lg shadow-lg",
        "border border-gray-200 dark:border-slate-700"
      )}
      role="dialog"
      aria-label="Property Sheet Editor"
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b",
        theme === 'dark' ? "border-slate-700" : "border-gray-200"
      )}>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex === 0}
            aria-label="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex === history.length - 1}
            aria-label="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className={cn(
        "p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto",
        "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600",
        "scrollbar-track-transparent"
      )}>
        {/* Title */}
        <div>
          <Label htmlFor="title" className="block mb-1">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => handleChange('title', e.target.value)}
            maxLength={100}
            className={cn(
              "font-semibold",
              errors.title && "border-red-500 focus:ring-red-500",
              theme === 'dark' && "bg-slate-700 border-slate-600 text-white"
            )}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "title-error" : undefined}
          />
          {errors.title && (
            <p id="title-error" className="mt-1 text-sm text-red-500">
              {errors.title}
            </p>
          )}
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {data.title.length}/100 characters
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="block mb-1">
            Description
          </Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => handleChange('description', e.target.value)}
            maxLength={500}
            rows={4}
            className={cn(
              errors.description && "border-red-500 focus:ring-red-500",
              theme === 'dark' && "bg-slate-700 border-slate-600 text-white"
            )}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? "description-error" : undefined}
          />
          {errors.description && (
            <p id="description-error" className="mt-1 text-sm text-red-500">
              {errors.description}
            </p>
          )}
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {data.description.length}/500 characters
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label htmlFor="tags" className="block mb-1">
            Tags
          </Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  "inline-flex items-center px-2 py-1 rounded-full text-sm",
                  theme === 'dark' 
                    ? "bg-slate-700 text-white" 
                    : "bg-gray-100 text-gray-800"
                )}
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600"
                  aria-label={`Remove ${tag} tag`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            placeholder="Type and press Enter to add tags"
            disabled={data.tags.length >= 10}
            className={cn(
              errors.tags && "border-red-500 focus:ring-red-500",
              theme === 'dark' && "bg-slate-700 border-slate-600 text-white"
            )}
            aria-invalid={!!errors.tags}
            aria-describedby={errors.tags ? "tags-error" : undefined}
          />
          {errors.tags && (
            <p id="tags-error" className="mt-1 text-sm text-red-500">
              {errors.tags}
            </p>
          )}
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {data.tags.length}/10 tags
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={cn(
        "p-4 border-t",
        theme === 'dark' ? "border-slate-700" : "border-gray-200"
      )}>
        {isSaving && (
          <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving changes...
          </div>
        )}
      </div>
    </div>
  );
};