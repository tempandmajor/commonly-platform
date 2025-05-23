
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { addArtistProfile, uploadArtistImage } from '@/services/admin/artistService';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload } from 'lucide-react';
import { ArtistProfile } from '@/types/artist';

const artistSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  category: z.enum(["management", "records", "studios"]),
  featured: z.boolean().default(false),
  social_links: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
});

type ArtistFormValues = z.infer<typeof artistSchema>;

interface ArtistFormProps {
  onSuccess?: () => void;
  initialData?: ArtistProfile;
  onSubmit?: (data: ArtistFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const ArtistForm: React.FC<ArtistFormProps> = ({ 
  onSuccess, 
  initialData,
  onSubmit: externalSubmit,
  isSubmitting: externalIsSubmitting 
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  
  const form = useForm<ArtistFormValues>({
    resolver: zodResolver(artistSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      bio: initialData.bio,
      category: initialData.category as "management" | "records" | "studios",
      featured: initialData.featured,
      social_links: {
        instagram: initialData.socialLinks?.instagram || "",
        twitter: initialData.socialLinks?.twitter || "",
        website: initialData.socialLinks?.website || "",
      },
    } : {
      name: "",
      bio: "",
      category: "management",
      featured: false,
      social_links: {
        instagram: "",
        twitter: "",
        website: "",
      },
    },
  });
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (data: ArtistFormValues) => {
    if (externalSubmit) {
      await externalSubmit(data);
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Convert form data to the format expected by the service
      const artistData = {
        name: data.name,
        bio: data.bio || "",
        category: data.category,
        featured: data.featured,
        socialLinks: data.social_links,
      };
      
      // Add artist profile
      const artistResult = await addArtistProfile(artistData);
      
      // Upload image if available
      if (imageFile && artistResult) {
        await uploadArtistImage(imageFile);
      }
      
      toast({
        title: "Artist added successfully",
        description: `${data.name} has been added to the platform.`,
      });
      
      // Reset form
      form.reset();
      setImageFile(null);
      setImagePreview(null);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding artist:", error);
      toast({
        variant: "destructive",
        title: "Failed to add artist",
        description: "There was an error adding the artist. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Artist Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter artist name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Artist Bio</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter artist bio" 
                  className="min-h-32"
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="records">Records</SelectItem>
                  <SelectItem value="studios">Studios</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Featured Artist</FormLabel>
                <FormDescription>
                  Featured artists will be shown prominently on the Ventures page
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <div>
          <FormLabel>Artist Image</FormLabel>
          <div className="mt-2">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('artist-image')?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Image
              </Button>
              <Input
                id="artist-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="h-20 w-20 overflow-hidden rounded-md">
                  <img 
                    src={imagePreview} 
                    alt="Artist preview" 
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Button 
          type="submit" 
          disabled={externalIsSubmitting || isSubmitting} 
          className="w-full"
        >
          {(externalIsSubmitting || isSubmitting) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? 'Updating Artist...' : 'Adding Artist...'}
            </>
          ) : (
            initialData ? 'Update Artist' : 'Add Artist'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ArtistForm;
