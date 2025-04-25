
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, Copy, Facebook, Linkedin, Twitter } from 'lucide-react';
import { getUserReferrals, getUserWallet, createReferralLink, shareReferralLink } from '@/services/sponsorshipService';
import { Referral, UserWallet } from '@/types/event';
import { toast } from '@/hooks/use-toast';

interface ReferralsDashboardProps {
  eventId?: string;
}

const ReferralsDashboard = ({ eventId }: ReferralsDashboardProps) => {
  const { currentUser } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [activeTab, setActiveTab] = useState('referrals');

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
      const referralLink = await createReferralLink(currentUser.uid, eventId);
      
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Referral link copied to clipboard',
    });
  };

  const handleShareToSocial = async (platform: 'facebook' | 'twitter' | 'linkedin') => {
    if (!selectedReferral) return;
    
    try {
      await shareReferralLink(
        platform,
        `https://commonly-platform.web.app/r/${selectedReferral.code}`,
        'Check out this event!' // You'd want to get the actual event title
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
          
          <TabsContent value="referrals" className="space-y-4 pt-4">
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
          </TabsContent>
          
          <TabsContent value="wallet" className="space-y-4 pt-4">
            {wallet ? (
              <div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 border rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                    <p className="font-bold text-xl">${wallet.totalEarnings.toFixed(2)}</p>
                  </div>
                  <div className="p-4 border rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="font-bold text-xl">${wallet.availableBalance.toFixed(2)}</p>
                  </div>
                  <div className="p-4 border rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="font-bold text-xl">${wallet.pendingBalance.toFixed(2)}</p>
                  </div>
                </div>
                
                <h3 className="font-medium mb-2">Transaction History</h3>
                {wallet.transactions.length > 0 ? (
                  <div className="space-y-3">
                    {wallet.transactions.map((transaction) => (
                      <div key={transaction.id} className="p-3 border rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${transaction.type === 'withdrawal' ? 'text-destructive' : 'text-green-600'}`}>
                              {transaction.type === 'withdrawal' ? '-' : '+'}${transaction.amount.toFixed(2)}
                            </p>
                            <p className="text-xs capitalize bg-gray-100 px-2 py-0.5 rounded-full inline-block">
                              {transaction.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-muted-foreground">
                    No transactions yet
                  </p>
                )}
                
                <div className="mt-6 text-center">
                  <Button disabled={wallet.availableBalance <= 0}>Withdraw Funds</Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Your wallet hasn't been created yet. Start earning with referrals!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReferralsDashboard;
