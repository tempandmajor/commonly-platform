
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Loader2, Upload } from 'lucide-react';
import { Section } from './types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ContentSectionItemProps {
  section: Section;
  index: number;
  onSectionChange: (index: number, field: keyof Section, value: string) => void;
  onRemoveSection: (index: number) => void;
  sectionImageFile: File | undefined;
  onSectionImageChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  uploading: string | null;
  setUploading: React.Dispatch<React.SetStateAction<string | null>>;
  setSectionImageFiles: React.Dispatch<React.SetStateAction<Record<number, File>>>;
}

const ContentSectionItem: React.FC<ContentSectionItemProps> = ({
  section,
  index,
  onSectionChange,
  onRemoveSection,
  sectionImageFile,
  onSectionImageChange,
  uploading,
  setUploading,
  setSectionImageFiles
}) => {
  const { toast } = useToast();

  const handleUploadSectionImage = async () => {
    if (!sectionImageFile) return;
    
    try {
      setUploading(`section-${index}`);
      const fileExt = sectionImageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `sections/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('content_images')
        .upload(filePath, sectionImageFile);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('content_images')
        .getPublicUrl(filePath);
      
      onSectionChange(index, 'imageUrl', data.publicUrl);
      
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

  return (
    <Card key={index}>
      <CardContent className="pt-6 relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 text-destructive"
          onClick={() => onRemoveSection(index)}
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
              onChange={(e) => onSectionChange(index, 'title', e.target.value)}
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
              onChange={(e) => onSectionChange(index, 'content', e.target.value)}
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
                onChange={(e) => onSectionImageChange(e, index)}
                accept="image/*"
              />
              {sectionImageFile && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUploadSectionImage}
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
  );
};

export default ContentSectionItem;
