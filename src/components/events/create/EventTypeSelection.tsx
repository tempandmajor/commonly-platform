
import React from 'react';
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventTypeSelectionProps {
  form: any;
}

export const EventTypeSelection = ({ form }: EventTypeSelectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Type</CardTitle>
        <CardDescription>Choose the type of event you're creating</CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="eventType"
          render={({ field }) => (
            <FormItem>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={cn(
                    "border rounded-md p-4 cursor-pointer hover:border-primary transition-colors",
                    field.value === "single" ? "border-primary bg-primary/5" : "border-input"
                  )}
                  onClick={() => field.onChange("single")}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Single Event</h3>
                    {field.value === "single" && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    One-time event on a specific date
                  </p>
                </div>
                
                <div
                  className={cn(
                    "border rounded-md p-4 cursor-pointer hover:border-primary transition-colors",
                    field.value === "multi" ? "border-primary bg-primary/5" : "border-input"
                  )}
                  onClick={() => field.onChange("multi")}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Multi-Day Event</h3>
                    {field.value === "multi" && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Event spanning multiple consecutive days
                  </p>
                </div>
                
                <div
                  className={cn(
                    "border rounded-md p-4 cursor-pointer hover:border-primary transition-colors",
                    field.value === "tour" ? "border-primary bg-primary/5" : "border-input"
                  )}
                  onClick={() => field.onChange("tour")}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Tour</h3>
                    {field.value === "tour" && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Multiple events in different locations
                  </p>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
