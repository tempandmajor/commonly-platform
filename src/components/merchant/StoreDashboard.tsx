
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, ShoppingBag, DollarSign, Package, Settings, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { getMerchantStoreByOwner } from "@/services/merchantService";
import { MerchantStore } from "@/types/auth";
import { Loader2 } from "lucide-react";
import StoreProducts from "./StoreProducts";

const StoreDashboard: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [store, setStore] = useState<MerchantStore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      if (!currentUser || !userData || !userData.isMerchant) {
        navigate("/profile");
        return;
      }

      try {
        const storeData = await getMerchantStoreByOwner(currentUser.uid);
        setStore(storeData);
      } catch (error) {
        console.error("Error fetching store:", error);
        toast({
          title: "Error",
          description: "Could not load your store information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [currentUser, userData, navigate, toast]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center" style={{ minHeight: "calc(100vh - 64px)" }}>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!store) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <Store className="h-12 w-12 mx-auto text-red-500 mb-2" />
              <h2 className="text-xl font-bold text-red-800">Store Not Found</h2>
              <p className="text-red-700 mb-4">
                We couldn't find your merchant store. Please try again or contact support.
              </p>
              <Button onClick={() => navigate("/profile")}>
                Return to Profile
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Store className="mr-2 h-6 w-6" /> {store.name}
            </h1>
            <p className="text-muted-foreground">Manage your products and store settings</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={() => navigate(`/store/${store.id}`)}>
              View Store
            </Button>
            <Button onClick={() => navigate("/store/add-product")}>
              <Plus className="h-4 w-4 mr-1" /> Add Product
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary" />
                <span className="text-2xl font-bold">0</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2 text-primary" />
                <span className="text-2xl font-bold">0</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-primary" />
                <span className="text-2xl font-bold">$0</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="mt-6">
            <StoreProducts storeId={store.id} />
          </TabsContent>
          
          <TabsContent value="orders" className="mt-6">
            <div className="bg-muted/30 rounded-lg p-12 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Orders Yet</h3>
              <p className="text-muted-foreground mt-2">
                When you make sales, your orders will appear here
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Store Settings</CardTitle>
                <CardDescription>Manage your store details and configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Store Information</h3>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Store Name</label>
                      <p className="px-3 py-2 border rounded-md bg-muted/30">{store.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Store Description</label>
                      <p className="px-3 py-2 border rounded-md bg-muted/30 min-h-[80px]">
                        {store.description || "No description provided"}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" /> Edit Store Details
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Payment Settings</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-yellow-800 text-sm">
                      You need to connect your Stripe account to receive payments from customers.
                      This will allow you to receive payments directly to your bank account.
                    </p>
                  </div>
                  <Button>
                    <DollarSign className="h-4 w-4 mr-2" /> Connect Stripe Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default StoreDashboard;
