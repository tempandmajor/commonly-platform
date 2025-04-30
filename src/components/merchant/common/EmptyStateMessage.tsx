
import React from "react";

interface EmptyStateMessageProps {
  message: string;
}

export const EmptyStateMessage: React.FC<EmptyStateMessageProps> = ({ message }) => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};
