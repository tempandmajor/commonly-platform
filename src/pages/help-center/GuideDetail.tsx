
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ContentData } from '@/components/admin/content/types';

interface GuideContent {
  title?: string;
  content?: {
    description: string;
    sections: {
      title: string;
      content: string;
      imageUrl?: string;
    }[];
  };
}

const GuideDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [guide, setGuide] = useState<GuideContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuideContent = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .eq('id', `guide-${slug}`)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') { // Not found
            setError('Guide not found');
          } else {
            throw error;
          }
        } else {
          // Properly type-cast the content data
          const contentData = data.content as unknown as ContentData;
          
          setGuide({
            title: data.title,
            content: {
              description: contentData.description || '',
              sections: contentData.sections || []
            }
          });
        }
      } catch (err) {
        console.error('Error fetching guide:', err);
        setError('Failed to load guide');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchGuideContent();
    }
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

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
            <h1 className="text-2xl font-bold mb-4">Guide Not Found</h1>
            <p className="text-gray-600 mb-6">
              The guide you're looking for doesn't exist or hasn't been published yet.
            </p>
            <Button onClick={() => navigate('/help-center')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Help Center
            </Button>
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
          <div className="mb-6">
            <Button 
              variant="ghost" 
              className="mb-4" 
              onClick={() => navigate('/help-center')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Help Center
            </Button>
            
            <h1 className="text-3xl font-bold mb-2">{guide?.title}</h1>
            
            {guide?.content?.description && (
              <div className="text-gray-600 mt-4">
                {guide.content.description.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {guide?.content?.sections?.map((section, index) => (
              <div 
                key={index} 
                className={`p-6 ${index < guide.content!.sections.length - 1 ? 'border-b' : ''}`}
              >
                {section.title && (
                  <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
                )}
                
                {section.content && (
                  <div className="prose max-w-none">
                    {section.content.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                )}
                
                {section.imageUrl && (
                  <div className="mt-4 mb-4">
                    <img 
                      src={section.imageUrl} 
                      alt={section.title || 'Guide illustration'} 
                      className="rounded-lg max-w-full mx-auto"
                    />
                  </div>
                )}
              </div>
            ))}
            
            {!guide?.content?.sections || guide.content.sections.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>This guide is still being written. Check back soon!</p>
              </div>
            ) : null}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Was this guide helpful?</p>
            <div className="flex justify-center gap-4">
              <Button variant="outline">Yes, it helped</Button>
              <Button variant="outline">No, I need more help</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideDetail;
