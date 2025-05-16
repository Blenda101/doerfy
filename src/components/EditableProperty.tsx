import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, Filter } from "lucide-react";
import { cn } from "../lib/utils";

export type TOption =
  | {
      value: string;
      label: React.JSX.Element | string;
    }[]
  | string[];

interface EditablePropertyProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  options?: TOption;
  onChange: (value: string) => void;
  className?: string;
  alwaysShowChevron?: boolean;
  showFunnelIcon?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const EditableProperty: React.FC<EditablePropertyProps> = ({
  label,
  value,
  icon,
  options = [],
  onChange,
  className = "",
  alwaysShowChevron = false,
  showFunnelIcon = false,
  disabled = false,
  placeholder = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  console.log({ select: editValue, value });
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (newValue: string) => {
    onChange(newValue);
    setIsOpen(false);
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      handleSelect(editValue);
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  const handleInputBlur = () => {
    if (editValue.trim() !== value) {
      handleSelect(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing && !disabled) {
      setIsOpen(!isOpen);
    }
  };

  const getDisplayLabel = (val: string): React.ReactNode => {
    if (options.length === 0) return val;

    if (typeof options[0] === "string") {
      return val;
    }

    const option = (
      options as { value: string; label: React.ReactNode }[]
    ).find((opt) => opt.value === val);

    return option ? option.label : val;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <h4 className="font-medium text-base mb-2 dark:text-slate-200">
          {label}
        </h4>
      )}
      <div className="inline-block">
        <div
          className={cn(
            "flex items-center rounded p-2 transition-colors duration-200",
            !disabled && "cursor-pointer",
            (isHovered || isOpen || isEditing) &&
              !disabled &&
              "bg-[#f5f5f5] dark:bg-slate-700",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => !isOpen && !isEditing && setIsHovered(false)}
          onClick={handleClick}
        >
          {showFunnelIcon && (
            <Filter className="w-5 h-5 mr-2 text-[#6f6f6f] dark:text-slate-400" />
          )}
          {icon && <div className="mr-2">{icon}</div>}
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              onBlur={handleInputBlur}
              className={cn(
                "text-base bg-transparent border-none focus:outline-none",
                "text-[#514f4f] dark:text-slate-200",
              )}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className="text-[#514f4f] dark:text-slate-200 text-base"
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (!disabled) {
                  setIsEditing(true);
                  setIsOpen(false);
                }
              }}
            >
              {getDisplayLabel(value) || placeholder}
            </span>
          )}
          {!disabled &&
            (isHovered || isOpen || alwaysShowChevron) &&
            !isEditing && (
              <ChevronDownIcon className="text-[#6f6f6f] dark:text-slate-400 text-lg ml-2 mr-1" />
            )}
        </div>
      </div>

      {isOpen && options.length > 0 && !disabled && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full rounded-md shadow-lg",
            "bg-white dark:bg-slate-800",
            "border border-gray-200 dark:border-slate-600",
          )}
        >
          {options.map((option) => {
            const optionValue =
              typeof option === "string" ? option : option.value;
            const optionLabel =
              typeof option === "string" ? option : option.label;

            return (
              <div
                key={optionValue}
                className={cn(
                  "px-4 py-2 cursor-pointer",
                  "hover:bg-[#f5f5f5] dark:hover:bg-slate-700",
                  "text-[#514f4f] dark:text-slate-200",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(optionValue);
                }}
              >
                {optionLabel}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
