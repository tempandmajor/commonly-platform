
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Instagram, Twitter, Music, Youtube, Globe } from 'lucide-react';
import { ArtistProfile } from '@/types/ventures';

interface ArtistCardProps {
  artist: ArtistProfile;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {artist.imageUrl ? (
          <img 
            src={artist.imageUrl} 
            alt={artist.name} 
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Music className="h-16 w-16 text-gray-400" />
          </div>
        )}
        {artist.featured && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
            Featured
          </div>
        )}
      </div>
      <CardContent className="flex-1 p-4">
        <h3 className="font-bold text-lg mb-1">{artist.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{artist.bio}</p>
        
        {artist.socialLinks && (
          <div className="flex space-x-2 mt-auto">
            {artist.socialLinks.instagram && (
              <a href={artist.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {artist.socialLinks.twitter && (
              <a href={artist.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {artist.socialLinks.spotify && (
              <a href={artist.socialLinks.spotify} target="_blank" rel="noopener noreferrer">
                <Music className="h-4 w-4" />
              </a>
            )}
            {artist.socialLinks.youtube && (
              <a href={artist.socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                <Youtube className="h-4 w-4" />
              </a>
            )}
            {artist.socialLinks.website && (
              <a href={artist.socialLinks.website} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ArtistCard;
