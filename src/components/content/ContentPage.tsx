
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ContentData } from '@/components/admin/content/types';

const ContentPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ContentData>({
    title: '',
    description: '',
    sections: []
  });
  const [pageTitle, setPageTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchContent(slug);
    }
  }, [slug]);

  const fetchContent = async (pageId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('id', pageId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setPageTitle(data.title || 'Content Page');
        // Type assertion to ensure it's treated as ContentData
        setContent(data.content as ContentData);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Failed to load content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-6 w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded mb-4 w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <h1 className="text-xl text-red-700 mb-2">Error</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
        {content.subtitle && (
          <p className="text-xl text-gray-600 mb-6">{content.subtitle}</p>
        )}
        {content.heroImage && (
          <div className="mb-8">
            <img
              src={content.heroImage}
              alt={content.title}
              className="w-full max-h-96 object-cover rounded-lg shadow-md"
            />
          </div>
        )}
        <div className="max-w-3xl mx-auto">
          <p className="text-lg">{content.description}</p>
        </div>
      </header>

      {content.sections && content.sections.length > 0 && (
        <div className="space-y-16">
          {content.sections.map((section, index) => (
            <section key={index} className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
              <div className="flex flex-col md:flex-row gap-6">
                {section.imageUrl && (
                  <div className="w-full md:w-1/3">
                    <img
                      src={section.imageUrl}
                      alt={section.title}
                      className="w-full rounded-lg shadow-md"
                    />
                  </div>
                )}
                <div className={section.imageUrl ? 'w-full md:w-2/3' : 'w-full'}>
                  <p className="whitespace-pre-line">{section.content}</p>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentPage;
