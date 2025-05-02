
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { reportCaterer } from '@/services/catererService';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface ReportCatererDialogProps {
  catererId: string;
  catererName: string;
  isOpen: boolean;
  onClose: () => void;
}

const ReportCatererDialog: React.FC<ReportCatererDialogProps> = ({
  catererId,
  catererName,
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [reason, setReason] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: 'Error',
        description: 'Please select a reason for reporting',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await reportCaterer(catererId, reason, details);
      toast({
        title: 'Report Submitted',
        description: 'Thank you for your feedback. We will review this report.',
      });
      onClose();
      setReason('');
      setDetails('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report {catererName}</DialogTitle>
          <DialogDescription>
            Please provide details about why you're reporting this caterer.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inaccurate_info">Inaccurate Information</SelectItem>
                <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                <SelectItem value="scam">Potential Scam</SelectItem>
                <SelectItem value="bad_service">Bad Service Experience</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="details">Additional Details</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please provide more information about your report"
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportCatererDialog;
