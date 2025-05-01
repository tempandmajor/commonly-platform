
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { MerchantStore, Product } from "@/types/merchant";
import { ShoppingBag, Settings, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { getMerchantStore, getProductsByStore } from "@/services/merchantService";
import { formatCurrency } from "@/lib/utils";

export interface MerchantStoreTabProps {
  userId: string;
  merchantStoreId: string;
}

const MerchantStoreTab: React.FC<MerchantStoreTabProps> = ({ 
  userId, 
  merchantStoreId 
}) => {
  const [store, setStore] = useState<MerchantStore | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const isOwner = currentUser?.uid === userId;

  useEffect(() => {
    const loadStoreData = async () => {
      if (!merchantStoreId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const storeData = await getMerchantStore(merchantStoreId);
        setStore(storeData);
        
        if (storeData) {
          const productsData = await getProductsByStore(merchantStoreId);
          setProducts(productsData);
        }
      } catch (error) {
        console.error("Error loading merchant store:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load merchant store information",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadStoreData();
  }, [merchantStoreId, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        {isOwner ? (
          <>
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Start selling your merchandise</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Set up your merchant store to sell products to your followers and fans.
            </p>
            <Button>
              Create Your Store
            </Button>
          </>
        ) : (
          <p className="text-muted-foreground">
            This user hasn't set up their merchant store yet.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Store Header */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="bg-gray-100 h-32 relative">
          {/* Store banner would go here */}
        </div>
        
        <div className="p-4 sm:p-6 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center -mt-12 border-4 border-white">
              <ShoppingBag className="h-8 w-8 text-primary" />
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold">{store.name}</h2>
              <p className="text-muted-foreground text-sm">{store.description}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <div className="flex items-center text-sm">
                {store.isActive || store.active ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                )}
                <span>{store.isActive || store.active ? "Active" : "Inactive"}</span>
              </div>
              
              {isOwner && (
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Store
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Products Tabs */}
      <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          {isOwner && (
            <TabsTrigger value="orders">Orders</TabsTrigger>
          )}
          {isOwner && (
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="products">
          {products.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No products yet</h3>
              {isOwner ? (
                <>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start adding products to your store to begin selling.
                  </p>
                  <Button>
                    Add Your First Product
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">
                  This store doesn't have any products available right now.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="h-40 bg-gray-100">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{formatCurrency(product.price)}</span>
                      {product.isDigital && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Digital
                        </span>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button className="w-full">
                      {isOwner ? "Edit Product" : "Buy Now"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {isOwner && (
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Recent Orders</h3>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  No orders yet
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {isOwner && (
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Store Analytics</h3>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Analytics data will appear here once you have sales
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default MerchantStoreTab;
