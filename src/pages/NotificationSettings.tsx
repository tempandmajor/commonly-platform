
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NotificationSettings as NotificationSettingsType } from "@/types/notification";

const NotificationSettings = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<NotificationSettingsType>({
    userId: currentUser?.uid || '',
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true,
    marketingEmails: true,
    updatedAt: new Date().toISOString()
  });

  const fetchSettings = async () => {
    if (currentUser) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', currentUser.uid)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setFormData({
            userId: data.user_id,
            emailNotifications: data.email_notifications,
            pushNotifications: data.push_notifications,
            inAppNotifications: data.in_app_notifications,
            marketingEmails: data.marketing_emails,
            updatedAt: data.updated_at
          });
        }
      } catch (error) {
        console.error("Error fetching notification settings:", error);
        toast({
          title: "Error",
          description: "Failed to load notification settings.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (currentUser) {
        const { data, error } = await supabase
          .from('notification_settings')
          .update({
            email_notifications: formData.emailNotifications,
            push_notifications: formData.pushNotifications,
            in_app_notifications: formData.inAppNotifications,
            marketing_emails: formData.marketingEmails,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', currentUser.uid)
          .select();
          
        if (error) throw error;
        
        toast({
          title: "Settings updated",
          description: "Your notification preferences have been saved.",
        });
        setIsSaving(false);
      }
    } catch (error) {
      console.error("Error updating notification settings:", error);
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      });
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [currentUser]);

  const handleChange = (key: keyof NotificationSettingsType, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div>
      <div className="space-y-0.5">
        <h2 className="text-2xl font-semibold tracking-tight">
          Notification Preferences
        </h2>
        <p className="text-muted-foreground">
          Manage how you receive notifications.
        </p>
      </div>
      
      <form onSubmit={handleUpdateSettings} className="space-y-6 mt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <Label className="text-base" htmlFor="emailNotifications">
                Email Notifications
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Receive email notifications about important updates.
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={formData.emailNotifications}
              onCheckedChange={(checked) =>
                handleChange("emailNotifications", checked)
              }
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <Label className="text-base" htmlFor="pushNotifications">
                Push Notifications
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Receive push notifications on your devices.
              </p>
            </div>
            <Switch
              id="pushNotifications"
              checked={formData.pushNotifications}
              onCheckedChange={(checked) =>
                handleChange("pushNotifications", checked)
              }
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <Label className="text-base" htmlFor="inAppNotifications">
                In-App Notifications
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                See notifications within the app.
              </p>
            </div>
            <Switch
              id="inAppNotifications"
              checked={formData.inAppNotifications}
              onCheckedChange={(checked) =>
                handleChange("inAppNotifications", checked)
              }
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <Label className="text-base" htmlFor="marketingEmails">
                Marketing Emails
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Receive promotional emails and offers.
              </p>
            </div>
            <Switch
              id="marketingEmails"
              checked={formData.marketingEmails}
              onCheckedChange={(checked) =>
                handleChange("marketingEmails", checked)
              }
            />
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" disabled={isSaving || isLoading}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NotificationSettings;
