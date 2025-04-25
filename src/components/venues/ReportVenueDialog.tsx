
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { reportVenue } from '@/services/venueService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

interface ReportVenueDialogProps {
  venueId: string;
  venueName: string;
  isOpen: boolean;
  onClose: () => void;
}

const reportReasons = [
  'Inaccurate information',
  'Inappropriate content',
  'Scam or fraud',
  'Venue does not exist',
  'Other',
];

const ReportVenueDialog: React.FC<ReportVenueDialogProps> = ({ 
  venueId, 
  venueName, 
  isOpen, 
  onClose 
}) => {
  const { currentUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  
  const form = useForm({
    defaultValues: {
      description: '',
    },
  });

  const handleSubmit = async (data: { description: string }) => {
    if (!currentUser) {
      toast.error('You must be logged in to report a venue');
      return;
    }
    
    if (!selectedReason) {
      toast.error('Please select a reason for reporting');
      return;
    }
    
    try {
      setSubmitting(true);
      
      await reportVenue({
        venueId,
        userId: currentUser.uid,
        reason: selectedReason,
        description: data.description,
      });
      
      toast.success('Report submitted successfully');
      onClose();
      form.reset();
      setSelectedReason('');
    } catch (error) {
      toast.error('Failed to submit report');
      console.error('Error reporting venue:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Report Venue</DialogTitle>
          <DialogDescription>
            Please provide details about why you're reporting "{venueName}".
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div>
              <FormLabel>Reason for reporting</FormLabel>
              <div className="mt-2 grid grid-cols-1 gap-2">
                {reportReasons.map((reason) => (
                  <div
                    key={reason}
                    className={`border rounded-md p-3 cursor-pointer transition-all ${
                      selectedReason === reason 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedReason(reason)}
                  >
                    {reason}
                  </div>
                ))}
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional details</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please provide more details about the issue"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportVenueDialog;
