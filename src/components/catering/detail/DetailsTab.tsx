
import React from 'react';
import { Clock, FileText } from 'lucide-react';
import { CateringService, CatererAvailability } from '@/types/caterer';
import { formatCurrency } from '@/lib/utils';

interface DetailsTabProps {
  description: string;
  services: CateringService[];
  specialties: string[];
  availability: CatererAvailability[];
  currency: string;
}

export const DetailsTab = ({ 
  description, 
  services, 
  specialties, 
  availability,
  currency 
}: DetailsTabProps) => {
  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Description
        </h2>
        <p className="text-muted-foreground whitespace-pre-line">
          {description}
        </p>
      </div>
      
      {/* Services */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Services Offered</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map(service => (
            <div key={service.id} className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-1">{service.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Price per guest:</span>
                  <span className="font-medium">{formatCurrency(service.pricePerGuest, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guest capacity:</span>
                  <span>{service.minGuests} - {service.maxGuests}</span>
                </div>
                {service.setupFee && (
                  <div className="flex justify-between">
                    <span>Setup fee:</span>
                    <span>{formatCurrency(service.setupFee, currency)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Specialties */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Specialties</h2>
        <div className="flex flex-wrap gap-2">
          {specialties.map((specialty, index) => (
            <span 
              key={index}
              className="bg-primary/10 text-primary rounded-full px-3 py-1"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>
      
      {/* Availability */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Availability
        </h2>
        <div className="space-y-1 text-sm">
          {availability.length > 0 ? 
            availability.map((slot, index) => {
              const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              return (
                <p key={index} className="flex justify-between py-1 border-b">
                  <span className="font-medium">{days[slot.dayOfWeek]}</span>
                  <span>{slot.startTime} - {slot.endTime}</span>
                </p>
              );
            }) : 
            <p className="text-muted-foreground">Contact caterer for availability</p>
          }
        </div>
      </div>
    </div>
  );
};
