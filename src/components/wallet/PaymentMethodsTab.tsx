
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentMethod } from "@/types/auth";
import { Loader2, CreditCard, Plus, Bank, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string | null>(null);
  
  const handleDeleteClick = (id: string) => {
    setSelectedPaymentMethod(id);
    setDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (!selectedPaymentMethod) return;
    
    toast({
      title: "Payment method deleted",
      description: "Your payment method has been removed",
    });
    
    setDeleteDialogOpen(false);
    await refreshPaymentMethods();
  };
  
  const getCardIcon = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa': return '💳 Visa';
      case 'mastercard': return '💳 Mastercard';
      case 'amex': return '💳 Amex';
      case 'discover': return '💳 Discover';
      default: return '💳 Card';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Manage your payment and payout methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hasStripeConnect ? (
              <Card className="border-green-500">
                <CardContent className="pt-6 pb-6">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                      <Bank className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="font-medium">Stripe Connect Account</p>
                        <p className="text-sm text-muted-foreground">
                          Connected for payouts
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={onConnectAccount} disabled={connectAccountLoading}>
                      {connectAccountLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        "Manage"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 pb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-3 items-center">
                      <Bank className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">No Payout Method</p>
                        <p className="text-sm text-muted-foreground">
                          Connect Stripe to receive payments
                        </p>
                      </div>
                    </div>
                    <Button onClick={onConnectAccount} disabled={connectAccountLoading}>
                      {connectAccountLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Connect Stripe
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg">Saved Payment Methods</h3>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New
                </Button>
              </div>
              
              {paymentMethods.length === 0 ? (
                <div className="text-center p-8 border rounded-lg bg-muted/10">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <h4 className="text-lg font-medium">No Payment Methods</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add a payment method to make purchases easily
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Payment Method
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex gap-3 items-center">
                        {method.type === 'card' ? (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-primary" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bank className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        
                        <div>
                          <p className="font-medium">
                            {method.type === 'card' 
                              ? `${getCardIcon(method.brand)} •••• ${method.last4}` 
                              : `Bank Account •••• ${method.last4}`}
                          </p>
                          {method.type === 'card' && (
                            <p className="text-sm text-muted-foreground">
                              Expires {method.expiryMonth}/{method.expiryYear}
                            </p>
                          )}
                        </div>
                        
                        {method.isDefault && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full ml-3">
                            Default
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {!method.isDefault && (
                          <Button variant="outline" size="sm">
                            Set Default
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(method.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PaymentMethodsTab;
