
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Loader2, 
  PlusCircle, 
  Trash2, 
  ArrowLeft, 
  Save,
  Upload 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateContentPage } from '@/services/admin/contentService';

interface Section {
  title: string;
  content: string;
  imageUrl?: string;
}

interface ContentData {
  title: string;
  subtitle?: string;
  description: string;
  heroImage?: string;
  sections: Section[];
}

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
      setPageData(data.content || {
        title: '',
        subtitle: '',
        description: '',
        heroImage: '',
        sections: [],
      });
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

  const handleSectionChange = (index: number, field: keyof Section, value: string) => {
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

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHeroImageFile(e.target.files[0]);
    }
  };

  const handleSectionImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      setSectionImageFiles(prev => ({
        ...prev,
        [index]: e.target.files![0]
      }));
    }
  };

  const uploadImage = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('content_images')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from('content_images')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  const handleUploadHeroImage = async () => {
    if (!heroImageFile) return;
    
    try {
      setUploading('hero');
      const publicUrl = await uploadImage(heroImageFile, 'hero');
      setPageData(prev => ({
        ...prev,
        heroImage: publicUrl
      }));
      setHeroImageFile(null);
      toast({
        title: 'Hero image uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading hero image:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'Could not upload hero image'
      });
    } finally {
      setUploading(null);
    }
  };

  const handleUploadSectionImage = async (index: number) => {
    const file = sectionImageFiles[index];
    if (!file) return;
    
    try {
      setUploading(`section-${index}`);
      const publicUrl = await uploadImage(file, 'sections');
      
      handleSectionChange(index, 'imageUrl', publicUrl);
      
      // Remove from upload queue
      setSectionImageFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[index];
        return newFiles;
      });
      
      toast({
        title: 'Section image uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading section image:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'Could not upload section image'
      });
    } finally {
      setUploading(null);
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
        {isNew && (
          <div className="grid gap-2">
            <label htmlFor="pageId" className="text-sm font-medium">
              Page ID (URL slug) *
            </label>
            <Input
              id="pageId"
              value={pageIdInput}
              onChange={(e) => setPageIdInput(e.target.value)}
              placeholder="e.g. for-creators, help-center, privacy-policy"
              required
            />
            <p className="text-xs text-muted-foreground">
              This will be used in the URL, e.g. /content/for-creators
            </p>
          </div>
        )}

        <div className="grid gap-2">
          <label htmlFor="pageTitle" className="text-sm font-medium">
            Page Title *
          </label>
          <Input
            id="pageTitle"
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            placeholder="Enter page title"
            required
          />
        </div>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Content</h3>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Main Heading
                </label>
                <Input
                  id="title"
                  value={pageData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Main heading of the page"
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="subtitle" className="text-sm font-medium">
                  Subtitle
                </label>
                <Input
                  id="subtitle"
                  value={pageData.subtitle || ''}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  placeholder="Subtitle or tagline"
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Main Description
                </label>
                <Textarea
                  id="description"
                  value={pageData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Main content description"
                  rows={5}
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="heroImage" className="text-sm font-medium">
                  Hero Image
                </label>
                {pageData.heroImage && (
                  <div className="mb-4">
                    <img
                      src={pageData.heroImage}
                      alt="Hero"
                      className="w-full max-h-64 object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Input
                    id="heroImage"
                    type="file"
                    onChange={handleHeroImageChange}
                    accept="image/*"
                  />
                  {heroImageFile && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleUploadHeroImage}
                      disabled={uploading === 'hero'}
                    >
                      {uploading === 'hero' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Hero Image
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Content Sections</h3>
            <Button 
              onClick={handleAddSection} 
              variant="outline"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>
          
          {pageData.sections.length === 0 ? (
            <div className="border border-dashed rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                No content sections added yet. Click "Add Section" to create one.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pageData.sections.map((section, index) => (
                <Card key={index}>
                  <CardContent className="pt-6 relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 text-destructive"
                      onClick={() => handleRemoveSection(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <label htmlFor={`section-${index}-title`} className="text-sm font-medium">
                          Section Title
                        </label>
                        <Input
                          id={`section-${index}-title`}
                          value={section.title}
                          onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                          placeholder="Section title"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor={`section-${index}-content`} className="text-sm font-medium">
                          Section Content
                        </label>
                        <Textarea
                          id={`section-${index}-content`}
                          value={section.content}
                          onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                          placeholder="Section content"
                          rows={4}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor={`section-${index}-image`} className="text-sm font-medium">
                          Section Image
                        </label>
                        {section.imageUrl && (
                          <div className="mb-4">
                            <img
                              src={section.imageUrl}
                              alt={`Section ${index + 1}`}
                              className="w-full max-h-48 object-cover rounded-md"
                            />
                          </div>
                        )}
                        <div className="flex flex-col gap-2">
                          <Input
                            id={`section-${index}-image`}
                            type="file"
                            onChange={(e) => handleSectionImageChange(e, index)}
                            accept="image/*"
                          />
                          {sectionImageFiles[index] && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleUploadSectionImage(index)}
                              disabled={uploading === `section-${index}`}
                            >
                              {uploading === `section-${index}` ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload Section Image
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
