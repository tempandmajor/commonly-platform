
import { supabase } from "@/integrations/supabase/client";
import { MerchantStore, Product } from "@/types/merchant";
import { toast } from "@/components/ui/use-toast";

export const getMerchantStore = async (storeId: string): Promise<MerchantStore | null> => {
  try {
    // Since merchant_stores doesn't exist yet in Supabase, we'll mock this temporarily
    // This would be replaced with proper Supabase queries once the table is created
    return {
      id: storeId,
      ownerId: "mock-owner-id",
      name: "Store Name",
      description: "Store Description",
      logoUrl: "/placeholder.svg",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching merchant store:", error);
    return null;
  }
};

export const updateMerchantStore = async (
  storeId: string, 
  storeData: Partial<MerchantStore>
): Promise<MerchantStore | null> => {
  try {
    // Mock update functionality until Supabase tables are set up
    return {
      id: storeId,
      ownerId: "mock-owner-id",
      name: storeData.name || "Store Name",
      description: storeData.description || "Store Description",
      logoUrl: storeData.logoUrl || "/placeholder.svg",
      isActive: storeData.isActive !== undefined ? storeData.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error updating merchant store:", error);
    return null;
  }
};

export const getProductsByStore = async (storeId: string): Promise<Product[]> => {
  try {
    // Mock product data until Supabase tables are created
    return [
      {
        id: "1",
        merchantId: storeId,
        name: "Product 1",
        description: "Description for product 1",
        price: 19.99,
        imageUrl: "/placeholder.svg",
        inventoryCount: 10,
        isDigital: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        merchantId: storeId,
        name: "Digital Product",
        description: "Description for digital product",
        price: 9.99,
        imageUrl: "/placeholder.svg",
        inventoryCount: 999,
        isDigital: true,
        digitalFileUrl: "https://example.com/download",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const createProduct = async (productData: Partial<Product>): Promise<Product | null> => {
  try {
    // Mock product creation
    return {
      id: Date.now().toString(),
      merchantId: productData.merchantId || "",
      name: productData.name || "",
      description: productData.description || "",
      price: productData.price || 0,
      imageUrl: productData.imageUrl || "/placeholder.svg",
      inventoryCount: productData.inventoryCount || 0,
      isDigital: productData.isDigital || false,
      digitalFileUrl: productData.digitalFileUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return null;
  }
};

export const updateProduct = async (
  productId: string, 
  productData: Partial<Product>
): Promise<Product | null> => {
  try {
    // Mock product update
    return {
      id: productId,
      merchantId: productData.merchantId || "store-id",
      name: productData.name || "Product Name",
      description: productData.description || "",
      price: productData.price || 0,
      imageUrl: productData.imageUrl || "/placeholder.svg",
      inventoryCount: productData.inventoryCount || 0,
      isDigital: productData.isDigital || false,
      digitalFileUrl: productData.digitalFileUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return null;
  }
};

export const deleteProduct = async (productId: string): Promise<boolean> => {
  try {
    // Mock product deletion
    // This would be replaced with a proper Supabase query
    toast({
      title: "Success",
      description: "Product deleted successfully",
    });
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    toast({
      title: "Error",
      description: "Failed to delete product",
      variant: "destructive"
    });
    return false;
  }
};
