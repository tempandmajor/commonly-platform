
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReferrals } from '@/hooks/useReferrals';
import { ReferralsTab } from './referrals/ReferralsTab';
import { WalletTab } from './referrals/WalletTab';

interface ReferralsDashboardProps {
  eventId?: string;
}

const ReferralsDashboard = ({ eventId }: ReferralsDashboardProps) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('referrals');
  
  const {
    referrals,
    wallet,
    loading,
    creating,
    selectedReferral,
    setSelectedReferral,
    handleCreateReferral,
    handleShareToSocial,
  } = useReferrals(currentUser, eventId);

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please log in to view your referrals
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Referrals & Earnings</CardTitle>
        <CardDescription>
          Track your referrals and earnings from sharing events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
          </TabsList>
          
          <TabsContent value="referrals">
            <ReferralsTab
              eventId={eventId}
              referrals={referrals}
              creating={creating}
              selectedReferral={selectedReferral}
              setSelectedReferral={setSelectedReferral}
              handleCreateReferral={handleCreateReferral}
              handleShareToSocial={handleShareToSocial}
            />
          </TabsContent>
          
          <TabsContent value="wallet">
            <WalletTab wallet={wallet} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReferralsDashboard;
