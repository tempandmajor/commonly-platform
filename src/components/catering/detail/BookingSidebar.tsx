
import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { CatererPricing } from '@/types/caterer';
import { formatCurrency } from '@/lib/utils';

interface BookingSidebarProps {
  pricing: CatererPricing;
  minGuests: number;
  maxGuests: number;
}

export const BookingSidebar = ({ pricing, minGuests, maxGuests }: BookingSidebarProps) => {
  return (
    <div className="bg-white rounded-xl border p-6 sticky top-8">
      <div className="flex justify-between items-baseline mb-6">
        <div>
          <span className="text-2xl font-bold">
            {formatCurrency(pricing.minimumOrderAmount)}
          </span>
          <span className="text-muted-foreground"> min. order</span>
        </div>
      </div>
      
      {/* Service Types */}
      <div className="space-y-4 mb-6">
        <h3 className="font-medium">Available Services</h3>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(pricing.serviceTypes).map(([key, available]) => {
            if (!available) return null;
            
            const serviceNames: Record<string, string> = {
              pickup: 'Pickup',
              delivery: 'Delivery',
              fullService: 'Full Service'
            };
            
            return (
              <div 
                key={key}
                className="flex flex-col items-center p-2 border rounded-md text-center"
              >
                <span className="text-xs text-muted-foreground">{serviceNames[key]}</span>
                <span className="text-lg">✓</span>
              </div>
            );
          })}
        </div>
        
        {/* Fee Breakdown */}
        <div className="text-sm space-y-1 border-t pt-4 mt-4">
          <p className="flex justify-between">
            <span>Minimum order</span>
            <span>{formatCurrency(pricing.minimumOrderAmount)}</span>
          </p>
          {pricing.deliveryFee && (
            <p className="flex justify-between">
              <span>Delivery fee</span>
              <span>{formatCurrency(pricing.deliveryFee)}</span>
            </p>
          )}
          <p className="flex justify-between text-xs text-muted-foreground">
            <span>Commonly service fee (5%)</span>
            <span>Added at checkout</span>
          </p>
        </div>
        
        {/* Guest Count Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Guest Count</span>
            <span>50 guests</span>
          </div>
          <Slider
            defaultValue={[50]}
            min={minGuests}
            max={maxGuests}
            step={5}
            className="mb-3"
          />
        </div>
      </div>
      
      <Button className="w-full mb-3">
        <Calendar className="h-4 w-4 mr-2" />
        Book Now
      </Button>
      
      <p className="text-center text-xs text-muted-foreground">
        You won't be charged yet
      </p>
    </div>
  );
};
