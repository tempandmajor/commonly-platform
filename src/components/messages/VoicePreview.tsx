
import React from "react";
import { Mic, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface VoicePreviewProps {
  isUploading: boolean;
  uploadProgress: number;
  onCancel: () => void;
}

const VoicePreview: React.FC<VoicePreviewProps> = ({
  isUploading,
  uploadProgress,
  onCancel
}) => {
  return (
    <div className="p-3 border-t">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            <span className="text-sm">Voice message</span>
            <button 
              onClick={onCancel}
              className="ml-2 text-gray-500 hover:text-gray-700"
              type="button"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
        
        {isUploading && (
          <Progress value={uploadProgress} className="h-1 flex-1" />
        )}
      </div>
    </div>
  );
};

export default VoicePreview;
