import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateContentPage } from '@/services/admin/contentService';
import { ContentData } from './types';
import HeroContentSection from './HeroContentSection';
import ContentSectionsList from './ContentSectionsList';
import PageMetadataForm from './PageMetadataForm';

const ContentEditor = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isNew] = useState(!pageId || pageId === 'new');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [pageData, setPageData] = useState<ContentData>({
    title: '',
    subtitle: '',
    description: '',
    heroImage: '',
    sections: [],
  });
  const [pageIdInput, setPageIdInput] = useState('');
  
  // File upload states
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [sectionImageFiles, setSectionImageFiles] = useState<Record<number, File>>({});
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (!isNew && pageId) {
      fetchContent(pageId);
    }
  }, [isNew, pageId]);

  const fetchContent = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // Not found
          toast({
            variant: 'destructive',
            title: 'Page not found',
            description: 'The requested content page does not exist'
          });
          navigate('/admin/content');
          return;
        }
        throw error;
      }
      
      setPageTitle(data.title || '');
      // Properly type-cast the content data with proper type checks
      if (data.content && typeof data.content === 'object') {
        // First cast to unknown, then to ContentData to avoid TypeScript errors
        const contentData = data.content as unknown as ContentData;
        
        // Ensure the content has the required properties of ContentData
        const safeContentData: ContentData = {
          title: contentData.title || '',
          subtitle: contentData.subtitle || '',
          description: contentData.description || '',
          heroImage: contentData.heroImage || '',
          sections: Array.isArray(contentData.sections) 
            ? contentData.sections 
            : [],
        };
        
        setPageData(safeContentData);
      } else {
        // Set default data if content is not valid
        setPageData({
          title: '',
          subtitle: '',
          description: '',
          heroImage: '',
          sections: [],
        });
      }
      
      setPageIdInput(id);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load content data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = () => {
    setPageData(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          title: '',
          content: '',
          imageUrl: ''
        }
      ]
    }));
  };

  const handleRemoveSection = (index: number) => {
    setPageData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const handleSectionChange = (index: number, field: keyof typeof pageData.sections[0], value: string) => {
    setPageData(prev => {
      const newSections = [...prev.sections];
      newSections[index] = {
        ...newSections[index],
        [field]: value
      };
      return {
        ...prev,
        sections: newSections
      };
    });
  };

  const handleInputChange = (field: keyof ContentData, value: string) => {
    setPageData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSectionImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      setSectionImageFiles(prev => ({
        ...prev,
        [index]: e.target.files![0]
      }));
    }
  };

  const handleSave = async () => {
    try {
      if (isNew && !pageIdInput) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Please enter a page ID'
        });
        return;
      }
      
      setSaving(true);
      
      await updateContentPage(
        pageIdInput || (pageId || ''),
        pageTitle,
        pageData
      );
      
      toast({
        title: 'Success',
        description: `Content ${isNew ? 'created' : 'updated'} successfully`
      });
      
      if (isNew) {
        navigate(`/admin/content/edit/${pageIdInput}`);
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to ${isNew ? 'create' : 'update'} content`
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/content')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">
            {isNew ? 'Create New Content Page' : 'Edit Content Page'}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6">
        <PageMetadataForm
          pageTitle={pageTitle}
          setPageTitle={setPageTitle}
          pageIdInput={pageIdInput}
          setPageIdInput={setPageIdInput}
          isNew={isNew}
        />

        <HeroContentSection
          pageData={pageData}
          onInputChange={handleInputChange}
          heroImageFile={heroImageFile}
          setHeroImageFile={setHeroImageFile}
          uploading={uploading}
          setUploading={setUploading}
        />

        <ContentSectionsList
          pageData={pageData}
          onAddSection={handleAddSection}
          onSectionChange={handleSectionChange}
          onRemoveSection={handleRemoveSection}
          sectionImageFiles={sectionImageFiles}
          onSectionImageChange={handleSectionImageChange}
          uploading={uploading}
          setUploading={setUploading}
          setSectionImageFiles={setSectionImageFiles}
        />
      </div>
    </div>
  );
};

export default ContentEditor;
