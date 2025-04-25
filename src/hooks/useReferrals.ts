
import { useState, useEffect } from 'react';
import { getUserReferrals, getUserWallet, createReferralLink, shareReferralLink } from '@/services/sponsorshipService';
import { Referral, UserWallet } from '@/types/event';
import { toast } from '@/hooks/use-toast';

export const useReferrals = (currentUser: any, eventId?: string) => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [userReferrals, userWallet] = await Promise.all([
          getUserReferrals(currentUser.uid),
          getUserWallet(currentUser.uid),
        ]);
        
        setReferrals(userReferrals);
        setWallet(userWallet);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load your referrals data',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleCreateReferral = async () => {
    if (!currentUser || !eventId) return;
    
    try {
      setCreating(true);
      await createReferralLink(currentUser.uid, eventId);
      
      // Refresh referrals list
      const updatedReferrals = await getUserReferrals(currentUser.uid);
      setReferrals(updatedReferrals);
      
      // Find the newly created referral
      const newReferral = updatedReferrals.find(r => r.eventId === eventId);
      if (newReferral) {
        setSelectedReferral(newReferral);
      }
      
      toast({
        title: 'Referral Link Created',
        description: 'Your referral link has been created successfully',
      });
    } catch (error) {
      console.error('Error creating referral link:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create referral link',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleShareToSocial = async (platform: 'facebook' | 'twitter' | 'linkedin') => {
    if (!selectedReferral) return;
    
    try {
      await shareReferralLink(
        platform,
        `https://commonly-platform.web.app/r/${selectedReferral.code}`,
        'Check out this event!'
      );
    } catch (error) {
      console.error('Error sharing referral link:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to share your referral link',
      });
    }
  };

  return {
    referrals,
    wallet,
    loading,
    creating,
    selectedReferral,
    setSelectedReferral,
    handleCreateReferral,
    handleShareToSocial,
  };
};
