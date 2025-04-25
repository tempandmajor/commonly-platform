
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Event, SponsorshipTier } from "@/types/event";
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
  sponsorshipTiers: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      price: z.number().min(0),
      benefits: z.array(z.string()),
      limitedSpots: z.number().optional(),
      spotsTaken: z.number().optional()
    })
  ).optional(),
  preSaleGoal: z.number().min(0).optional(),
  referralPercentage: z.number().min(0).max(15).default(5)
});

export type EventFormValues = z.infer<typeof formSchema>;

export const useEventForm = (currentUser: any, userData: any) => {
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

  const form = useForm<EventFormValues>({
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
      referralPercentage: 5,
      sponsorshipTiers: [
        {
          name: "Bronze Sponsor",
          price: 500,
          benefits: ["Logo on event page", "Social media mention"],
          limitedSpots: 10
        }
      ]
    },
  });

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

  const handleAutosave = async (formData: EventFormValues) => {
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
      
      const newDraftId = await saveEventDraft(currentUser.uid, draftData as Partial<Event>, draftId || undefined);
      
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

  const onSubmit = async (data: EventFormValues) => {
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
      
      const eventData = {
        title: data.title,
        description: data.description,
        price: data.isFree ? 0 : (data.price || 0),
        imageUrl,
        organizer: userData?.displayName || "Unknown",
        organizerId: currentUser.uid,
        published: !data.scheduledPublish,
        date: format(data.startDate, "yyyy-MM-dd'T'HH:mm:ss"),
        location: data.location,
        category: "general",
        eventType: data.eventType,
        ageRestriction: data.ageRestriction,
        isPrivate: data.isPrivate,
        isFree: data.isFree,
        rewards: data.rewards || "",
        scheduledPublishDate: data.scheduledPublish && data.scheduledPublishDate 
          ? format(data.scheduledPublishDate, "yyyy-MM-dd'T'HH:mm:ss") 
          : undefined,
        stripeConnectId: userData?.stripeConnectId,
        endDate: data.endDate ? format(data.endDate, "yyyy-MM-dd'T'HH:mm:ss") : undefined,
        eventDuration: data.eventDuration,
        sponsorshipTiers: data.sponsorshipTiers as SponsorshipTier[],
        preSaleGoal: data.preSaleGoal,
        preSaleCount: 0,
        referralPercentage: data.referralPercentage
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

  return {
    form,
    eventImage,
    setEventImage,
    imagePreview,
    setImagePreview,
    uploading,
    saving,
    lastSaved,
    hasStripeAccount,
    checkingStripe,
    handleImageChange,
    onSubmit,
    connectStripe,
    handleAutosave
  };
};
