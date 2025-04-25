
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { createVenue, uploadVenuePhoto } from '@/services/venueService';
import { PlacesAutocomplete, usePlacesAutocomplete } from '@/hooks/usePlacesAutocomplete';
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
import { toast } from 'sonner';
import { ImagePlus, Trash } from 'lucide-react';

type FormValues = {
  name: string;
  description: string;
  type: string;
  capacity: number;
  sizeValue: number;
  sizeUnit: 'sqft' | 'sqm';
  hourlyRate: number;
  dailyRate?: number;
  minimumHours: number;
  cleaningFee?: number;
  securityDeposit?: number;
  currency: string;
};

const venueTypes = [
  'Conference Room',
  'Event Space',
  'Studio',
  'Office',
  'Outdoor',
  'Restaurant',
  'Gallery',
  'Workshop',
  'Other',
];

const VenueForm: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{ id: string; url: string; file: File }>>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [venueRules, setVenueRules] = useState<Array<{ id: string; description: string }>>([]);
  const [newRule, setNewRule] = useState('');
  const [amenities, setAmenities] = useState<Array<{ id: string; name: string }>>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [availabilitySlots, setAvailabilitySlots] = useState<Array<{ dayOfWeek: number; startTime: string; endTime: string }>>([]);
  const [newSlot, setNewSlot] = useState({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' });
  
  const { isLoaded } = usePlacesAutocomplete();
  
  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      type: '',
      capacity: 1,
      sizeValue: 100,
      sizeUnit: 'sqft',
      hourlyRate: 50,
      minimumHours: 2,
      currency: 'USD',
    },
  });
  
  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (!place.geometry) return;
    
    const addressComponents = place.address_components || [];
    let city = '', state = '', country = '', zipCode = '';
    
    addressComponents.forEach(component => {
      const types = component.types;
      if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name;
      }
    });
    
    setSelectedLocation({
      address: place.formatted_address || '',
      city,
      state,
      zipCode,
      country,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      placeId: place.place_id,
    });
  };
  
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingPhoto(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const photoId = Math.random().toString(36).substring(2, 15);
        const photoUrl = URL.createObjectURL(file);
        
        setUploadedPhotos(prev => [...prev, { id: photoId, url: photoUrl, file }]);
      }
    } catch (error) {
      toast.error('Failed to upload photo. Please try again.');
      console.error('Error uploading photo:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };
  
  const handleRemovePhoto = (photoId: string) => {
    setUploadedPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };
  
  const handleAddRule = () => {
    if (!newRule.trim()) return;
    
    setVenueRules(prev => [...prev, {
      id: Math.random().toString(36).substring(2, 15),
      description: newRule.trim()
    }]);
    setNewRule('');
  };
  
  const handleRemoveRule = (ruleId: string) => {
    setVenueRules(prev => prev.filter(rule => rule.id !== ruleId));
  };
  
  const handleAddAmenity = () => {
    if (!newAmenity.trim()) return;
    
    setAmenities(prev => [...prev, {
      id: Math.random().toString(36).substring(2, 15),
      name: newAmenity.trim()
    }]);
    setNewAmenity('');
  };
  
  const handleRemoveAmenity = (amenityId: string) => {
    setAmenities(prev => prev.filter(amenity => amenity.id !== amenityId));
  };
  
  const handleAddAvailabilitySlot = () => {
    setAvailabilitySlots(prev => [...prev, { ...newSlot }]);
  };
  
  const handleRemoveAvailabilitySlot = (index: number) => {
    setAvailabilitySlots(prev => prev.filter((_, i) => i !== index));
  };
  
  const onSubmit = async (data: FormValues) => {
    if (!currentUser) {
      toast.error('You must be logged in to list a venue.');
      return;
    }
    
    if (!selectedLocation) {
      toast.error('Please select a location for your venue.');
      return;
    }
    
    if (uploadedPhotos.length === 0) {
      toast.error('Please upload at least one photo of your venue.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare venue data
      const venueData = {
        name: data.name,
        description: data.description,
        type: data.type,
        capacity: Number(data.capacity),
        size: {
          value: Number(data.sizeValue),
          unit: data.sizeUnit
        },
        location: selectedLocation,
        amenities,
        rules: venueRules,
        photos: [], // Will be added after venue creation
        pricing: {
          hourlyRate: Number(data.hourlyRate),
          dailyRate: data.dailyRate ? Number(data.dailyRate) : undefined,
          minimumHours: Number(data.minimumHours),
          cleaningFee: data.cleaningFee ? Number(data.cleaningFee) : undefined,
          securityDeposit: data.securityDeposit ? Number(data.securityDeposit) : undefined,
          currency: data.currency
        },
        availability: availabilitySlots,
        ownerId: currentUser.uid,
        ownerName: userData?.displayName || currentUser.displayName || 'Anonymous',
        ownerPhotoURL: userData?.photoURL || currentUser.photoURL || undefined,
        stripeConnectId: userData?.stripeConnectId, // If available from the userData
        isVerified: false,
        isActive: false,
      };
      
      // Create venue in Firestore
      const venueId = await createVenue(venueData);
      
      // Upload photos
      const photoUploadPromises = uploadedPhotos.map((photo, index) => {
        return uploadVenuePhoto(
          venueId, 
          photo.file,
          index === 0 ? 'Primary photo' : ''
        );
      });
      
      await Promise.all(photoUploadPromises);
      
      toast.success('Your venue has been submitted for review!');
      navigate('/my-venues');
    } catch (error) {
      toast.error('Failed to submit venue. Please try again.');
      console.error('Error submitting venue:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg border p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Venue name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter venue name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              rules={{ required: 'Description is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your venue"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              rules={{ required: 'Venue type is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Type</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="">Select a venue type</option>
                      {venueTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="capacity"
                rules={{ required: 'Capacity is required', min: { value: 1, message: 'Capacity must be at least 1' } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity (people)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2 items-end">
                <FormField
                  control={form.control}
                  name="sizeValue"
                  rules={{ required: 'Size is required', min: { value: 1, message: 'Size must be at least 1' } }}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Size</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sizeUnit"
                  render={({ field }) => (
                    <FormItem className="w-24">
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="sqft">sq ft</option>
                          <option value="sqm">sq m</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          
          {/* Location */}
          <div className="space-y-6 pt-6 border-t">
            <h2 className="text-xl font-semibold">Location</h2>
            
            <div>
              <FormLabel>Address</FormLabel>
              <div className="mt-1">
                <PlacesAutocomplete onPlaceSelect={handlePlaceSelect} />
              </div>
              {selectedLocation && (
                <div className="bg-muted px-3 py-2 rounded-md mt-2 text-sm">
                  <p><strong>Selected location:</strong> {selectedLocation.address}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    City: {selectedLocation.city}, State: {selectedLocation.state}, Country: {selectedLocation.country}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Photos */}
          <div className="space-y-6 pt-6 border-t">
            <h2 className="text-xl font-semibold">Photos</h2>
            
            <div className="space-y-4">
              <div>
                <FormLabel htmlFor="venue-photos">Upload Photos</FormLabel>
                <p className="text-sm text-muted-foreground mb-2">
                  Upload high-quality photos of your venue. First photo will be the main image.
                </p>
                
                <label htmlFor="venue-photos">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <ImagePlus className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2">Click to upload photos</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WEBP, max 10MB each</p>
                  </div>
                  <input 
                    id="venue-photos" 
                    type="file" 
                    accept="image/*" 
                    multiple
                    className="hidden" 
                    onChange={handlePhotoUpload} 
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>
              
              {uploadedPhotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square rounded-md overflow-hidden border">
                        <img 
                          src={photo.url} 
                          alt={`Venue photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemovePhoto(photo.id)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-sm">
                          Main Photo
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Pricing */}
          <div className="space-y-6 pt-6 border-t">
            <h2 className="text-xl font-semibold">Pricing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hourlyRate"
                rules={{ required: 'Hourly rate is required', min: { value: 1, message: 'Rate must be at least 1' } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">$</span>
                        <Input type="number" min="1" className="pl-7" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dailyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Rate (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">$</span>
                        <Input type="number" min="0" className="pl-7" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="minimumHours"
                rules={{ required: 'Minimum hours is required', min: { value: 1, message: 'Minimum hours must be at least 1' } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Hours</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cleaningFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cleaning Fee (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">$</span>
                        <Input type="number" min="0" className="pl-7" {...field} />
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
                    <FormLabel>Security Deposit (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">$</span>
                        <Input type="number" min="0" className="pl-7" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="bg-muted p-3 rounded-md text-sm">
              <p><strong>Note:</strong> Commonly takes a 5% platform fee + Stripe processing fees from each booking.</p>
            </div>
          </div>
          
          {/* Amenities */}
          <div className="space-y-6 pt-6 border-t">
            <h2 className="text-xl font-semibold">Amenities</h2>
            <p className="text-sm text-muted-foreground">
              List the amenities your venue offers.
            </p>
            
            <div className="flex gap-2">
              <Input 
                value={newAmenity} 
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Add an amenity (e.g., WiFi, A/C, Projector)"
                className="flex-grow"
              />
              <Button type="button" onClick={handleAddAmenity}>Add</Button>
            </div>
            
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {amenities.map(amenity => (
                  <div 
                    key={amenity.id} 
                    className="bg-muted flex items-center gap-2 px-3 py-1 rounded-full"
                  >
                    <span>{amenity.name}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveAmenity(amenity.id)}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Rules */}
          <div className="space-y-6 pt-6 border-t">
            <h2 className="text-xl font-semibold">House Rules</h2>
            <p className="text-sm text-muted-foreground">
              Add important rules for guests using your venue.
            </p>
            
            <div className="flex gap-2">
              <Input 
                value={newRule} 
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="Add a rule (e.g., No smoking, No pets)"
                className="flex-grow"
              />
              <Button type="button" onClick={handleAddRule}>Add</Button>
            </div>
            
            {venueRules.length > 0 && (
              <ul className="space-y-2">
                {venueRules.map(rule => (
                  <li 
                    key={rule.id} 
                    className="flex justify-between items-center bg-muted p-3 rounded-md"
                  >
                    <span>{rule.description}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => handleRemoveRule(rule.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Availability */}
          <div className="space-y-6 pt-6 border-t">
            <h2 className="text-xl font-semibold">Availability</h2>
            <p className="text-sm text-muted-foreground">
              Add your venue's regular availability. You can update specific dates later.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <FormLabel htmlFor="day-of-week">Day of Week</FormLabel>
                <select
                  id="day-of-week"
                  value={newSlot.dayOfWeek}
                  onChange={(e) => setNewSlot({...newSlot, dayOfWeek: parseInt(e.target.value)})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
              </div>
              
              <div>
                <FormLabel htmlFor="start-time">Start Time</FormLabel>
                <Input
                  id="start-time"
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                />
              </div>
              
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <FormLabel htmlFor="end-time">End Time</FormLabel>
                  <Input
                    id="end-time"
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                  />
                </div>
                <Button type="button" onClick={handleAddAvailabilitySlot} className="mb-0.5">Add</Button>
              </div>
            </div>
            
            {availabilitySlots.length > 0 && (
              <div className="mt-4 border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Day</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Hours</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {availabilitySlots.map((slot, index) => {
                      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">{days[slot.dayOfWeek]}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{slot.startTime} - {slot.endTime}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveAvailabilitySlot(index)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Submission */}
          <div className="pt-6 border-t flex flex-col sm:flex-row sm:justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/venues')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Venue for Review'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default VenueForm;
