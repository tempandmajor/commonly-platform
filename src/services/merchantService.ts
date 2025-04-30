
import { 
  doc, 
  collection, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  deleteDoc,
  Timestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { MerchantStore, Product, UserData } from "@/types/auth";

// Create a new merchant store
export const createMerchantStore = async (userId: string, storeData: Partial<MerchantStore>): Promise<string> => {
  try {
    const storeRef = collection(db, "merchantStores");
    const newStore: Partial<MerchantStore> = {
      ownerId: userId,
      name: storeData.name || "My Store",
      description: storeData.description || "",
      logoUrl: storeData.logoUrl || null,
      bannerUrl: storeData.bannerUrl || null,
      createdAt: Timestamp.now().toDate().toISOString(),
      updatedAt: Timestamp.now().toDate().toISOString(),
      isActive: true
    };
    
    const storeDoc = await addDoc(storeRef, newStore);
    
    // Update user record to mark as merchant
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      isMerchant: true,
      merchantStoreId: storeDoc.id
    });
    
    return storeDoc.id;
  } catch (error) {
    console.error("Error creating merchant store:", error);
    throw error;
  }
};

// Get a merchant store by ID
export const getMerchantStore = async (storeId: string): Promise<MerchantStore | null> => {
  try {
    const storeDoc = await getDoc(doc(db, "merchantStores", storeId));
    
    if (storeDoc.exists()) {
      return { id: storeDoc.id, ...storeDoc.data() } as MerchantStore;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching merchant store:", error);
    throw error;
  }
};

// Get store by owner ID
export const getMerchantStoreByOwner = async (userId: string): Promise<MerchantStore | null> => {
  try {
    const q = query(
      collection(db, "merchantStores"),
      where("ownerId", "==", userId),
      limit(1)
    );
    
    const storesSnap = await getDocs(q);
    
    if (!storesSnap.empty) {
      const storeDoc = storesSnap.docs[0];
      return { id: storeDoc.id, ...storeDoc.data() } as MerchantStore;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching merchant store by owner:", error);
    throw error;
  }
};

// Update merchant store
export const updateMerchantStore = async (storeId: string, data: Partial<MerchantStore>): Promise<void> => {
  try {
    const storeRef = doc(db, "merchantStores", storeId);
    await updateDoc(storeRef, {
      ...data,
      updatedAt: Timestamp.now().toDate().toISOString()
    });
  } catch (error) {
    console.error("Error updating merchant store:", error);
    throw error;
  }
};

// Upload store logo
export const uploadStoreLogo = async (storeId: string, file: File): Promise<string> => {
  try {
    const logoRef = ref(storage, `store-logos/${storeId}`);
    await uploadBytes(logoRef, file);
    const downloadURL = await getDownloadURL(logoRef);
    
    const storeRef = doc(db, "merchantStores", storeId);
    await updateDoc(storeRef, { 
      logoUrl: downloadURL,
      updatedAt: Timestamp.now().toDate().toISOString()
    });
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading store logo:", error);
    throw error;
  }
};

// Upload store banner
export const uploadStoreBanner = async (storeId: string, file: File): Promise<string> => {
  try {
    const bannerRef = ref(storage, `store-banners/${storeId}`);
    await uploadBytes(bannerRef, file);
    const downloadURL = await getDownloadURL(bannerRef);
    
    const storeRef = doc(db, "merchantStores", storeId);
    await updateDoc(storeRef, { 
      bannerUrl: downloadURL,
      updatedAt: Timestamp.now().toDate().toISOString()
    });
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading store banner:", error);
    throw error;
  }
};

// Create a new product
export const createProduct = async (storeId: string, productData: Partial<Product>): Promise<string> => {
  try {
    const productRef = collection(db, "products");
    const newProduct: Partial<Product> = {
      storeId,
      name: productData.name || "New Product",
      description: productData.description || "",
      price: productData.price || 0,
      imageUrl: productData.imageUrl || [],
      productCategory: productData.productCategory || "Other",
      inventoryCount: productData.inventoryCount || 0,
      isDigital: productData.isDigital || false,
      isActive: productData.isActive || true,
      createdAt: Timestamp.now().toDate().toISOString(),
      updatedAt: Timestamp.now().toDate().toISOString()
    };
    
    const productDoc = await addDoc(productRef, newProduct);
    return productDoc.id;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Get a product by ID
export const getProduct = async (productId: string): Promise<Product | null> => {
  try {
    const productDoc = await getDoc(doc(db, "products", productId));
    
    if (productDoc.exists()) {
      return { id: productDoc.id, ...productDoc.data() } as Product;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

// Get products by store ID
export const getProductsByStore = async (storeId: string): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, "products"),
      where("storeId", "==", storeId),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );
    
    const productsSnap = await getDocs(q);
    const products: Product[] = [];
    
    productsSnap.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    
    return products;
  } catch (error) {
    console.error("Error fetching products by store:", error);
    throw error;
  }
};

// Search products in marketplace
export const searchProducts = async (
  searchTerm: string = "", 
  category: string = "", 
  limitCount: number = 20
): Promise<Product[]> => {
  try {
    let q = query(
      collection(db, "products"),
      where("isActive", "==", true)
    );
    
    if (category) {
      q = query(q, where("productCategory", "==", category));
    }
    
    q = query(q, orderBy("createdAt", "desc"), limit(limitCount));
    
    const productsSnap = await getDocs(q);
    let products: Product[] = [];
    
    productsSnap.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    
    // Filter by search term if provided (client-side filtering since Firebase doesn't support text search)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(lowerSearchTerm) || 
        product.description.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    return products;
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
};

// Upload product image
export const uploadProductImage = async (productId: string, file: File): Promise<string> => {
  try {
    const imageRef = ref(storage, `product-images/${productId}/${file.name}`);
    await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(imageRef);
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading product image:", error);
    throw error;
  }
};

// Update product
export const updateProduct = async (productId: string, data: Partial<Product>): Promise<void> => {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
      ...data,
      updatedAt: Timestamp.now().toDate().toISOString()
    });
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Delete a product (soft delete)
export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
      isActive: false,
      updatedAt: Timestamp.now().toDate().toISOString()
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};
