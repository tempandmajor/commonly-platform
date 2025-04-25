
import React from 'react';
import { CatererPhoto } from '@/types/caterer';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface PhotoGalleryProps {
  photos: CatererPhoto[];
  selectedIndex: number;
  onPhotoSelect: (index: number) => void;
}

export const PhotoGallery = ({ photos, selectedIndex, onPhotoSelect }: PhotoGalleryProps) => {
  return (
    <div className="relative h-[60vh] md:h-[50vh] overflow-hidden rounded-xl mb-8">
      <img 
        src={photos[selectedIndex]?.url || '/placeholder.svg'} 
        alt="Caterer showcase"
        className="w-full h-full object-cover"
      />
      
      {/* Photo Gallery Navigator */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center">
        <div className="bg-black/70 rounded-lg p-2 flex gap-2 overflow-x-auto max-w-full">
          {photos.map((photo, index) => (
            <div 
              key={photo.id}
              className={`w-16 h-16 cursor-pointer rounded overflow-hidden transition-all ${
                index === selectedIndex ? 'ring-2 ring-white' : 'opacity-70'
              }`}
              onClick={() => onPhotoSelect(index)}
            >
              <img 
                src={photo.url} 
                alt={photo.caption || `Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
