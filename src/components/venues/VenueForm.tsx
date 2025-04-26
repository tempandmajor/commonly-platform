
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building, MapPin, CalendarIcon, DollarSign } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { createVenue, uploadVenuePhoto } from '@/services/venueService';
import { usePlacesAutocomplete } from '@/hooks/usePlacesAutocomplete';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Define form schema with validations
const formSchema = z.object({
  name: z.string().min(3, { message: 'Venue name must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  type: z.string().min(1, { message: 'Venue type is required' }),
  capacity: z.coerce.number().int().positive({ message: 'Capacity must be a positive number' }),
  size: z.object({
    value: z.coerce.number().positive({ message: 'Size must be a positive number' }),
    unit: z.enum(['sqft', 'sqm'])
  }),
  hourlyRate: z.coerce.number().positive({ message: 'Hourly rate must be a positive number' }),
  minimumHours: z.coerce.number().int().positive({ message: 'Minimum hours must be a positive number' }),
  cleaningFee: z.coerce.number().nonnegative({ message: 'Cleaning fee must be a non-negative number' }).optional(),
  securityDeposit: z.coerce.number().nonnegative({ message: 'Security deposit must be a non-negative number' }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_VALUES: FormValues = {
  name: '',
  description: '',
  type: '',
  capacity: 0,
  size: {
    value: 0,
    unit: 'sqft'
  },
  hourlyRate: 0,
  minimumHours: 1,
  cleaningFee: 0,
  securityDeposit: 0
};

const VenueForm = () => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<{
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    lat: number;
    lng: number;
    placeId?: string;
  } | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  
  const navigate = useNavigate();
  const { isLoaded, initializeAutocomplete, getPlace } = usePlacesAutocomplete();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...selectedFiles]);

      // Create preview URLs for the selected photos
      const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
      setPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removePhoto = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(photoPreviewUrls[index]);
    
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviewUrls(photoPreviewUrls.filter((_, i) => i !== index));
  };

  const handleAddressInputRef = (ref: HTMLInputElement | null) => {
    if (ref && isLoaded) {
      initializeAutocomplete(ref);
      ref.addEventListener('blur', async () => {
        try {
          const place = await getPlace();
          if (place && place.geometry && place.formatted_address) {
            let city = '';
            let state = '';
            let zipCode = '';
            let country = '';

            place.address_components?.forEach(component => {
              if (component.types.includes('locality')) {
                city = component.long_name;
              } else if (component.types.includes('administrative_area_level_1')) {
                state = component.short_name;
              } else if (component.types.includes('postal_code')) {
                zipCode = component.long_name;
              } else if (component.types.includes('country')) {
                country = component.long_name;
              }
            });

            setLocation({
              address: place.formatted_address,
              city,
              state,
              zipCode,
              country,
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              placeId: place.place_id
            });
          }
        } catch (error) {
          console.error('Error getting place', error);
        }
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (!auth.currentUser) {
        toast.error('You must be logged in to create a venue');
        return;
      }

      if (photos.length === 0) {
        toast.error('Please upload at least one photo of your venue');
        return;
      }

      if (!location) {
        toast.error('Please select a valid address using the autocomplete');
        return;
      }

      setIsSubmitting(true);

      // Create venue availability from selected dates
      const availability = availableDates.map(date => {
        const start = new Date(date);
        start.setHours(9, 0, 0, 0); // 9 AM
        
        const end = new Date(date);
        end.setHours(17, 0, 0, 0); // 5 PM
        
        return {
          dayOfWeek: date.getDay(), // 0 = Sunday, 6 = Saturday
          startTime: '09:00',
          endTime: '17:00'
        };
      });

      // Prepare venue data
      const venueData = {
        name: data.name,
        description: data.description,
        type: data.type,
        capacity: data.capacity,
        size: {
          value: data.size.value,
          unit: data.size.unit
        },
        location,
        amenities: [],
        rules: [],
        photos: [],
        pricing: {
          hourlyRate: data.hourlyRate,
          minimumHours: data.minimumHours,
          cleaningFee: data.cleaningFee || 0,
          securityDeposit: data.securityDeposit || 0,
          currency: 'USD'
        },
        availability,
        ownerId: auth.currentUser.uid,
        ownerName: auth.currentUser.displayName || 'Unnamed User',
        ownerPhotoURL: auth.currentUser.photoURL || '',
        isVerified: false,
        isActive: false
      };

      // Create the venue in Firestore
      const venueId = await createVenue(venueData);

      // Upload photos
      const photoUploadPromises = photos.map(photo => 
        uploadVenuePhoto(venueId, photo)
      );
      
      await Promise.all(photoUploadPromises);

      toast.success('Venue created successfully! It will be live after verification.');
      navigate('/my-venues');
    } catch (error) {
      console.error('Error creating venue:', error);
      toast.error('Failed to create venue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const venueTypes = [
    'Conference Room',
    'Event Hall',
    'Studio',
    'Office Space',
    'Outdoor Area',
    'Restaurant',
    'Rooftop',
    'Private Home',
    'Warehouse',
    'Gallery',
    'Theater',
    'Classroom',
    'Other'
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the venue name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select venue type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {venueTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your venue in detail" 
                        className="h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Capacity and Size */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Capacity & Size</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-5 gap-2">
                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name="size.value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="size.unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sqft">sqft</SelectItem>
                            <SelectItem value="sqm">sqm</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <div className="space-y-4">
              <div>
                <FormLabel htmlFor="address">Address</FormLabel>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    ref={handleAddressInputRef}
                    placeholder="Enter venue address"
                    className="pl-10"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                {location && (
                  <div className="mt-2 p-2 bg-secondary/50 rounded-md text-sm">
                    <p className="font-medium">Selected location:</p>
                    <p>{location.address}</p>
                    <p>
                      {location.city}, {location.state} {location.zipCode}, {location.country}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="number" placeholder="0" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minimumHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Booking Hours</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <FormField
                control={form.control}
                name="cleaningFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cleaning Fee ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="number" placeholder="0" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="securityDeposit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Deposit ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="number" placeholder="0" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Availability */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Availability</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Select the days your venue is available for booking. You can customize the hours later.
              </p>
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {availableDates.length === 0 ? (
                        <span>No dates selected</span>
                      ) : availableDates.length === 1 ? (
                        <span>1 date selected</span>
                      ) : (
                        <span>{availableDates.length} dates selected</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="multiple"
                      selected={availableDates}
                      onSelect={setAvailableDates}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Photos */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Photos</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Upload high-quality photos of your venue. We recommend at least 3 photos.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {photoPreviewUrls.map((url, index) => (
                  <div key={index} className="relative h-40 bg-secondary rounded-md overflow-hidden">
                    <img
                      src={url}
                      alt={`Venue photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removePhoto(index)}
                    >
                      &times;
                    </Button>
                  </div>
                ))}

                <label className="flex flex-col justify-center items-center h-40 bg-secondary hover:bg-secondary/80 rounded-md cursor-pointer border-2 border-dashed border-muted-foreground/50">
                  <div className="flex flex-col justify-center items-center text-center p-4">
                    <Building className="h-6 w-6 mb-2" />
                    <span className="font-medium">Add Photo</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Stripe Verification Note */}
          <Card className="border-yellow-400/50 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Stripe Verification Required
              </h3>
              <p className="text-sm mt-2">
                Before your venue can go live, you'll need to complete Stripe Identity 
                verification and connect a Stripe account for receiving payments. You'll be 
                prompted to complete this process after submitting your venue.
              </p>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="px-8">
              {isSubmitting ? 'Creating...' : 'Create Venue'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default VenueForm;
