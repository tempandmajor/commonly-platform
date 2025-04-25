
import React from 'react';
import { MenuCategory } from '@/types/caterer';
import { formatCurrency } from '@/lib/utils';

interface MenuTabProps {
  menuCategories: MenuCategory[];
  currency: string;
}

export const MenuTab = ({ menuCategories, currency }: MenuTabProps) => {
  return (
    <div className="space-y-6">
      {menuCategories.length > 0 ? (
        menuCategories.map(category => (
          <div key={category.id} className="space-y-4">
            <h3 className="text-xl font-semibold">{category.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.items.map(item => (
                <div key={item.id} className="border rounded-lg overflow-hidden flex">
                  {item.photoUrl && (
                    <div className="w-24 h-24 flex-shrink-0">
                      <img 
                        src={item.photoUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-3 flex-grow">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{item.name}</h4>
                      <span className="font-semibold">{formatCurrency(item.price, currency)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.dietaryOptions.map((option, index) => (
                        <span key={index} className="text-xs bg-secondary/50 px-2 py-0.5 rounded-full">
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No menu items available</p>
        </div>
      )}
    </div>
  );
};
