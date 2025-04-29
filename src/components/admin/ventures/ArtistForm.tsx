
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Trash2, Loader2 } from 'lucide-react';
import { ArtistProfile } from '@/types/ventures';
import { uploadArtistImage } from '@/services/venturesService';
import { useToast } from '@/hooks/use-toast';

interface ArtistFormProps {
  initialData?: Partial<ArtistProfile>;
  onSubmit: (data: Partial<ArtistProfile>) => Promise<void>;
  isSubmitting: boolean;
}

const ArtistForm: React.FC<ArtistFormProps> = ({ 
  initialData = {}, 
  onSubmit,
  isSubmitting 
}) => {
  const [formData, setFormData] = useState<Partial<ArtistProfile>>({
    name: initialData.name || '',
    bio: initialData.bio || '',
    imageUrl: initialData.imageUrl || '',
    category: initialData.category || 'management',
    featured: initialData.featured || false,
    socialLinks: initialData.socialLinks || {},
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...(prev.socialLinks || {}),
        [name]: value,
      }
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      category: value as 'management' | 'records' | 'studios' 
    }));
  };

  const handleFeaturedChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, featured: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile) return;
    
    setIsUploading(true);
    try {
      const imageUrl = await uploadArtistImage(imageFile);
      setFormData((prev) => ({ ...prev, imageUrl }));
      toast({ title: "Image uploaded successfully" });
    } catch (error) {
      toast({ 
        variant: "destructive",
        title: "Failed to upload image", 
        description: "Please try again later" 
      });
    } finally {
      setIsUploading(false);
      setImageFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input 
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio *</Label>
        <Textarea 
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows={5}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select 
          value={formData.category} 
          onValueChange={handleCategoryChange}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="management">Management</SelectItem>
            <SelectItem value="records">Records</SelectItem>
            <SelectItem value="studios">Studios</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="featured">Featured Artist</Label>
          <Switch 
            id="featured"
            checked={formData.featured}
            onCheckedChange={handleFeaturedChange}
          />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="font-medium">Profile Image</h3>
            {formData.imageUrl && (
              <div className="relative w-40 h-40 mx-auto">
                <img 
                  src={formData.imageUrl} 
                  alt="Artist" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Input 
                type="file"
                id="image"
                onChange={handleImageChange}
                accept="image/*"
              />
              {imageFile && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleUploadImage}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4">Social Media Links</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram URL</Label>
              <Input 
                id="instagram"
                name="instagram"
                value={formData.socialLinks?.instagram || ''}
                onChange={handleSocialLinkChange}
                placeholder="https://instagram.com/username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter URL</Label>
              <Input 
                id="twitter"
                name="twitter"
                value={formData.socialLinks?.twitter || ''}
                onChange={handleSocialLinkChange}
                placeholder="https://twitter.com/username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="spotify">Spotify URL</Label>
              <Input 
                id="spotify"
                name="spotify"
                value={formData.socialLinks?.spotify || ''}
                onChange={handleSocialLinkChange}
                placeholder="https://open.spotify.com/artist/id"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube URL</Label>
              <Input 
                id="youtube"
                name="youtube"
                value={formData.socialLinks?.youtube || ''}
                onChange={handleSocialLinkChange}
                placeholder="https://youtube.com/channel"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input 
                id="website"
                name="website"
                value={formData.socialLinks?.website || ''}
                onChange={handleSocialLinkChange}
                placeholder="https://example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Artist'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ArtistForm;
