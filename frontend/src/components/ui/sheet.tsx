import { cn } from "@/lib/utils";
import React from "react";
type Props = {
  isOpen: boolean;
  children: React.ReactNode;
  className: string;
};
const Sheet = ({ isOpen, children, className }: Props) => {
  return (
    <>
      {isOpen && (
        <div
          id="drawer-example"
          className={cn(
            "absolute z-40 p-4 overflow-y-auto bg-white w-80 dark:bg-gray-800",
            className
          )}
          aria-labelledby="drawer-label"
        >
          {children}
        </div>
      )}
    </>
  );
};

export default Sheet;
