
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  getNotificationSettings, 
  updateNotificationSettings, 
  getDefaultNotificationSettings 
} from "@/services/notificationService";
import { NotificationSettings as NotificationSettingsType } from "@/types/auth";
import { Loader2 } from "lucide-react";

const NotificationSettings = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettingsType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchSettings = async () => {
      if (!currentUser?.uid) return;
      
      setLoading(true);
      try {
        const userSettings = await getNotificationSettings(currentUser.uid);
        setSettings(userSettings || getDefaultNotificationSettings());
      } catch (error) {
        console.error("Error fetching notification settings:", error);
        toast({
          title: "Error",
          description: "Failed to load notification settings",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [currentUser, toast]);
  
  const handleSaveSettings = async () => {
    if (!currentUser?.uid || !settings) return;
    
    setSaving(true);
    try {
      await updateNotificationSettings(currentUser.uid, settings);
      toast({
        title: "Success",
        description: "Notification settings updated"
      });
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleToggle = (
    category: keyof NotificationSettingsType,
    setting: string,
    value: boolean
  ) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: value
      }
    });
  };
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Manage Notifications</CardTitle>
              <CardDescription>
                Choose how and when you would like to be notified
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="push" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="push">Push</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="inApp">In-App</TabsTrigger>
                </TabsList>
                
                <TabsContent value="push">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-event-updates" className="font-medium">
                          Event Updates
                        </Label>
                        <p className="text-sm text-gray-500">
                          Get notified about changes to events you follow
                        </p>
                      </div>
                      <Switch
                        id="push-event-updates"
                        checked={settings?.push.eventUpdates}
                        onCheckedChange={(value) => handleToggle('push', 'eventUpdates', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-new-followers" className="font-medium">
                          New Followers
                        </Label>
                        <p className="text-sm text-gray-500">
                          Get notified when someone follows you
                        </p>
                      </div>
                      <Switch
                        id="push-new-followers"
                        checked={settings?.push.newFollowers}
                        onCheckedChange={(value) => handleToggle('push', 'newFollowers', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-messages" className="font-medium">
                          Messages
                        </Label>
                        <p className="text-sm text-gray-500">
                          Get notified when you receive new messages
                        </p>
                      </div>
                      <Switch
                        id="push-messages"
                        checked={settings?.push.messages}
                        onCheckedChange={(value) => handleToggle('push', 'messages', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-earnings" className="font-medium">
                          Earnings
                        </Label>
                        <p className="text-sm text-gray-500">
                          Get notified about referral earnings and payouts
                        </p>
                      </div>
                      <Switch
                        id="push-earnings"
                        checked={settings?.push.earnings}
                        onCheckedChange={(value) => handleToggle('push', 'earnings', value)}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="email">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-event-updates" className="font-medium">
                          Event Updates
                        </Label>
                        <p className="text-sm text-gray-500">
                          Receive email notifications about events you follow
                        </p>
                      </div>
                      <Switch
                        id="email-event-updates"
                        checked={settings?.email.eventUpdates}
                        onCheckedChange={(value) => handleToggle('email', 'eventUpdates', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-new-followers" className="font-medium">
                          New Followers
                        </Label>
                        <p className="text-sm text-gray-500">
                          Receive emails when someone follows you
                        </p>
                      </div>
                      <Switch
                        id="email-new-followers"
                        checked={settings?.email.newFollowers}
                        onCheckedChange={(value) => handleToggle('email', 'newFollowers', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-messages" className="font-medium">
                          Messages
                        </Label>
                        <p className="text-sm text-gray-500">
                          Receive emails about new messages
                        </p>
                      </div>
                      <Switch
                        id="email-messages"
                        checked={settings?.email.messages}
                        onCheckedChange={(value) => handleToggle('email', 'messages', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-earnings" className="font-medium">
                          Earnings
                        </Label>
                        <p className="text-sm text-gray-500">
                          Receive emails about referral earnings and payouts
                        </p>
                      </div>
                      <Switch
                        id="email-earnings"
                        checked={settings?.email.earnings}
                        onCheckedChange={(value) => handleToggle('email', 'earnings', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-marketing" className="font-medium">
                          Marketing
                        </Label>
                        <p className="text-sm text-gray-500">
                          Receive emails about new features and promotions
                        </p>
                      </div>
                      <Switch
                        id="email-marketing"
                        checked={settings?.email.marketing}
                        onCheckedChange={(value) => handleToggle('email', 'marketing', value)}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="inApp">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="inapp-event-updates" className="font-medium">
                          Event Updates
                        </Label>
                        <p className="text-sm text-gray-500">
                          Show in-app notifications for event updates
                        </p>
                      </div>
                      <Switch
                        id="inapp-event-updates"
                        checked={settings?.inApp.eventUpdates}
                        onCheckedChange={(value) => handleToggle('inApp', 'eventUpdates', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="inapp-new-followers" className="font-medium">
                          New Followers
                        </Label>
                        <p className="text-sm text-gray-500">
                          Show in-app notifications when someone follows you
                        </p>
                      </div>
                      <Switch
                        id="inapp-new-followers"
                        checked={settings?.inApp.newFollowers}
                        onCheckedChange={(value) => handleToggle('inApp', 'newFollowers', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="inapp-messages" className="font-medium">
                          Messages
                        </Label>
                        <p className="text-sm text-gray-500">
                          Show in-app notifications for new messages
                        </p>
                      </div>
                      <Switch
                        id="inapp-messages"
                        checked={settings?.inApp.messages}
                        onCheckedChange={(value) => handleToggle('inApp', 'messages', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="inapp-earnings" className="font-medium">
                          Earnings
                        </Label>
                        <p className="text-sm text-gray-500">
                          Show in-app notifications for referral earnings and payouts
                        </p>
                      </div>
                      <Switch
                        id="inapp-earnings"
                        checked={settings?.inApp.earnings}
                        onCheckedChange={(value) => handleToggle('inApp', 'earnings', value)}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handleSaveSettings} 
                  disabled={saving}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default NotificationSettings;
