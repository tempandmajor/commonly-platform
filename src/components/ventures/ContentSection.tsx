
import React from 'react';

interface ContentSectionProps {
  title: string;
  content: string;
  imageUrl?: string;
  reverse?: boolean;
  className?: string;
}

const ContentSection: React.FC<ContentSectionProps> = ({ 
  title, 
  content,
  imageUrl,
  reverse = false,
  className
}) => {
  return (
    <section className={`py-12 ${className || ''}`}>
      <div className={`container mx-auto px-4 flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center`}>
        {imageUrl && (
          <div className="w-full md:w-1/2">
            <img 
              src={imageUrl}
              alt={title}
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
        )}
        
        <div className={`w-full ${imageUrl ? 'md:w-1/2' : 'md:w-3/4 mx-auto'}`}>
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <div className="prose max-w-none">
            {content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContentSection;
