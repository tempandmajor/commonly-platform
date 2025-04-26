
import React, { useState } from 'react';
import { doc, setDoc, Timestamp, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
  type: z.enum(['individual', 'campaign']),
  email: z.string().email().optional().or(z.literal('')),
  amount: z.coerce.number().min(1, 'Amount must be at least 1').max(10000, 'Amount cannot exceed 10,000'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  code: z.string().optional(),
  expiryDate: z.date().optional(),
  requireNewSignup: z.boolean().default(false),
  requireEventCreation: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const Credits = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("distribute");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'individual',
      email: '',
      amount: 100,
      description: '',
      code: '',
      expiryDate: undefined,
      requireNewSignup: false,
      requireEventCreation: false,
    },
  });
  
  const creditType = form.watch('type');

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      if (data.type === 'individual') {
        if (!data.email) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Email is required for individual credits"
          });
          setIsSubmitting(false);
          return;
        }
        
        // Check if user exists
        const userQuery = query(
          collection(db, 'users'),
          where('email', '==', data.email)
        );
        
        const userSnapshot = await getDocs(userQuery);
        
        if (userSnapshot.empty) {
          toast({
            variant: "destructive",
            title: "User not found",
            description: "No user exists with this email address"
          });
          setIsSubmitting(false);
          return;
        }
        
        const userId = userSnapshot.docs[0].id;
        
        // Add credits to user's wallet
        await addDoc(collection(db, 'transactions'), {
          userId,
          amount: data.amount,
          type: 'credit',
          status: 'completed',
          description: data.description,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        
        // Update user's wallet balance
        const userDoc = userSnapshot.docs[0].data();
        const wallet = userDoc.wallet || {};
        
        await setDoc(doc(db, 'users', userId), {
          ...userDoc,
          wallet: {
            ...wallet,
            platformCredits: (wallet.platformCredits || 0) + data.amount,
            updatedAt: Timestamp.now(),
          }
        }, { merge: true });
        
      } else {
        // Create campaign
        await addDoc(collection(db, 'creditsCampaigns'), {
          amount: data.amount,
          description: data.description,
          code: data.code || null,
          expiryDate: data.expiryDate || null,
          requireNewSignup: data.requireNewSignup,
          requireEventCreation: data.requireEventCreation,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          active: true,
        });
      }
      
      toast({
        title: "Success",
        description: data.type === 'individual' 
          ? `${data.amount} credits added to ${data.email}` 
          : "Credit campaign created successfully"
      });
      
      form.reset();
      
    } catch (error) {
      console.error("Error distributing credits:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to distribute credits"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Credits</h1>
        <p className="text-gray-500">
          Manage and distribute platform credits to users or create credit campaigns
        </p>
      </div>
      
      <Tabs defaultValue="distribute" onValueChange={setActiveTab} value={activeTab}>
        <TabsList>
          <TabsTrigger value="distribute">Distribute Credits</TabsTrigger>
          <TabsTrigger value="history">Distribution History</TabsTrigger>
          <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="distribute">
          <Card>
            <CardHeader>
              <CardTitle>Distribute Credits</CardTitle>
              <CardDescription>
                Give credits to individual users or create credit campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credit Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select credit type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="individual">Individual User</SelectItem>
                            <SelectItem value="campaign">Credit Campaign</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose whether to give credits to an individual user or create a credit campaign
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  {creditType === 'individual' && (
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User Email</FormLabel>
                          <FormControl>
                            <Input placeholder="user@example.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter the email address of the user to receive credits
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credit Amount</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormDescription>
                          The amount of credits to distribute
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Reason for distributing these credits" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          This will be visible in the user's transaction history
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {creditType === 'campaign' && (
                    <>
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign Code (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="SUMMER2023" {...field} />
                            </FormControl>
                            <FormDescription>
                              Optional code that users can enter to claim credits
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Expiry Date (Optional)</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date()
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              Date when the campaign will expire
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="requireNewSignup"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Require New Signup
                                </FormLabel>
                                <FormDescription>
                                  Only available for new users
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
                        
                        <FormField
                          control={form.control}
                          name="requireEventCreation"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Require Event Creation
                                </FormLabel>
                                <FormDescription>
                                  Only awarded after creating an event
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
                      </div>
                    </>
                  )}
                  
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {creditType === 'individual' ? 'Distribute Credits' : 'Create Campaign'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Distribution History</CardTitle>
              <CardDescription>
                Record of all credit distributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">
                Credit distribution history will appear here
              </p>
              {/* We would fetch and display history here */}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>
                Currently active credit campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">
                Active credit campaigns will appear here
              </p>
              {/* We would fetch and display campaigns here */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Credits;
