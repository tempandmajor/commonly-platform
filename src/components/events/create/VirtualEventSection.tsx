
import React from 'react';
import { FormField, FormControl, FormLabel, FormItem, FormDescription } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';

interface VirtualEventSectionProps {
  isVirtual: boolean;
}

export const VirtualEventSection = ({ isVirtual }: VirtualEventSectionProps) => {
  const form = useFormContext();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Virtual Event Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure settings for virtual events hosted via live streaming
        </p>
      </div>
      
      <Separator />
      
      <FormField
        control={form.control}
        name="isVirtual"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Virtual Event</FormLabel>
              <FormDescription>
                Enable to host this event virtually with live streaming
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

      {isVirtual && (
        <>
          <FormField
            control={form.control}
            name="eventDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Duration (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Duration in minutes"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  The expected duration of your virtual event stream
                </FormDescription>
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  );
};
