
import React from 'react';
import { ArtistProfile } from '@/types/ventures';
import ArtistCard from './ArtistCard';

interface ArtistGridProps {
  artists: ArtistProfile[];
  className?: string;
}

const ArtistGrid: React.FC<ArtistGridProps> = ({ artists, className }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className || ''}`}>
      {artists.map((artist) => (
        <ArtistCard key={artist.id} artist={artist} />
      ))}
      
      {artists.length === 0 && (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          No artists found.
        </div>
      )}
    </div>
  );
};

export default ArtistGrid;
