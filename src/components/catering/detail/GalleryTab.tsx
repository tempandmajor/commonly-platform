
import React from 'react';
import { Image } from 'lucide-react';
import { CatererPhoto } from '@/types/caterer';

interface GalleryTabProps {
  photos: CatererPhoto[];
  onPhotoSelect: (index: number) => void;
}

export const GalleryTab = ({ photos, onPhotoSelect }: GalleryTabProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Image className="h-5 w-5" />
        Photo Gallery
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div 
            key={photo.id}
            className="aspect-square rounded-md overflow-hidden cursor-pointer"
            onClick={() => onPhotoSelect(index)}
          >
            <img 
              src={photo.url} 
              alt={photo.caption || `Photo ${index + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
