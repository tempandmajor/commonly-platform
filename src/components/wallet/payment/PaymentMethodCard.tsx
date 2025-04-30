
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { PaymentMethod } from "@/types/merchant";

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onSetDefault: (id: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  isProcessing: boolean;
  processingId: string | null;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethod,
  onSetDefault,
  onRemove,
  isProcessing,
  processingId
}) => {
  const isCurrentlyProcessing = isProcessing && processingId === paymentMethod.id;
  
  return (
    <Card className={paymentMethod.isDefault ? "border-primary" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            <CardTitle className="text-lg">
              {paymentMethod.brand || "Card"} •••• {paymentMethod.last4}
            </CardTitle>
          </div>
          {paymentMethod.isDefault && (
            <Badge variant="outline" className="ml-2 bg-primary/10">
              Default
            </Badge>
          )}
        </div>
        <CardDescription>
          Expires: {paymentMethod.expMonth?.toString().padStart(2, "0")}/{paymentMethod.expYear?.toString().slice(-2)}
        </CardDescription>
      </CardHeader>
      <CardFooter className="pt-1">
        <div className="flex space-x-2">
          {!paymentMethod.isDefault && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetDefault(paymentMethod.id)}
              disabled={isProcessing}
            >
              {isCurrentlyProcessing ? (
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
            onClick={() => onRemove(paymentMethod.id)}
            disabled={isProcessing}
          >
            {isCurrentlyProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2" />
            )}
            Remove
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PaymentMethodCard;
