
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { ContentData } from '@/components/admin/content/types';

const ContentPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [pageContent, setPageContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPageContent = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .eq('id', slug)
          .single();
        
        if (error) {
          console.error('Error fetching content:', error);
          setError(error.message);
          return;
        }
        
        if (data && data.content) {
          // Properly type-cast the content data
          const contentData = data.content as unknown as ContentData;
          setPageContent(contentData);
        } else {
          setError('No content found');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPageContent();
  }, [slug]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (error || !pageContent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-red-500">Error</h1>
            <p className="mt-4">{error || 'Content not found'}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">{pageContent.title}</h1>
          
          {pageContent.subtitle && (
            <h2 className="text-2xl text-gray-600 mb-6">{pageContent.subtitle}</h2>
          )}
          
          {pageContent.description && (
            <div className="text-gray-700 mb-8">
              {pageContent.description.split('\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4">{paragraph}</p>
              ))}
            </div>
          )}
          
          {pageContent.heroImage && (
            <img 
              src={pageContent.heroImage} 
              alt={pageContent.title} 
              className="w-full h-auto rounded-lg mb-8 object-cover"
            />
          )}
          
          <div className="space-y-10">
            {pageContent.sections.map((section, index) => (
              <div key={index} className="border-t pt-6">
                {section.title && (
                  <h3 className="text-2xl font-semibold mb-4">{section.title}</h3>
                )}
                
                {section.content && (
                  <div className="prose max-w-none">
                    {section.content.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                )}
                
                {section.imageUrl && (
                  <img 
                    src={section.imageUrl} 
                    alt={section.title || 'Section image'} 
                    className="rounded-lg mt-6 w-full h-auto"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPage;
