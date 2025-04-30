
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const storeFormSchema = z.object({
  storeName: z.string().min(2, {
    message: "Store name must be at least 2 characters.",
  }),
  storeDescription: z.string().optional(),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  isPublic: z.boolean().default(true),
});

interface StoreSettingsProps {
  userId: string;
  storeId: string;
}

interface StoreSettings {
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
  const [saving, setSaving] = useState<boolean>(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof storeFormSchema>>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      storeName: "",
      storeDescription: "",
      contactEmail: "",
      phoneNumber: "",
      address: "",
      isPublic: true,
    },
  });

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        setLoading(true);
        
        // Since the 'merchant_stores' table doesn't exist in our Supabase database,
        // we'll use mock data instead
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
          
          form.reset({
            storeName: mockStoreData.name || "",
            storeDescription: mockStoreData.description || "",
            contactEmail: mockStoreData.contact_email || "",
            phoneNumber: mockStoreData.phone_number || "",
            address: mockStoreData.address || "",
            isPublic: mockStoreData.is_public,
          });
          
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
  }, [storeId, userId, toast, form]);

  const onSubmit = async (values: z.infer<typeof storeFormSchema>) => {
    try {
      setSaving(true);
      
      // Simulate saving data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Updated",
        description: "Your store settings have been updated",
      });
    } catch (error) {
      console.error("Error updating store settings:", error);
      toast({
        title: "Error",
        description: "Failed to update store settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Store Details</CardTitle>
            <CardDescription>
              Update your store information and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="storeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Store" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="storeDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your store..." 
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, City, Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Store Visibility</FormLabel>
                    <CardDescription>
                      Make your store visible to everyone
                    </CardDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default StoreSettings;
