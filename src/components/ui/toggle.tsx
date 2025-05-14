import React from "react";
import { motion } from "framer-motion";

interface ToggleOptionProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  size: number;
  onClick: () => void;
}

const ToggleOption = (props: ToggleOptionProps) => {
  const { icon, label, size, isActive, onClick } = props;
  return (
    <button
      className={`flex items-center justify-center px-5 py-1.5 text-sm rounded-full flex-1 transition-colors duration-200 z-10 relative ${
        isActive
          ? "text-theme-light dark:text-theme-dark"
          : "text-gray-500 hover:text-gray-700"
      }`}
      onClick={onClick}
      aria-pressed={isActive}
    >
      <div className="inline-flex items-center justify-center">
        <span
          className="flex items-center justify-center mr-2"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          {icon}
        </span>
        <span>{label}</span>
      </div>
    </button>
  );
};

interface ToggleOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface ToggleProps {
  size: number;
  options: ToggleOption[];
  activeOption: string;
  onChange: (value: string) => void;
  fluid?: boolean;
}

function ToggleButton(props: ToggleProps) {
  const { options, activeOption, onChange, size, fluid = false } = props;

  // Calculate the active index for animation
  const activeIndex = options.findIndex(
    (option) => option.value === activeOption,
  );

  // Calculate width percentage and position based on number of options
  const optionWidth = 100 / options.length;
  const leftPosition = `${activeIndex * optionWidth + optionWidth * 0.05}%`;
  const backgroundWidth = `${optionWidth * 0.9}%`;

  return (
    <div
      className={`relative rounded-full bg-gray-100 p-0.5 ${
        fluid ? "flex w-full" : "inline-flex w-auto"
      }`}
    >
      {/* Animated background for active option */}
      <motion.div
        className="absolute bg-white rounded-full shadow-sm"
        layoutId="activeBackground"
        initial={false}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          width: backgroundWidth,
          height: "85%",
          top: "7.5%",
        }}
        animate={{
          left: leftPosition,
        }}
      />

      {/* Render all options with equal width */}
      {options.map((option) => (
        <ToggleOption
          key={option.value}
          icon={option.icon}
          label={option.label}
          size={size}
          isActive={activeOption === option.value}
          onClick={() => onChange(option.value)}
        />
      ))}
    </div>
  );
}

export default ToggleButton;
