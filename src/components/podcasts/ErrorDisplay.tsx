
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="flex flex-col gap-4">
        <p>{message}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="self-start flex gap-2"
          onClick={onRetry}
        >
          <RefreshCcw className="h-4 w-4" /> Try Again
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default ErrorDisplay;
