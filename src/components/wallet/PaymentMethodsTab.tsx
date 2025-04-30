
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PaymentMethod } from "@/types/merchant";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import PaymentMethodCard from "./payment/PaymentMethodCard";
import EmptyPaymentMethods from "./payment/EmptyPaymentMethods";

// Mock data helper function
const generateMockPaymentMethods = (userId: string): PaymentMethod[] => {
  return [
    {
      id: "pm_1",
      userId: userId,
      type: "card",
      brand: "Visa",
      last4: "4242",
      expMonth: 12,
      expYear: 2025,
      isDefault: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "pm_2",
      userId: userId,
      type: "card",
      brand: "Mastercard",
      last4: "5555",
      expMonth: 10,
      expYear: 2024,
      isDefault: false,
      createdAt: new Date().toISOString()
    }
  ];
};

interface PaymentMethodsTabProps {
  paymentMethods: PaymentMethod[];
  refreshPaymentMethods: () => Promise<void>;
  hasStripeConnect: boolean;
  onConnectAccount: () => Promise<void>;
  connectAccountLoading: boolean;
}

const PaymentMethodsTab: React.FC<PaymentMethodsTabProps> = ({
  paymentMethods,
  refreshPaymentMethods,
  hasStripeConnect,
  onConnectAccount,
  connectAccountLoading
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const handleSetDefaultMethod = async (id: string) => {
    if (!currentUser?.uid) return;
    
    try {
      setProcessingId(id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      // This would be handled by the parent component through refreshPaymentMethods
      
      toast({
        title: "Success",
        description: "Default payment method updated",
      });
      
      await refreshPaymentMethods();
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
        setProcessingId(null);
        return;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This would be handled by the parent component through refreshPaymentMethods
      
      toast({
        title: "Success",
        description: "Payment method removed",
      });
      
      await refreshPaymentMethods();
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
    return <LoadingSpinner />;
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
        <EmptyPaymentMethods onAddPaymentMethod={handleAddPaymentMethod} />
      ) : (
        <div className="grid gap-4">
          {paymentMethods.map((method) => (
            <PaymentMethodCard 
              key={method.id}
              paymentMethod={method}
              onSetDefault={handleSetDefaultMethod}
              onRemove={handleRemoveMethod}
              isProcessing={!!processingId}
              processingId={processingId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsTab;
