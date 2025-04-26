
import React, { useState, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PodcastCategory } from "@/types/podcast";
import { useToast } from "@/hooks/use-toast";

interface PodcastFormProps {
  categories: PodcastCategory[];
  onSubmit: (
    data: PodcastFormData,
    audioFile?: File,
    videoFile?: File,
    thumbnailFile?: File
  ) => Promise<void>;
  isLoading: boolean;
  isExternal?: boolean;
}

export interface PodcastFormData {
  title: string;
  description: string;
  type: "audio" | "video";
  category: string;
  visibility: "public" | "private" | "unlisted";
  duration: number;
  tags?: string[];
}

const podcastFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["audio", "video"]),
  category: z.string().min(1, "Please select a category"),
  visibility: z.enum(["public", "private", "unlisted"]),
  duration: z.number().min(1, "Duration must be at least 1 second"),
  tags: z.array(z.string()).optional(),
});

const PodcastForm: React.FC<PodcastFormProps> = ({
  categories,
  onSubmit,
  isLoading,
  isExternal = false,
}) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const { toast } = useToast();

  const form = useForm<PodcastFormData>({
    resolver: zodResolver(podcastFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "audio",
      category: "",
      visibility: "public",
      duration: 0,
      tags: [],
    },
  });

  const mediaType = form.watch("type");
  const tags = form.watch("tags") || [];

  const handleAudioChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024 * 1024) { // 500MB limit
      toast({
        title: "File too large",
        description: "Audio file must be smaller than 500MB",
        variant: "destructive",
      });
      return;
    }

    setAudioFile(file);

    // Get audio duration if possible
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
      form.setValue("duration", Math.floor(audio.duration));
    };
  };

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024 * 1024) { // 1GB limit
      toast({
        title: "File too large",
        description: "Video file must be smaller than 1GB",
        variant: "destructive",
      });
      return;
    }

    setVideoFile(file);

    // Get video duration if possible
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      form.setValue("duration", Math.floor(video.duration));
    };
  };

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Thumbnail must be smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    // Remove any special characters and spaces
    const cleanedTag = tagInput.trim().toLowerCase().replace(/[^\w]/g, "");
    
    if (!cleanedTag) return;
    if (tags.includes(cleanedTag)) {
      setTagInput("");
      return;
    }
    
    form.setValue("tags", [...tags, cleanedTag]);
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue("tags", tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleDurationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const durationRegex = /^(\d+):(\d{1,2})$/;
    
    if (durationRegex.test(value)) {
      const [, minutes, seconds] = value.match(durationRegex) || [];
      const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
      form.setValue("duration", totalSeconds);
    } else if (!isNaN(parseInt(value))) {
      form.setValue("duration", parseInt(value));
    }
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (data: PodcastFormData) => {
    if (isExternal) {
      if (!audioFile && !videoFile) {
        toast({
          title: "Media file required",
          description: `Please upload an ${data.type === "audio" ? "audio" : "video"} file`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      if (data.type === "audio") {
        await onSubmit(data, audioFile || undefined, undefined, thumbnailFile || undefined);
      } else {
        await onSubmit(data, undefined, videoFile || undefined, thumbnailFile || undefined);
      }
    } catch (error) {
      console.error("Error submitting podcast:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Podcast Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter podcast title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your podcast"
                      {...field}
                      rows={4}
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
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel>Tags (optional)</FormLabel>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag) => (
                        <div
                          key={tag}
                          className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-gray-500 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAddTag}
                      >
                        Add
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Press Enter or comma to add a tag
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Podcast Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="audio" id="audio" />
                        <Label htmlFor="audio">Audio</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="video" id="video" />
                        <Label htmlFor="video">Video</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="unlisted">Unlisted</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isExternal && (
              <FormField
                control={form.control}
                name="duration"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. 5:30 or 330"
                        onChange={(e) => handleDurationChange(e)}
                        value={formatDuration(field.value)}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Enter in minutes:seconds format (e.g. 5:30) or total seconds (e.g. 330)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="space-y-4">
              <div>
                <FormLabel>Thumbnail Image (optional)</FormLabel>
                <Card className="border-dashed border-2">
                  <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
                    {thumbnailPreview ? (
                      <div className="relative w-full">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-full h-40 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setThumbnailFile(null);
                            setThumbnailPreview(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400" />
                        <Label
                          htmlFor="thumbnail-upload"
                          className="cursor-pointer text-sm text-blue-600 hover:underline"
                        >
                          Choose thumbnail image
                        </Label>
                        <p className="text-xs text-gray-500">
                          JPG or PNG, max 5MB
                        </p>
                      </>
                    )}
                    <input
                      id="thumbnail-upload"
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </CardContent>
                </Card>
              </div>

              {isExternal && (
                <div>
                  <FormLabel>
                    {mediaType === "audio" ? "Audio File" : "Video File"}
                  </FormLabel>
                  <Card className="border-dashed border-2">
                    <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
                      {mediaType === "audio" && audioFile ? (
                        <div className="w-full bg-blue-50 rounded-md p-4">
                          <div className="flex items-center justify-between">
                            <p className="truncate flex-1">{audioFile.name}</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setAudioFile(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : mediaType === "video" && videoFile ? (
                        <div className="w-full bg-blue-50 rounded-md p-4">
                          <div className="flex items-center justify-between">
                            <p className="truncate flex-1">{videoFile.name}</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setVideoFile(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-400" />
                          <Label
                            htmlFor="media-upload"
                            className="cursor-pointer text-sm text-blue-600 hover:underline"
                          >
                            Choose {mediaType === "audio" ? "audio" : "video"} file
                          </Label>
                          <p className="text-xs text-gray-500">
                            {mediaType === "audio"
                              ? "MP3 or WAV, max 500MB"
                              : "MP4 or WEBM, max 1GB"}
                          </p>
                        </>
                      )}
                      <input
                        id="media-upload"
                        type="file"
                        accept={
                          mediaType === "audio"
                            ? "audio/mp3,audio/wav"
                            : "video/mp4,video/webm"
                        }
                        onChange={
                          mediaType === "audio" ? handleAudioChange : handleVideoChange
                        }
                        className="hidden"
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isExternal ? "Upload Podcast" : "Create Podcast"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PodcastForm;
