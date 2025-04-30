
import React from "react";
import { X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ImagePreviewProps {
  imagePreview: string;
  isUploading: boolean;
  uploadProgress: number;
  onCancel: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  imagePreview,
  isUploading,
  uploadProgress,
  onCancel
}) => {
  return (
    <div className="p-3 border-t">
      <div className="relative inline-block">
        <img 
          src={imagePreview} 
          alt="Upload preview" 
          className="h-20 w-20 object-cover rounded"
        />
        <button 
          onClick={onCancel}
          className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-1 hover:bg-gray-900"
          type="button"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      
      {isUploading && (
        <Progress value={uploadProgress} className="mt-2 h-1" />
      )}
    </div>
  );
};

export default ImagePreview;
