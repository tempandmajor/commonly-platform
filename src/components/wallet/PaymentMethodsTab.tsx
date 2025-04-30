
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CreditCard, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PaymentMethod } from "@/types/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const PaymentMethodsTab = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);

  // Form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchPaymentMethods();
    }
  }, [currentUser]);

  const fetchPaymentMethods = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", currentUser.uid);

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load payment methods",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setIsSaving(true);

      // Normally you'd integrate with a payment processor like Stripe here
      // This is just a mock implementation
      const newPaymentMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        userId: currentUser.uid,
        type: "card",
        last4: cardNumber.slice(-4),
        expMonth: parseInt(expMonth),
        expYear: parseInt(expYear),
        isDefault: paymentMethods.length === 0, // First card is default
        createdAt: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("payment_methods")
        .insert([
          {
            id: newPaymentMethod.id,
            user_id: newPaymentMethod.userId,
            type: newPaymentMethod.type,
            last4: newPaymentMethod.last4,
            exp_month: newPaymentMethod.expMonth,
            exp_year: newPaymentMethod.expYear,
            is_default: newPaymentMethod.isDefault,
            created_at: newPaymentMethod.createdAt,
          },
        ]);

      if (error) throw error;

      setPaymentMethods([...paymentMethods, newPaymentMethod]);
      setIsAddCardOpen(false);
      resetForm();
      toast({
        title: "Payment Method Added",
        description: "Your card has been saved",
      });
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add payment method",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePaymentMethod = async () => {
    if (!methodToDelete) return;

    try {
      const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", methodToDelete);

      if (error) throw error;

      setPaymentMethods(paymentMethods.filter((pm) => pm.id !== methodToDelete));
      setDeleteConfirmOpen(false);
      setMethodToDelete(null);
      toast({
        title: "Payment Method Removed",
        description: "Your payment method has been deleted",
      });
    } catch (error) {
      console.error("Error deleting payment method:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove payment method",
      });
    }
  };

  const handleMakeDefault = async (methodId: string) => {
    try {
      // First, set all payment methods to non-default
      await supabase
        .from("payment_methods")
        .update({ is_default: false })
        .eq("user_id", currentUser?.uid);

      // Then set the selected one to default
      await supabase
        .from("payment_methods")
        .update({ is_default: true })
        .eq("id", methodId);

      // Update local state
      const updatedMethods = paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === methodId,
      }));

      setPaymentMethods(updatedMethods);
      toast({
        title: "Default Payment Method Updated",
        description: "Your default payment method has been changed",
      });
    } catch (error) {
      console.error("Error updating default payment method:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update default payment method",
      });
    }
  };

  const resetForm = () => {
    setCardNumber("");
    setCardName("");
    setExpMonth("");
    setExpYear("");
    setCvv("");
  };

  const formatCardNumber = (input: string) => {
    return input
      .replace(/\s/g, "")
      .replace(/\D/g, "")
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim()
      .slice(0, 19);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Manage your saved payment methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-1">No Payment Methods</h3>
              <p className="text-sm text-gray-500 mb-4">
                You haven't added any payment methods yet
              </p>
              <Button onClick={() => setIsAddCardOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" /> Add Payment Method
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-14 bg-gray-100 rounded flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {method.type === "card" ? "•••• " + method.last4 : "Payment Method"}
                        </p>
                        {method.expMonth && method.expYear && (
                          <p className="text-sm text-gray-500">
                            Expires {method.expMonth.toString().padStart(2, '0')}/{method.expYear % 100}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {method.isDefault ? (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          Default
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMakeDefault(method.id)}
                        >
                          Set as default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setMethodToDelete(method.id);
                          setDeleteConfirmOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setIsAddCardOpen(true)}
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Add Another Payment Method
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Card Dialog */}
      <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a new credit or debit card to your account
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCard}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cardName">Name on Card</Label>
                <Input
                  id="cardName"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(formatCardNumber(e.target.value))
                  }
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expMonth">Month</Label>
                  <Input
                    id="expMonth"
                    value={expMonth}
                    onChange={(e) =>
                      setExpMonth(e.target.value.replace(/\D/g, "").slice(0, 2))
                    }
                    placeholder="MM"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expYear">Year</Label>
                  <Input
                    id="expYear"
                    value={expYear}
                    onChange={(e) =>
                      setExpYear(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="YYYY"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                    }
                    placeholder="123"
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddCardOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Card"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment Method</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment method? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setMethodToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePaymentMethod}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentMethodsTab;
