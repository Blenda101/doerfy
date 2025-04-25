import React, { useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { cn } from '../lib/utils';

interface InlineTaskEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  className?: string;
  autoFocus?: boolean;
}

export const InlineTaskEditor: React.FC<InlineTaskEditorProps> = ({
  value,
  onChange,
  onSave,
  onCancel,
  className,
  autoFocus = true,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={onSave}
      className={cn(
        "flex-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200",
        className
      )}
      placeholder="New task"
      onClick={(e) => e.stopPropagation()}
    />
  );
};