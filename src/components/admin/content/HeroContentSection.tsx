
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Upload } from 'lucide-react';
import { ContentData } from './types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface HeroContentSectionProps {
  pageData: ContentData;
  onInputChange: (field: keyof ContentData, value: string) => void;
  heroImageFile: File | null;
  setHeroImageFile: React.Dispatch<React.SetStateAction<File | null>>;
  uploading: string | null;
  setUploading: React.Dispatch<React.SetStateAction<string | null>>;
}

const HeroContentSection: React.FC<HeroContentSectionProps> = ({
  pageData,
  onInputChange,
  heroImageFile,
  setHeroImageFile,
  uploading,
  setUploading
}) => {
  const { toast } = useToast();

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHeroImageFile(e.target.files[0]);
    }
  };

  const handleUploadHeroImage = async () => {
    if (!heroImageFile) return;
    
    try {
      setUploading('hero');
      const fileExt = heroImageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `hero/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('content_images')
        .upload(filePath, heroImageFile);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('content_images')
        .getPublicUrl(filePath);
      
      onInputChange('heroImage', data.publicUrl);
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

  return (
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
              onChange={(e) => onInputChange('title', e.target.value)}
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
              onChange={(e) => onInputChange('subtitle', e.target.value)}
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
              onChange={(e) => onInputChange('description', e.target.value)}
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
  );
};

export default HeroContentSection;
