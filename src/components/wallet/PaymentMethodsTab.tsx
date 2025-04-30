
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Loader2, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentMethod {
  id: string;
  userId: string;
  type: string;
  brand?: string;
  last4: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  createdAt: string;
}

const PaymentMethodsTab: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!currentUser?.uid) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', currentUser.uid)
          .order('is_default', { ascending: false });
        
        if (error) throw error;
        
        // Map the data to our interface structure
        const paymentMethodsList = data.map(pm => ({
          id: pm.id,
          userId: pm.user_id,
          type: pm.type,
          brand: pm.brand,
          last4: pm.last4,
          expMonth: pm.exp_month,
          expYear: pm.exp_year,
          isDefault: pm.is_default,
          createdAt: pm.created_at
        }));
        
        setPaymentMethods(paymentMethodsList);
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        toast({
          title: "Error",
          description: "Failed to load payment methods",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [currentUser, toast]);

  const handleSetDefaultMethod = async (id: string) => {
    if (!currentUser?.uid) return;
    
    try {
      setProcessingId(id);
      
      // First, set all payment methods to non-default
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', currentUser.uid);
        
      // Then set the selected one as default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', currentUser.uid);
      
      if (error) throw error;
      
      // Update local state
      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          isDefault: method.id === id
        }))
      );
      
      toast({
        title: "Success",
        description: "Default payment method updated",
      });
    } catch (error) {
      console.error("Error setting default payment method:", error);
      toast({
        title: "Error",
        description: "Failed to update default payment method",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveMethod = async (id: string) => {
    if (!currentUser?.uid) return;
    
    try {
      setProcessingId(id);
      
      // Check if this is the default method
      const isDefault = paymentMethods.find(method => method.id === id)?.isDefault;
      
      if (isDefault && paymentMethods.length > 1) {
        toast({
          title: "Error",
          description: "Please set another method as default before removing this one",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.uid);
      
      if (error) throw error;
      
      // Update local state
      setPaymentMethods(prev => prev.filter(method => method.id !== id));
      
      toast({
        title: "Success",
        description: "Payment method removed",
      });
    } catch (error) {
      console.error("Error removing payment method:", error);
      toast({
        title: "Error",
        description: "Failed to remove payment method",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddPaymentMethod = () => {
    // Implementation will use Stripe Elements or similar
    toast({
      title: "Coming Soon",
      description: "Payment method addition functionality will be available soon",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Payment Methods</h2>
        <Button onClick={handleAddPaymentMethod}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {paymentMethods.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <CreditCard className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              No payment methods found
            </p>
            <Button onClick={handleAddPaymentMethod}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {paymentMethods.map((method) => (
            <Card key={method.id} className={method.isDefault ? "border-primary" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    <CardTitle className="text-lg">
                      {method.brand || "Card"} •••• {method.last4}
                    </CardTitle>
                  </div>
                  {method.isDefault && (
                    <Badge variant="outline" className="ml-2 bg-primary/10">
                      Default
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Expires: {method.expMonth?.toString().padStart(2, "0")}/{method.expYear?.toString().slice(-2)}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-1">
                <div className="flex space-x-2">
                  {!method.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefaultMethod(method.id)}
                      disabled={!!processingId}
                    >
                      {processingId === method.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMethod(method.id)}
                    disabled={!!processingId}
                  >
                    {processingId === method.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 mr-2" />
                    )}
                    Remove
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsTab;
