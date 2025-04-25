
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, AlertCircle, Plus, MapPin, Upload, Save, Calendar, CheckCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { usePlacesAutocomplete, PlacesAutocomplete } from "@/hooks/usePlacesAutocomplete";
import { 
  createEvent, 
  saveEventDraft, 
  uploadEventImage, 
  checkStripeConnectAccount,
  updateStripeConnectId
} from "@/services/eventService";

import { cn } from "@/lib/utils";

const formSchema = z.object({
  eventType: z.enum(["single", "multi", "tour"], {
    required_error: "Please select an event type",
  }),
  title: z.string().min(5, {
    message: "Title must be at least 5 characters",
  }).max(100),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters",
  }).max(2000),
  price: z.number().min(0).optional(),
  location: z.string().min(5, {
    message: "Location is required",
  }),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date().optional(),
  eventDuration: z.enum(["30", "60", "90"]).optional(),
  ageRestriction: z.enum(["all", "13+", "18+", "21+"]),
  isPrivate: z.boolean().default(false),
  isFree: z.boolean().default(false),
  rewards: z.string().optional(),
  scheduledPublish: z.boolean().default(false),
  scheduledPublishDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CreateEvent: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasStripeAccount, setHasStripeAccount] = useState<boolean>(false);
  const [checkingStripe, setCheckingStripe] = useState(true);
  const autosaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventType: "single",
      title: "",
      description: "",
      price: 0,
      location: "",
      ageRestriction: "all",
      isPrivate: false,
      isFree: false,
      scheduledPublish: false,
    },
  });
  
  const isFree = form.watch("isFree");
  const eventType = form.watch("eventType");
  const scheduledPublish = form.watch("scheduledPublish");

  // Check for Stripe account
  useEffect(() => {
    const checkStripeAccount = async () => {
      if (!currentUser) return;
      
      try {
        setCheckingStripe(true);
        const hasAccount = await checkStripeConnectAccount(currentUser.uid);
        setHasStripeAccount(hasAccount);
      } catch (error) {
        console.error("Error checking Stripe account:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify your Stripe connect account",
        });
      } finally {
        setCheckingStripe(false);
      }
    };
    
    checkStripeAccount();
  }, [currentUser]);

  // Setup autosave
  useEffect(() => {
    if (!currentUser) return;

    // Start autosave interval
    autosaveIntervalRef.current = setInterval(() => {
      const formData = form.getValues();
      handleAutosave(formData);
    }, 30000); // Autosave every 30 seconds

    return () => {
      if (autosaveIntervalRef.current) {
        clearInterval(autosaveIntervalRef.current);
      }
    };
  }, [currentUser, form, draftId]);

  // Handle autosaving
  const handleAutosave = async (formData: FormValues) => {
    if (!currentUser || !formData.title) return;
    
    try {
      setSaving(true);
      
      const draftData = {
        ...formData,
        organizer: userData?.displayName || "Unknown",
        organizerId: currentUser.uid,
      };
      
      const newDraftId = await saveEventDraft(currentUser.uid, draftData, draftId || undefined);
      
      if (!draftId) {
        setDraftId(newDraftId);
      }
      
      setLastSaved(new Date());
      
      toast({
        title: "Draft saved",
        description: "Your event draft has been saved automatically",
      });
    } catch (error) {
      console.error("Autosave error:", error);
    } finally {
      setSaving(false);
    }
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type and size
      if (!file.type.includes("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid file",
          description: "Please upload an image file",
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Image size should be less than 5MB",
        });
        return;
      }
      
      setEventImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You need to be logged in to create events",
      });
      return;
    }

    if (!hasStripeAccount) {
      toast({
        variant: "destructive",
        title: "Stripe account required",
        description: "You need to connect a Stripe account before creating events",
      });
      return;
    }

    try {
      setUploading(true);
      
      // Upload image if selected
      let imageUrl = "";
      if (eventImage) {
        imageUrl = await uploadEventImage(eventImage, currentUser.uid);
      }
      
      // Prepare event data
      const eventData = {
        ...data,
        price: data.isFree ? 0 : (data.price || 0),
        imageUrl,
        organizer: userData?.displayName || "Unknown",
        organizerId: currentUser.uid,
        published: !data.scheduledPublish,
        scheduledPublishDate: data.scheduledPublish && data.scheduledPublishDate 
          ? format(data.scheduledPublishDate, "yyyy-MM-dd'T'HH:mm:ss") 
          : undefined,
        stripeConnectId: userData?.stripeConnectId,
      };
      
      // Create event in Firestore
      const eventId = await createEvent(eventData);
      
      toast({
        title: "Event created",
        description: data.scheduledPublish 
          ? "Your event has been scheduled for publication" 
          : "Your event has been published successfully",
      });
      
      // Navigate to event page
      navigate(`/events/${eventId}`);
      
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create event. Please try again later.",
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle connecting to Stripe
  const connectStripe = async () => {
    // In a real implementation, this would redirect to Stripe Connect onboarding
    // For now, we'll just simulate a successful connection
    if (!currentUser) return;
    
    try {
      // Simulate connecting to Stripe
      const stripeConnectId = `stripe_${Date.now()}`;
      await updateStripeConnectId(currentUser.uid, stripeConnectId);
      setHasStripeAccount(true);
      
      toast({
        title: "Stripe connected",
        description: "Your Stripe account has been connected successfully",
      });
    } catch (error) {
      console.error("Error connecting Stripe:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to connect Stripe account",
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to create events.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Button onClick={() => navigate("/")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  if (checkingStripe) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
        <span className="ml-2">Checking account status...</span>
      </div>
    );
  }

  if (!hasStripeAccount) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Connect Stripe Account</CardTitle>
            <CardDescription>
              To create and receive payments for events, you need to connect a Stripe account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Stripe Connect Required</AlertTitle>
              <AlertDescription>
                Before creating events, you need to verify your identity and connect a Stripe account to receive payments.
                This helps ensure that all event organizers on Commonly are verified and can receive payments securely.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium">What happens when you connect Stripe?</h4>
              <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
                <li>Verify your identity through Stripe Identity</li>
                <li>Set up a payment account to receive funds from ticket sales</li>
                <li>Enable secure payments for your events</li>
                <li>Receive payouts to your bank account</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={connectStripe} className="w-full">
              Connect with Stripe
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create Event</h1>
      
      {/* Draft status indicator */}
      {lastSaved && (
        <div className="mb-4 flex items-center text-sm text-muted-foreground">
          <Save className="h-4 w-4 mr-1" />
          Last saved: {format(lastSaved, "MMM d, yyyy h:mm a")}
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Event Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Event Type</CardTitle>
              <CardDescription>Choose the type of event you're creating</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div
                        className={cn(
                          "border rounded-md p-4 cursor-pointer hover:border-primary transition-colors",
                          field.value === "single" ? "border-primary bg-primary/5" : "border-input"
                        )}
                        onClick={() => field.onChange("single")}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold">Single Event</h3>
                          {field.value === "single" && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          One-time event on a specific date
                        </p>
                      </div>
                      
                      <div
                        className={cn(
                          "border rounded-md p-4 cursor-pointer hover:border-primary transition-colors",
                          field.value === "multi" ? "border-primary bg-primary/5" : "border-input"
                        )}
                        onClick={() => field.onChange("multi")}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold">Multi-Day Event</h3>
                          {field.value === "multi" && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Event spanning multiple consecutive days
                        </p>
                      </div>
                      
                      <div
                        className={cn(
                          "border rounded-md p-4 cursor-pointer hover:border-primary transition-colors",
                          field.value === "tour" ? "border-primary bg-primary/5" : "border-input"
                        )}
                        onClick={() => field.onChange("tour")}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold">Tour</h3>
                          {field.value === "tour" && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Multiple events in different locations
                        </p>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Basic information about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Event title" {...field} />
                    </FormControl>
                    <FormDescription>
                      Create a catchy title for your event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
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
                    <FormDescription>
                      Provide details about what attendees can expect
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
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
                <FormDescription>
                  Upload a high-quality image (max 5MB)
                </FormDescription>
              </div>

              {/* Location */}
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
                    <FormDescription>
                      Enter the address where the event will take place
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle>Date & Time</CardTitle>
              <CardDescription>When will your event take place?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date (for multi-day events) */}
              {(eventType === "multi" || eventType === "tour") && (
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick an end date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              const startDate = form.getValues("startDate");
                              return startDate && date < startDate;
                            }}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        For multi-day events, select when the event ends
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Event Duration (for tour events) */}
              {eventType === "tour" && (
                <FormField
                  control={form.control}
                  name="eventDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tour Duration</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="60">60 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        How long will your tour last?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Pricing & Access */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Access</CardTitle>
              <CardDescription>Set up pricing and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Free Event Switch */}
              <FormField
                control={form.control}
                name="isFree"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Free Event</FormLabel>
                      <FormDescription>
                        Make this event free for all attendees
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Price (if not free) */}
              {!isFree && (
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticket Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Set the price for your event tickets
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Age Restriction */}
              <FormField
                control={form.control}
                name="ageRestriction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Restriction</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select age restriction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ages</SelectItem>
                          <SelectItem value="13+">13+</SelectItem>
                          <SelectItem value="18+">18+</SelectItem>
                          <SelectItem value="21+">21+</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Set age restrictions for your event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Private Event Switch */}
              <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Private Event</FormLabel>
                      <FormDescription>
                        Only people with the link can view this event
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Rewards */}
              <FormField
                control={form.control}
                name="rewards"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attendee Rewards (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe any rewards or perks for attendees"
                        className="min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      List any special rewards for attending your event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Publication Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publication Settings</CardTitle>
              <CardDescription>Control when your event goes live</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Schedule Publication */}
              <FormField
                control={form.control}
                name="scheduledPublish"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Schedule Publication</FormLabel>
                      <FormDescription>
                        Set a future date to publish this event
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Publication Date */}
              {scheduledPublish && (
                <FormField
                  control={form.control}
                  name="scheduledPublishDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Publication Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a publication date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When should this event be published?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const formData = form.getValues();
                handleAutosave(formData);
              }}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving ? "Saving..." : "Save Draft"}
            </Button>
            <Button 
              type="submit" 
              disabled={uploading || !form.formState.isValid}
              className="w-full sm:w-auto"
            >
              {uploading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateEvent;
