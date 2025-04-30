
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AddProductModal from "./AddProductModal";

interface ProductImage {
  id: string;
  productId: string;
  url: string;
  isMainImage: boolean;
  createdAt: string;
}

interface Product {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  inventoryCount: number;
  isDigital: boolean;
  digitalFileUrl?: string;
  category?: string;
  images?: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

interface StoreProductsProps {
  storeId: string;
}

const StoreProducts: React.FC<StoreProductsProps> = ({ storeId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (storeId) {
      fetchProducts();
    }
  }, [storeId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Since we can't directly fetch products with category from Supabase,
      // we'll use mock data or fetch and transform the data
      setTimeout(() => {
        // Mock products data
        const mockProducts: Product[] = [
          {
            id: "prod-1",
            merchantId: storeId,
            name: "Premium T-Shirt",
            description: "High-quality cotton t-shirt in various colors",
            price: 29.99,
            imageUrl: "https://example.com/tshirt.jpg",
            inventoryCount: 50,
            isDigital: false,
            category: "Clothing",
            createdAt: new Date(Date.now() - 604800000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "prod-2",
            merchantId: storeId,
            name: "Designer Jeans",
            description: "Premium denim jeans with custom fit",
            price: 49.99,
            imageUrl: "https://example.com/jeans.jpg",
            inventoryCount: 25,
            isDigital: false,
            category: "Clothing",
            createdAt: new Date(Date.now() - 1209600000).toISOString(),
            updatedAt: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: "prod-3",
            merchantId: storeId,
            name: "E-Book: Marketing Strategies",
            description: "Comprehensive guide on modern marketing techniques",
            price: 14.99,
            imageUrl: "https://example.com/ebook.jpg",
            inventoryCount: 0,
            isDigital: true,
            digitalFileUrl: "https://example.com/downloads/marketing-ebook.pdf",
            category: "Digital Products",
            createdAt: new Date(Date.now() - 2419200000).toISOString(),
            updatedAt: new Date(Date.now() - 259200000).toISOString(),
          }
        ];

        setProducts(mockProducts);
        setLoading(false);
      }, 800);

    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <Button onClick={() => setIsAddProductModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-muted-foreground mb-4">
            You haven't added any products to your store yet
          </p>
          <Button onClick={() => setIsAddProductModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Your First Product
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-gray-100 relative">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                {product.isDigital && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                      Digital
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                  {product.description || "No description provided"}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-semibold">${product.price.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">
                    Stock: {product.isDigital ? "∞" : product.inventoryCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductAdded={handleAddProduct}
        merchantId={storeId}
      />
    </div>
  );
};

export default StoreProducts;
