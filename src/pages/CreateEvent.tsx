
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { AlertCircle, Save } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EventTypeSelection } from "@/components/events/create/EventTypeSelection";
import { EventDetails } from "@/components/events/create/EventDetails";
import { DateTimeSection } from "@/components/events/create/DateTimeSection";
import { PricingAccess } from "@/components/events/create/PricingAccess";
import { PublicationSettings } from "@/components/events/create/PublicationSettings";
import { 
  createEvent, 
  saveEventDraft, 
  uploadEventImage, 
  checkStripeConnectAccount,
  updateStripeConnectId
} from "@/services/eventService";

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

  useEffect(() => {
    if (!currentUser) return;

    autosaveIntervalRef.current = setInterval(() => {
      const formData = form.getValues();
      handleAutosave(formData);
    }, 30000);

    return () => {
      if (autosaveIntervalRef.current) {
        clearInterval(autosaveIntervalRef.current);
      }
    };
  }, [currentUser, form, draftId]);

  const handleAutosave = async (formData: FormValues) => {
    if (!currentUser || !formData.title) return;
    
    try {
      setSaving(true);
      
      const draftData = {
        ...formData,
        organizer: userData?.displayName || "Unknown",
        organizerId: currentUser.uid,
        startDate: formData.startDate ? format(formData.startDate, "yyyy-MM-dd'T'HH:mm:ss") : undefined,
        endDate: formData.endDate ? format(formData.endDate, "yyyy-MM-dd'T'HH:mm:ss") : undefined,
        scheduledPublishDate: formData.scheduledPublishDate ? 
          format(formData.scheduledPublishDate, "yyyy-MM-dd'T'HH:mm:ss") : undefined,
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.includes("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid file",
          description: "Please upload an image file",
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
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
      
      let imageUrl = "";
      if (eventImage) {
        imageUrl = await uploadEventImage(eventImage, currentUser.uid);
      }
      
      // Ensure all required fields are present and properly typed
      const eventData = {
        title: data.title, // Explicitly include title as non-optional
        description: data.description, // Explicitly include description as non-optional
        price: data.isFree ? 0 : (data.price || 0),
        imageUrl,
        organizer: userData?.displayName || "Unknown",
        organizerId: currentUser.uid,
        published: !data.scheduledPublish,
        date: format(data.startDate, "yyyy-MM-dd'T'HH:mm:ss"),
        location: data.location, // Explicitly include location
        category: "general",
        eventType: data.eventType as "single" | "multi" | "tour",
        ageRestriction: data.ageRestriction,
        isPrivate: data.isPrivate,
        isFree: data.isFree,
        rewards: data.rewards || "",
        scheduledPublishDate: data.scheduledPublish && data.scheduledPublishDate 
          ? format(data.scheduledPublishDate, "yyyy-MM-dd'T'HH:mm:ss") 
          : undefined,
        stripeConnectId: userData?.stripeConnectId,
        // For multi-day events or events with duration
        endDate: data.endDate ? format(data.endDate, "yyyy-MM-dd'T'HH:mm:ss") : undefined,
        eventDuration: data.eventDuration,
      };
      
      const eventId = await createEvent(eventData);
      
      toast({
        title: "Event created",
        description: data.scheduledPublish 
          ? "Your event has been scheduled for publication" 
          : "Your event has been published successfully",
      });
      
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

  const connectStripe = async () => {
    if (!currentUser) return;
    
    try {
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
      
      {lastSaved && (
        <div className="mb-4 flex items-center text-sm text-muted-foreground">
          <Save className="h-4 w-4 mr-1" />
          Last saved: {format(lastSaved, "MMM d, yyyy h:mm a")}
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <EventTypeSelection form={form} />
          
          <EventDetails 
            form={form}
            handleImageChange={handleImageChange}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            setEventImage={setEventImage}
          />
          
          <DateTimeSection 
            form={form}
            eventType={eventType}
          />
          
          <PricingAccess 
            form={form}
            isFree={isFree}
          />
          
          <PublicationSettings 
            form={form}
            scheduledPublish={scheduledPublish}
          />

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
