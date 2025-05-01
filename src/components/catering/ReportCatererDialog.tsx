
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { reportCaterer } from '@/services/catererService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ReportCatererDialogProps {
  isOpen: boolean;
  onClose: () => void;
  catererId: string;
  catererName: string;
}

const reasonOptions = [
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'fraud', label: 'Fraudulent business' },
  { value: 'quality', label: 'Poor quality service' },
  { value: 'behavior', label: 'Unprofessional behavior' },
  { value: 'other', label: 'Other' }
];

const ReportCatererDialog: React.FC<ReportCatererDialogProps> = ({ 
  isOpen, 
  onClose,
  catererId,
  catererName
}) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const handleSubmit = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to report a caterer",
        variant: "destructive",
      });
      return;
    }
    
    if (!reason) {
      toast({
        title: "Error",
        description: "Please select a reason for your report",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const success = await reportCaterer(
        currentUser.uid, 
        catererId, 
        reason, 
        details
      );
      
      if (success) {
        toast({
          title: "Report submitted",
          description: "Thank you for your report. We will review it shortly.",
        });
        onClose();
      } else {
        toast({
          title: "Error",
          description: "Failed to submit report. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
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
            Please let us know why you're reporting this caterer.
            All reports are confidential.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <RadioGroup 
            value={reason} 
            onValueChange={setReason}
          >
            {reasonOptions.map((option) => (
              <div key={option.value} className="flex items-start space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label className="font-normal" htmlFor={option.value}>
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          <Textarea
            placeholder="Provide additional details about your report..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!reason || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportCatererDialog;
