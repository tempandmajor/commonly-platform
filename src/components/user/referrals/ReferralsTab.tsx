
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Facebook, Twitter, Linkedin, Copy } from 'lucide-react';
import { Referral } from '@/types/event';
import { toast } from '@/hooks/use-toast';

interface ReferralsTabProps {
  eventId?: string;
  referrals: Referral[];
  creating: boolean;
  selectedReferral: Referral | null;
  setSelectedReferral: (referral: Referral | null) => void;
  handleCreateReferral: () => Promise<void>;
  handleShareToSocial: (platform: 'facebook' | 'twitter' | 'linkedin') => Promise<void>;
}

export const ReferralsTab = ({
  eventId,
  referrals,
  creating,
  selectedReferral,
  setSelectedReferral,
  handleCreateReferral,
  handleShareToSocial,
}: ReferralsTabProps) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Referral link copied to clipboard',
    });
  };

  return (
    <div className="space-y-4 pt-4">
      {eventId && (
        <Button 
          onClick={handleCreateReferral} 
          disabled={creating}
          className="w-full mb-4"
        >
          {creating ? 'Creating...' : 'Create Referral Link for This Event'}
        </Button>
      )}
      
      {selectedReferral && (
        <Card className="bg-accent/50 mb-6">
          <CardContent className="pt-6 space-y-2">
            <div>
              <p className="font-medium">Your Referral Link</p>
              <div className="flex items-center mt-1 space-x-2">
                <Input 
                  readOnly 
                  value={`https://commonly-platform.web.app/r/${selectedReferral.code}`}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(`https://commonly-platform.web.app/r/${selectedReferral.code}`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="pt-2">
              <p className="font-medium mb-2">Share to:</p>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleShareToSocial('facebook')}
                >
                  <Facebook className="h-4 w-4 mr-1" />
                  Facebook
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleShareToSocial('twitter')}
                >
                  <Twitter className="h-4 w-4 mr-1" />
                  Twitter
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleShareToSocial('linkedin')}
                >
                  <Linkedin className="h-4 w-4 mr-1" />
                  LinkedIn
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {referrals.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-medium">Your Referral Links</h3>
          <div className="space-y-3">
            {referrals.map((referral) => (
              <div 
                key={referral.id}
                className={`p-3 border rounded-md ${selectedReferral?.id === referral.id ? 'border-primary' : ''}`}
                onClick={() => setSelectedReferral(referral)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{referral.code}</p>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(referral.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${referral.earnings.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {referral.conversionCount} conversions
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-muted-foreground">You haven't created any referral links yet.</p>
          {eventId && (
            <Button 
              onClick={handleCreateReferral}
              variant="outline"
              className="mt-2"
            >
              Create Your First Referral Link
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
