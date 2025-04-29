
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, PlusCircle, Loader2, Upload } from 'lucide-react';
import { VenturesContent } from '@/types/ventures';
import { uploadContentImage } from '@/services/venturesService';
import { useToast } from '@/hooks/use-toast';

interface ContentEditorProps {
  initialData?: Partial<VenturesContent>;
  contentType: string;
  onSubmit: (data: Partial<VenturesContent>) => Promise<void>;
  isSubmitting: boolean;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  initialData = {},
  contentType,
  onSubmit,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<Partial<VenturesContent>>({
    title: initialData.title || '',
    subtitle: initialData.subtitle || '',
    description: initialData.description || '',
    heroImage: initialData.heroImage || '',
    sections: initialData.sections || [],
  });
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [sectionImageFiles, setSectionImageFiles] = useState<Record<number, File>>({});
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSectionChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const newSections = [...(prev.sections || [])];
      newSections[index] = {
        ...newSections[index],
        [field]: value
      };
      return { ...prev, sections: newSections };
    });
  };

  const handleAddSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...(prev.sections || []),
        { title: '', content: '' }
      ]
    }));
  };

  const handleRemoveSection = (index: number) => {
    setFormData((prev) => {
      const newSections = [...(prev.sections || [])];
      newSections.splice(index, 1);
      return { ...prev, sections: newSections };
    });
  };

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHeroImageFile(e.target.files[0]);
    }
  };

  const handleSectionImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      setSectionImageFiles((prev) => ({ 
        ...prev, 
        [index]: e.target.files![0] 
      }));
    }
  };

  const handleUploadHeroImage = async () => {
    if (!heroImageFile) return;
    
    setIsUploading('hero');
    try {
      const imageUrl = await uploadContentImage(heroImageFile, contentType);
      setFormData((prev) => ({ ...prev, heroImage: imageUrl }));
      toast({ title: "Hero image uploaded successfully" });
    } catch (error) {
      toast({ 
        variant: "destructive",
        title: "Failed to upload hero image", 
        description: "Please try again later" 
      });
    } finally {
      setIsUploading(null);
      setHeroImageFile(null);
    }
  };

  const handleUploadSectionImage = async (index: number) => {
    const file = sectionImageFiles[index];
    if (!file) return;
    
    setIsUploading(`section-${index}`);
    try {
      const imageUrl = await uploadContentImage(file, contentType);
      handleSectionChange(index, 'imageUrl', imageUrl);
      toast({ title: "Section image uploaded successfully" });
    } catch (error) {
      toast({ 
        variant: "destructive",
        title: "Failed to upload section image", 
        description: "Please try again later" 
      });
    } finally {
      setIsUploading(null);
      setSectionImageFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[index];
        return newFiles;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Page Title *</Label>
        <Input 
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input 
          id="subtitle"
          name="subtitle"
          value={formData.subtitle}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Main Description *</Label>
        <Textarea 
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          required
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="font-medium">Hero Image</h3>
            {formData.heroImage && (
              <div className="relative w-full h-60 mx-auto">
                <img 
                  src={formData.heroImage} 
                  alt="Hero" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Input 
                type="file"
                id="heroImage"
                onChange={handleHeroImageChange}
                accept="image/*"
              />
              {heroImageFile && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleUploadHeroImage}
                  disabled={isUploading === 'hero'}
                >
                  {isUploading === 'hero' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Hero Image
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Content Sections</h3>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleAddSection}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>

        {formData.sections?.map((section, index) => (
          <Card key={index} className="relative">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="absolute top-2 right-2 text-destructive"
              onClick={() => handleRemoveSection(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`section-${index}-title`}>Section Title</Label>
                  <Input 
                    id={`section-${index}-title`}
                    value={section.title}
                    onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`section-${index}-content`}>Section Content</Label>
                  <Textarea 
                    id={`section-${index}-content`}
                    value={section.content}
                    onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                    rows={4}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`section-${index}-image`}>Section Image</Label>
                  {section.imageUrl && (
                    <div className="relative w-full h-40 mx-auto mb-4">
                      <img 
                        src={section.imageUrl} 
                        alt={section.title} 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <Input 
                    type="file"
                    id={`section-${index}-image`}
                    onChange={(e) => handleSectionImageChange(e, index)}
                    accept="image/*"
                  />
                  {sectionImageFiles[index] && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => handleUploadSectionImage(index)}
                      disabled={isUploading === `section-${index}`}
                    >
                      {isUploading === `section-${index}` ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Section Image
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {!formData.sections?.length && (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <p className="text-muted-foreground">No content sections added yet.</p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Content'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ContentEditor;
