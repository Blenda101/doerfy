import React from "react";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";

const Test = () => {
  const theme = "dark";
  return (
    <div>
      <Input
        // value={item.title}
        // onChange={(e) => onUpdate({ ...item, title: e.target.value })}
        autoFocus
        className={cn(
          "text-xl font-semibold mb-6 border-none p-0 focus-visible:ring-0 w-full",
          theme === "dark" && "bg-transparent text-white",
        )}
        placeholder="Untitled Note"
      />
    </div>
  );
};

export default Test;
