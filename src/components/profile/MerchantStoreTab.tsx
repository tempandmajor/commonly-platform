
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger, Tabs, TabsContent } from "@/components/ui/tabs";
import { AlertCircle, Loader2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { getMerchantStore, getProductsByStore } from "@/services/merchantService";
import { MerchantStore, Product } from "@/types/auth";

export interface MerchantStoreTabProps {
  userId: string;
  merchantStoreId: string;
}

const MerchantStoreTab: React.FC<MerchantStoreTabProps> = ({ userId, merchantStoreId }) => {
  const [store, setStore] = useState<MerchantStore | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        
        // Fetch store details
        const storeData = await getMerchantStore(merchantStoreId);
        setStore(storeData);
        
        if (storeData) {
          // Fetch products
          const productsData = await getProductsByStore(merchantStoreId);
          setProducts(productsData);
        }
      } catch (err) {
        console.error("Error fetching merchant store data:", err);
        setError("Failed to load store information. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (merchantStoreId) {
      fetchStoreData();
    } else {
      setLoading(false);
    }
  }, [merchantStoreId]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 p-6 rounded-lg text-center">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center p-8">
        <div className="mb-4">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-medium mt-2">No Merchant Store</h3>
          <p className="text-muted-foreground mt-1 mb-6">
            You haven't set up a merchant store yet. Create a store to start selling products.
          </p>
          <Button asChild>
            <Link to="/settings/merchant">Create Store</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Store Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{store.name}</h2>
          <p className="text-muted-foreground">{store.description}</p>
        </div>
        <Button asChild>
          <Link to="/merchant/dashboard">Manage Store</Link>
        </Button>
      </div>

      {/* Store Content */}
      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          {products.length === 0 ? (
            <div className="text-center p-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">No products available yet.</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/merchant/add-product">Add Product</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map(product => (
                <Card key={product.id} className="overflow-hidden">
                  {product.imageUrl && (
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <div className="font-semibold">${product.price.toFixed(2)}</div>
                    <Button size="sm" variant="outline">View</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="about">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">About the Store</h3>
              <p className="mt-1">{store.description || "No description available."}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg">Store Information</h3>
              <ul className="mt-1 space-y-2">
                <li><span className="text-muted-foreground">Created:</span> {new Date(store.createdAt).toLocaleDateString()}</li>
                <li><span className="text-muted-foreground">Status:</span> {store.isActive ? "Active" : "Inactive"}</li>
                <li><span className="text-muted-foreground">Products:</span> {products.length}</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantStoreTab;
