
import { supabase } from "@/integrations/supabase/client";
import { MerchantStore, Product } from "@/types/auth";
import { toast } from "@/hooks/use-toast";

export const getMerchantStore = async (storeId: string): Promise<MerchantStore | null> => {
  try {
    const { data, error } = await supabase
      .from('merchant_stores')
      .select('*')
      .eq('id', storeId)
      .single();

    if (error) throw error;
    
    // Map from database structure to our application type
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      userId: data.user_id,
      logoUrl: data.logo_url,
      bannerUrl: data.banner_url,
      active: data.active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Error fetching merchant store:", error);
    return null;
  }
};

export const updateMerchantStore = async (storeId: string, storeData: Partial<MerchantStore>, logo?: File, banner?: File): Promise<MerchantStore | null> => {
  try {
    // Map from our application type to database structure
    const dbData: any = {
      name: storeData.name,
      description: storeData.description,
      active: storeData.active,
    };
    
    // Update the store
    const { data, error } = await supabase
      .from('merchant_stores')
      .update(dbData)
      .eq('id', storeId)
      .select()
      .single();

    if (error) throw error;

    // Map response back to our application type
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      userId: data.user_id,
      logoUrl: data.logo_url,
      bannerUrl: data.banner_url,
      active: data.active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Error updating merchant store:", error);
    return null;
  }
};

export const getProductsByStore = async (storeId: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('merchant_id', storeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      merchantId: item.merchant_id,
      imageUrl: item.image_url,
      isDigital: item.is_digital,
      digitalFileUrl: item.digital_file_url,
      inventoryCount: item.inventory_count,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const createProduct = async (productData: Partial<Product>, imageFile?: File): Promise<Product | null> => {
  try {
    // Map from our application type to database structure
    const dbData: any = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      merchant_id: productData.merchantId,
      is_digital: productData.isDigital || false,
      inventory_count: productData.inventoryCount || 0
    };
    
    // Insert the product
    const { data, error } = await supabase
      .from('products')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;

    // Map response back to our application type
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      merchantId: data.merchant_id,
      imageUrl: data.image_url,
      isDigital: data.is_digital,
      digitalFileUrl: data.digital_file_url,
      inventoryCount: data.inventory_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return null;
  }
};

export const updateProduct = async (productId: string, productData: Partial<Product>, imageFile?: File): Promise<Product | null> => {
  try {
    // Map from our application type to database structure
    const dbData: any = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      is_digital: productData.isDigital,
      inventory_count: productData.inventoryCount
    };
    
    // Update the product
    const { data, error } = await supabase
      .from('products')
      .update(dbData)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    
    // Map response back to our application type
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      merchantId: data.merchant_id,
      imageUrl: data.image_url,
      isDigital: data.is_digital,
      digitalFileUrl: data.digital_file_url,
      inventoryCount: data.inventory_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return null;
  }
};

export const deleteProduct = async (productId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    
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
