
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import AddProductModal from "./AddProductModal";
import { ProductCard } from "./products/ProductCard";
import { LoadingSpinner } from "./common/LoadingSpinner";
import { EmptyStateMessage } from "./common/EmptyStateMessage";
import { Product } from "@/types/merchant";

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

      // Using mock data since we can't directly fetch products with category from Supabase
      setTimeout(() => {
        // Mock products data
        const mockProducts = getMockProducts(storeId);
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
    return <LoadingSpinner />;
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
        <EmptyProductsState onAddProduct={() => setIsAddProductModalOpen(true)} />
      ) : (
        <ProductsGrid products={products} />
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

interface EmptyProductsStateProps {
  onAddProduct: () => void;
}

const EmptyProductsState: React.FC<EmptyProductsStateProps> = ({ onAddProduct }) => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <p className="text-muted-foreground mb-4">
        You haven't added any products to your store yet
      </p>
      <Button onClick={onAddProduct}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Your First Product
      </Button>
    </div>
  );
};

interface ProductsGridProps {
  products: Product[];
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

// Helper function to generate mock products
const getMockProducts = (storeId: string): Product[] => {
  return [
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
};

export default StoreProducts;
