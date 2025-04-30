
import React from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

interface EmptyPaymentMethodsProps {
  onAddPaymentMethod: () => void;
}

const EmptyPaymentMethods: React.FC<EmptyPaymentMethodsProps> = ({ 
  onAddPaymentMethod 
}) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-10">
        <CreditCard className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-center mb-4">
          No payment methods found
        </p>
        <Button onClick={onAddPaymentMethod}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyPaymentMethods;
