
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductImage } from '@/types/product';
import { Link } from 'react-router-dom';
import AddProductModal from './AddProductModal';
import { Skeleton } from '@/components/ui/skeleton';

const StoreProducts = () => {
  const { currentUser, userData } = useAuth();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<(Product & { images?: ProductImage[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    if (!currentUser || !userData?.merchantStoreId) return;
    
    try {
      setLoading(true);
      
      // Fetch products from Supabase
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('merchant_id', userData.merchantStoreId);
      
      if (error) throw error;
      
      // For each product, fetch its images
      const productsWithImages = await Promise.all(data.map(async (product) => {
        const { data: imageData, error: imageError } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', product.id);
        
        if (imageError) {
          console.error('Error fetching product images:', imageError);
          return { ...product, images: [] };
        }
        
        return { ...product, images: imageData || [] };
      }));
      
      setProducts(productsWithImages);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Could not load products.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== productId));
      
      toast({
        title: 'Product deleted',
        description: 'The product has been removed from your store.',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Could not delete product.',
        variant: 'destructive',
      });
    }
  };

  // Get main image for a product
  const getMainImage = (product: Product & { images?: ProductImage[] }) => {
    if (product.imageUrl) return product.imageUrl;
    if (product.images && product.images.length > 0) {
      const mainImage = product.images.find(img => img.isMainImage);
      return mainImage ? mainImage.url : product.images[0].url;
    }
    return '/placeholder-product.png';
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Products</h2>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-8 w-20" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Products</h2>
        <Button onClick={() => {
          setEditingProduct(null);
          setShowAddModal(true);
        }}>
          <PlusCircle className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No products yet</h3>
          <p className="text-gray-500 mb-4">Start adding products to your store</p>
          <Button onClick={() => setShowAddModal(true)}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Your First Product
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map(product => (
            <Card key={product.id} className="overflow-hidden">
              <div 
                className="h-48 bg-center bg-cover" 
                style={{ backgroundImage: `url(${getMainImage(product)})` }}
              />
              <div className="p-4">
                <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                <p className="text-primary font-semibold mb-3">${product.price.toFixed(2)}</p>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    Stock: {product.inventoryCount}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        setEditingProduct(product);
                        setShowAddModal(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      <AddProductModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        product={editingProduct}
        onComplete={() => {
          fetchProducts();
          setShowAddModal(false);
          setEditingProduct(null);
        }}
      />
    </div>
  );
};

export default StoreProducts;
