
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  className = "text-primary",
  size = "md" 
}) => {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  }[size];
  
  return (
    <div className="flex justify-center items-center p-4">
      <Loader2 className={`${sizeClass} animate-spin ${className}`} />
    </div>
  );
};
