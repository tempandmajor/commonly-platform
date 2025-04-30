
import React, { useState, useEffect } from "react";
import { Product, ProductImage } from "@/types/product";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AddProductModal from "./AddProductModal";

interface StoreProductsProps {
  storeId: string;
}

const StoreProducts: React.FC<StoreProductsProps> = ({ storeId }) => {
  const [products, setProducts] = useState<(Product & { images?: ProductImage[] })[]>([]);
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

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('merchant_id', storeId)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch product images for each product
      const productIds = productsData.map((product) => product.id);
      const { data: imagesData, error: imagesError } = await supabase
        .from('product_images')
        .select('*')
        .in('product_id', productIds);

      if (imagesError) throw imagesError;

      // Map products to our interface structure
      const mappedProducts = productsData.map((product) => {
        const productImages = imagesData.filter((img) => img.product_id === product.id);
        return {
          id: product.id,
          merchantId: product.merchant_id,
          name: product.name,
          description: product.description || undefined,
          price: product.price,
          imageUrl: product.image_url,
          inventoryCount: product.inventory_count,
          isDigital: product.is_digital,
          digitalFileUrl: product.digital_file_url,
          createdAt: product.created_at,
          updatedAt: product.updated_at,
          category: product.category,
          images: productImages.map((img) => ({
            id: img.id,
            productId: img.product_id,
            url: img.url,
            isMainImage: img.is_main_image,
            createdAt: img.created_at
          }))
        };
      });

      setProducts(mappedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
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
