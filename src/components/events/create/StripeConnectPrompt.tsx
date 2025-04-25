
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface StripeConnectPromptProps {
  onConnect: () => void;
}

export const StripeConnectPrompt = ({ onConnect }: StripeConnectPromptProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Stripe Account</CardTitle>
        <CardDescription>
          To create and receive payments for events, you need to connect a Stripe account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Stripe Connect Required</AlertTitle>
          <AlertDescription>
            Before creating events, you need to verify your identity and connect a Stripe account to receive payments.
            This helps ensure that all event organizers on Commonly are verified and can receive payments securely.
          </AlertDescription>
        </Alert>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium">What happens when you connect Stripe?</h4>
          <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
            <li>Verify your identity through Stripe Identity</li>
            <li>Set up a payment account to receive funds from ticket sales</li>
            <li>Enable secure payments for your events</li>
            <li>Receive payouts to your bank account</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onConnect} className="w-full">
          Connect with Stripe
        </Button>
      </CardFooter>
    </Card>
  );
};
