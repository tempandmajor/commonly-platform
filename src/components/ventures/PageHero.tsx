
import React from 'react';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  className?: string;
}

const PageHero: React.FC<PageHeroProps> = ({ title, subtitle, imageUrl, className }) => {
  return (
    <div className={`relative overflow-hidden ${className || ''}`}>
      {imageUrl ? (
        <div className="relative h-[40vh] min-h-[400px]">
          <img 
            src={imageUrl} 
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">{title}</h1>
            {subtitle && <p className="text-xl md:text-2xl text-white/90 max-w-2xl">{subtitle}</p>}
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 h-[30vh] min-h-[300px] flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">{title}</h1>
          {subtitle && <p className="text-xl md:text-2xl text-white/90 max-w-2xl">{subtitle}</p>}
        </div>
      )}
    </div>
  );
};

export default PageHero;
