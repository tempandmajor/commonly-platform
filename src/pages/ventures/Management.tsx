
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getVenturesContent, getArtistsByCategory } from '@/services/venturesService';
import PageHero from '@/components/ventures/PageHero';
import ContentSection from '@/components/ventures/ContentSection';
import ArtistGrid from '@/components/ventures/ArtistGrid';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { VenturesContent, ArtistProfile } from '@/types/ventures';

const Management: React.FC = () => {
  const { data: content, isLoading: isLoadingContent } = useQuery({
    queryKey: ['venturesContent', 'management'],
    queryFn: () => getVenturesContent('management'),
  });

  const { data: artists, isLoading: isLoadingArtists } = useQuery({
    queryKey: ['artists', 'management'],
    queryFn: () => getArtistsByCategory('management'),
  });

  if (isLoadingContent || isLoadingArtists) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <PageHero 
          title={content?.title || "Commonly Management"} 
          subtitle={content?.subtitle || "Artist & Talent Management"}
          imageUrl={content?.heroImage}
        />

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto mb-12">
            <p className="text-lg leading-relaxed">
              {content?.description || "Commonly Management represents extraordinary talent and helps them build sustainable careers. We work closely with our roster to develop their brand and connect with audiences worldwide."}
            </p>
          </div>

          {content?.sections?.map((section, index) => (
            <ContentSection 
              key={index}
              title={section.title}
              content={section.content}
              imageUrl={section.imageUrl}
              reverse={index % 2 !== 0}
            />
          ))}

          <section className="py-12">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Roster</h2>
            <ArtistGrid artists={artists || []} />
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Management;
