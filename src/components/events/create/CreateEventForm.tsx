
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { format } from 'date-fns';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { EventTypeSelection } from './EventTypeSelection';
import { EventDetails } from './EventDetails';
import { DateTimeSection } from './DateTimeSection';
import { PricingAccess } from './PricingAccess';
import { SponsorshipTiers } from './SponsorshipTiers';
import { PublicationSettings } from './PublicationSettings';
import { VirtualEventSection } from './VirtualEventSection';
import { useEventForm } from '@/hooks/useEventForm';

interface CreateEventFormProps {
  currentUser: any;
  userData: any;
}

export const CreateEventForm = ({ currentUser, userData }: CreateEventFormProps) => {
  const navigate = useNavigate();
  const { 
    form,
    eventImage,
    setEventImage,
    imagePreview,
    setImagePreview,
    uploading,
    saving,
    lastSaved,
    handleImageChange,
    onSubmit,
    handleAutosave
  } = useEventForm(currentUser, userData);

  const isFree = form.watch("isFree");
  const eventType = form.watch("eventType");
  const scheduledPublish = form.watch("scheduledPublish");
  const isVirtual = form.watch("isVirtual");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {lastSaved && (
          <div className="mb-4 flex items-center text-sm text-muted-foreground">
            <Save className="h-4 w-4 mr-1" />
            Last saved: {format(lastSaved, "MMM d, yyyy h:mm a")}
          </div>
        )}

        <EventTypeSelection form={form} />
        
        <EventDetails 
          form={form}
          handleImageChange={handleImageChange}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          setEventImage={setEventImage}
        />
        
        <VirtualEventSection
          isVirtual={isVirtual}
        />
        
        <DateTimeSection 
          form={form}
          eventType={eventType}
        />
        
        <PricingAccess 
          form={form}
          isFree={isFree}
        />
        
        <SponsorshipTiers form={form} />
        
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
  );
};
