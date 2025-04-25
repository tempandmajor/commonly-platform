
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Upload } from "lucide-react";
import { PlacesAutocomplete } from "@/hooks/usePlacesAutocomplete";
import { Controller } from "react-hook-form";

interface EventDetailsProps {
  form: any;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  setEventImage: (file: File | null) => void;
}

export const EventDetails = ({ 
  form, 
  handleImageChange, 
  imagePreview, 
  setImagePreview, 
  setEventImage 
}: EventDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
        <CardDescription>Basic information about your event</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="Event title" {...field} />
              </FormControl>
              <FormDescription>Create a catchy title for your event</FormDescription>
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
                  placeholder="Describe your event" 
                  className="min-h-32" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>Provide details about what attendees can expect</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Event Image</FormLabel>
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Event preview"
                  className="mx-auto max-h-60 object-contain rounded-md"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setEventImage(null);
                    setImagePreview(null);
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <div className="text-sm text-gray-600">
                  Drag and drop an image, or click to browse
                </div>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    document.getElementById("image-upload")?.click();
                  }}
                >
                  Upload Image
                </Button>
              </div>
            )}
          </div>
          <FormDescription>Upload a high-quality image (max 5MB)</FormDescription>
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                  <div className="flex-1">
                    <Controller
                      name="location"
                      control={form.control}
                      render={({ field }) => (
                        <PlacesAutocomplete
                          onPlaceSelect={(place) => {
                            field.onChange(place.formatted_address);
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
              </FormControl>
              <FormDescription>Enter the address where the event will take place</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
