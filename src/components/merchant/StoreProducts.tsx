import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Package, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { getProductsByStore } from "@/services/merchantService";
import { Product } from "@/types/auth";

interface StoreProductsProps {
  storeId: string;
}

const StoreProducts: React.FC<StoreProductsProps> = ({ storeId }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const storeProducts = await getProductsByStore(storeId);
        setProducts(storeProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load your products",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [storeId, toast]);

  const handleAddProduct = () => {
    navigate("/store/add-product");
  };

  const handleEditProduct = (productId: string) => {
    navigate(`/store/edit-product/${productId}`);
  };

  const renderProductImage = (product: Product) => {
    if (product.imageUrl) {
      return (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover object-center"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      );
    }

    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <Package className="h-8 w-8 text-gray-400" />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-muted/30 rounded-lg p-12 text-center">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Products Yet</h3>
        <p className="text-muted-foreground mt-2 mb-6">
          Add products to your store to start selling to your audience
        </p>
        <Button onClick={handleAddProduct} className="mx-auto">
          <Plus className="h-4 w-4 mr-2" /> Add Your First Product
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Your Products</h3>
        <Button onClick={handleAddProduct} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-square overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-all hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <CardHeader className="pb-2">
              <h4 className="font-medium line-clamp-1">{product.name}</h4>
              <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
            </CardHeader>
            
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            </CardContent>
            
            <CardFooter className="flex justify-between pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEditProduct(product.id)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StoreProducts;
