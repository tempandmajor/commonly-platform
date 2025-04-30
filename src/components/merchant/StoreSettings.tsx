
import React, { useState, useEffect } from "react";
import { StoreDetailsForm } from "./settings/StoreDetailsForm";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "./common/LoadingSpinner";

interface StoreSettingsProps {
  userId: string;
  storeId: string;
}

export interface StoreSettings {
  id: string;
  name: string;
  description: string | null;
  contact_email: string | null;
  phone_number: string | null;
  address: string | null;
  is_public: boolean;
  owner_id: string;
}

const StoreSettings: React.FC<StoreSettingsProps> = ({ userId, storeId }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        setLoading(true);
        
        // Using mock data since the 'merchant_stores' table doesn't exist in our Supabase database
        setTimeout(() => {
          // Mock store data
          const mockStoreData: StoreSettings = {
            id: storeId,
            name: "My Awesome Store",
            description: "This store sells high-quality products.",
            contact_email: "contact@mystore.com",
            phone_number: "+1 (555) 123-4567",
            address: "123 Main St, City, Country",
            is_public: true,
            owner_id: userId
          };
          
          // Only allow owner to edit
          if (mockStoreData.owner_id !== userId) {
            toast({
              title: "Access Denied",
              description: "You do not have permission to edit this store",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          
          setStoreSettings(mockStoreData);
          setLoading(false);
        }, 800);
        
      } catch (error) {
        console.error("Error fetching store settings:", error);
        toast({
          title: "Error",
          description: "Failed to load store settings",
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    
    if (storeId && userId) {
      fetchStoreSettings();
    }
  }, [storeId, userId, toast]);

  const handleSaveSettings = async (values: any) => {
    try {
      // Simulate saving data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Updated",
        description: "Your store settings have been updated",
      });

      // Update local state with new values
      if (storeSettings) {
        setStoreSettings({
          ...storeSettings,
          name: values.storeName,
          description: values.storeDescription,
          contact_email: values.contactEmail,
          phone_number: values.phoneNumber,
          address: values.address,
          is_public: values.isPublic
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error updating store settings:", error);
      toast({
        title: "Error",
        description: "Failed to update store settings",
        variant: "destructive",
      });
      return false;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!storeSettings) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-muted-foreground">Failed to load store settings</p>
      </div>
    );
  }

  return (
    <StoreDetailsForm 
      storeSettings={storeSettings} 
      onSubmit={handleSaveSettings} 
    />
  );
};

export default StoreSettings;
