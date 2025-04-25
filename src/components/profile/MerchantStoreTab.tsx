
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Store, ShoppingBag, Package, DollarSign, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface MerchantStoreTabProps {
  userId: string;
  isEligible: boolean;
}

const MerchantStoreTab: React.FC<MerchantStoreTabProps> = ({ userId, isEligible }) => {
  const { userData, activateMerchantStore } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleActivateStore = async () => {
    if (!isEligible) {
      toast({
        title: "Not eligible",
        description: "You need at least 1,000 followers to create a merchant store",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await activateMerchantStore();
      navigate("/store/dashboard");
    } catch (error) {
      console.error("Error activating store:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageStore = () => {
    navigate("/store/dashboard");
  };

  if (!userData) return null;

  const isMerchant = userData.isMerchant;

  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Store className="mr-2 h-6 w-6 text-primary" />
          Merchant Store
        </h2>
        
        <p className="text-gray-600 mb-6">
          As a creator with 1,000+ followers, you can sell products directly to your audience
          through your own merchant store on Commonly.
        </p>

        {!isEligible && !isMerchant && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-xl">Not Yet Eligible</CardTitle>
              <CardDescription>
                You need at least 1,000 followers to create a merchant store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Keep growing your audience to unlock the merchant store feature.
                Once you reach 1,000 followers, you'll be able to sell products
                and earn revenue directly from your audience.
              </p>
            </CardContent>
          </Card>
        )}

        {isEligible && !isMerchant && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Create Your Store</CardTitle>
                <CardDescription>
                  Start selling to your {userData.followerCount} followers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="bg-primary/10 p-2 rounded-full">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </span>
                  <div>
                    <h4 className="font-medium">Create your own store</h4>
                    <p className="text-sm text-muted-foreground">Sell products directly to your audience</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="bg-primary/10 p-2 rounded-full">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </span>
                  <div>
                    <h4 className="font-medium">Earn revenue</h4>
                    <p className="text-sm text-muted-foreground">Keep 95% of your sales (5% platform fee + Stripe fees)</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="bg-primary/10 p-2 rounded-full">
                    <Package className="h-5 w-5 text-primary" />
                  </span>
                  <div>
                    <h4 className="font-medium">Manage inventory</h4>
                    <p className="text-sm text-muted-foreground">Add products manually or via Printful/Printify</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleActivateStore} 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Creating Store..." : "Activate Merchant Store"}
                </Button>
              </CardFooter>
            </Card>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Benefits of Commonly Merchant</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium">Direct sales to followers</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Sell products directly to your engaged audience without leaving the platform.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Verified creator badge</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Get a verified badge on your profile to increase trust and credibility.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Easy integration</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Connect with Printful or Printify for print-on-demand products or add your own inventory.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isMerchant && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Your Merchant Store</CardTitle>
                <Badge variant="outline" className="bg-primary/10 text-primary">Active</Badge>
              </div>
              <CardDescription>
                Selling to your {userData.followerCount} followers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Your merchant store is active! You can now add products and start selling
                to your audience.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <Tag className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Products</h4>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Sales</h4>
                  <p className="text-2xl font-bold">$0</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleManageStore}
                className="w-full"
              >
                Manage Your Store
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MerchantStoreTab;
