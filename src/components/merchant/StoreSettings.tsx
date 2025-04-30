
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
import { supabase } from "@/integrations/supabase/client";
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
        
        const { data, error } = await supabase
          .from('merchant_stores')
          .select('*')
          .eq('id', storeId)
          .single();
        
        if (error) throw error;
        
        // Only allow owner to edit
        if (data.owner_id !== userId) {
          toast({
            title: "Access Denied",
            description: "You do not have permission to edit this store",
            variant: "destructive",
          });
          return;
        }
        
        form.reset({
          storeName: data.name || "",
          storeDescription: data.description || "",
          contactEmail: data.contact_email || "",
          phoneNumber: data.phone_number || "",
          address: data.address || "",
          isPublic: data.is_public,
        });
      } catch (error) {
        console.error("Error fetching store settings:", error);
        toast({
          title: "Error",
          description: "Failed to load store settings",
          variant: "destructive",
        });
      } finally {
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
      
      const { error } = await supabase
        .from('merchant_stores')
        .update({
          name: values.storeName,
          description: values.storeDescription,
          contact_email: values.contactEmail,
          phone_number: values.phoneNumber,
          address: values.address,
          is_public: values.isPublic,
        })
        .eq('id', storeId);
      
      if (error) throw error;
      
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
                    <FormDescription>
                      Make your store visible to everyone
                    </FormDescription>
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
