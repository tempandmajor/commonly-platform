
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface ImagePreviewProps {
  imageUrl?: string;
  file?: File;
  onCancel: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, file, onCancel }) => {
  const previewUrl = imageUrl || (file ? URL.createObjectURL(file) : '');

  return (
    <div className="relative">
      <div className="w-full rounded-md overflow-hidden border border-gray-200 mb-4 relative">
        <img 
          src={previewUrl} 
          alt="Preview" 
          className="w-full max-h-60 object-contain"
        />
      </div>
      <Button 
        type="button" 
        size="icon" 
        variant="ghost" 
        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full h-6 w-6"
        onClick={onCancel}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default ImagePreview;
