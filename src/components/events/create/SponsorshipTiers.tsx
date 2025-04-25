import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlusCircle, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SponsorshipTier } from "@/types/event";

interface SponsorshipTiersProps {
  form: any;
}

export const SponsorshipTiers = ({ form }: SponsorshipTiersProps) => {
  const [tiers, setTiers] = useState<SponsorshipTier[]>([
    {
      name: "Bronze Sponsor",
      price: 500,
      benefits: ["Logo on event page", "Social media mention"],
      limitedSpots: 10
    }
  ]);
  
  const [newBenefit, setNewBenefit] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const addTier = () => {
    setTiers([
      ...tiers,
      {
        name: `Tier ${tiers.length + 1}`,
        price: 1000,
        benefits: ["TBD"],
        limitedSpots: 5
      }
    ]);
    setActiveIndex(tiers.length);
  };

  const removeTier = (index: number) => {
    const newTiers = [...tiers];
    newTiers.splice(index, 1);
    setTiers(newTiers);
    setActiveIndex(Math.min(activeIndex, newTiers.length - 1));
    
    // Update form value
    form.setValue("sponsorshipTiers", newTiers);
  };

  const updateTier = (index: number, field: string, value: any) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setTiers(newTiers);
    
    // Update form value
    form.setValue("sponsorshipTiers", newTiers);
  };

  const addBenefit = (index: number) => {
    if (!newBenefit.trim()) return;
    
    const newTiers = [...tiers];
    newTiers[index].benefits.push(newBenefit.trim());
    setTiers(newTiers);
    setNewBenefit("");
    
    // Update form value
    form.setValue("sponsorshipTiers", newTiers);
  };

  const removeBenefit = (tierIndex: number, benefitIndex: number) => {
    const newTiers = [...tiers];
    newTiers[tierIndex].benefits.splice(benefitIndex, 1);
    setTiers(newTiers);
    
    // Update form value
    form.setValue("sponsorshipTiers", newTiers);
  };

  // Set tiers in form when component mounts or tiers change
  React.useEffect(() => {
    form.setValue("sponsorshipTiers", tiers);
  }, [tiers, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sponsorship Tiers</CardTitle>
        <CardDescription>
          Create sponsorship tiers for your event. Sponsors will only be charged if your event reaches its pre-sale goal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="preSaleGoal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pre-sale Ticket Goal</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  placeholder="100"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Sponsors will only be charged if you sell this many tickets
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="referralPercentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referral Commission (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="15"
                  placeholder="5"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Percentage commission for successful referrals (1-15%)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-8">
          <div className="flex items-center space-x-2 mb-4">
            <h3 className="text-lg font-medium">Sponsorship Tiers</h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={addTier}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Tier
            </Button>
          </div>

          <div className="flex overflow-x-auto pb-4 space-x-4 mb-8">
            {tiers.map((tier, index) => (
              <Button
                key={index}
                variant={activeIndex === index ? "default" : "outline"}
                className="flex-shrink-0"
                onClick={() => setActiveIndex(index)}
              >
                {tier.name}
              </Button>
            ))}
          </div>

          {tiers.length > 0 && (
            <div className="bg-white p-4 rounded-md border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">{tiers[activeIndex].name}</h3>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeTier(activeIndex)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tier Name</label>
                  <Input
                    value={tiers[activeIndex].name}
                    onChange={(e) => updateTier(activeIndex, "name", e.target.value)}
                    placeholder="Sponsor Tier Name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Price ($)</label>
                  <Input
                    type="number"
                    min="0"
                    value={tiers[activeIndex].price}
                    onChange={(e) => updateTier(activeIndex, "price", Number(e.target.value))}
                    placeholder="500"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Limited Spots (Optional)</label>
                  <Input
                    type="number"
                    min="1"
                    value={tiers[activeIndex].limitedSpots || ""}
                    onChange={(e) => updateTier(
                      activeIndex, 
                      "limitedSpots", 
                      e.target.value ? Number(e.target.value) : undefined
                    )}
                    placeholder="Leave empty for unlimited"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Benefits</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tiers[activeIndex].benefits.map((benefit, benefitIndex) => (
                      <Badge key={benefitIndex} className="flex items-center">
                        {benefit}
                        <button 
                          type="button" 
                          onClick={() => removeBenefit(activeIndex, benefitIndex)}
                          className="ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex mt-2">
                    <Input
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      placeholder="Add a benefit"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => addBenefit(activeIndex)}
                      className="ml-2"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
