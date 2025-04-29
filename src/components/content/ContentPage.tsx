
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

interface ContentData {
  title?: string;
  content?: Record<string, any>;
}

const ContentPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .eq('id', slug)
          .single();
        
        if (error) throw error;
        setContent(data);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchContent();
    }
  }, [slug]);

  // Render content sections
  const renderSections = () => {
    if (!content?.content?.sections) return null;
    
    return content.content.sections.map((section: any, index: number) => (
      <div key={index} className="py-6 border-b border-gray-100 last:border-0">
        {section.title && <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>}
        
        {section.content && section.content.split('\n').map((paragraph: string, i: number) => (
          <p key={i} className="mb-4 text-gray-700">{paragraph}</p>
        ))}
        
        {section.imageUrl && (
          <div className="my-6">
            <img 
              src={section.imageUrl} 
              alt={section.title || 'Content image'} 
              className="rounded-lg w-full max-w-2xl mx-auto"
            />
          </div>
        )}
      </div>
    ));
  };

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

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Content Not Found</h1>
            <p className="text-gray-600">The page you are looking for doesn't exist or is not published yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            {content.title && <h1 className="text-3xl md:text-4xl font-bold mb-6">{content.title}</h1>}
            
            {content.content?.subtitle && (
              <p className="text-xl text-gray-600 mb-8">{content.content.subtitle}</p>
            )}
            
            {content.content?.heroImage && (
              <div className="mb-8">
                <img 
                  src={content.content.heroImage} 
                  alt={content.title || 'Hero image'} 
                  className="w-full rounded-lg object-cover max-h-96"
                />
              </div>
            )}
            
            {content.content?.description && (
              <div className="mb-8">
                {content.content.description.split('\n').map((paragraph: string, i: number) => (
                  <p key={i} className="mb-4 text-gray-700">{paragraph}</p>
                ))}
              </div>
            )}
            
            <div className="mt-8">
              {renderSections()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPage;
