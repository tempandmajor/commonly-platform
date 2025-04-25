
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { getMerchantStoreByOwner, createProduct, uploadProductImage, updateProduct } from "@/services/merchantService";
import { MerchantStore } from "@/types/auth";
import { Loader2, Image, Plus, Package } from "lucide-react";

const CATEGORIES = [
  "Clothing",
  "Accessories",
  "Home Decor",
  "Art",
  "Digital Products",
  "Other"
];

const AddProduct: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [store, setStore] = useState<MerchantStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Product form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [inventory, setInventory] = useState("1");
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchStore = async () => {
      if (!currentUser || !userData || !userData.isMerchant) {
        toast({
          title: "Access denied",
          description: "You need to activate a merchant store first",
          variant: "destructive",
        });
        navigate("/profile");
        return;
      }

      try {
        const storeData = await getMerchantStoreByOwner(currentUser.uid);
        if (!storeData) {
          toast({
            title: "Store not found",
            description: "Your merchant store could not be found",
            variant: "destructive",
          });
          navigate("/profile");
          return;
        }
        
        setStore(storeData);
      } catch (error) {
        console.error("Error fetching store:", error);
        toast({
          title: "Error",
          description: "Could not load your store information",
          variant: "destructive",
        });
        navigate("/profile");
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [currentUser, userData, navigate, toast]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      
      // Limit to 5 images
      const filesToAdd = selectedFiles.slice(0, 5 - images.length);
      
      setImages(prev => [...prev, ...filesToAdd]);
      
      // Create preview URLs
      const newPreviewImages = filesToAdd.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviewImages]);
    }
  };
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previewImages[index]);
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!store) return;
    
    // Validate form
    if (!name.trim()) {
      toast({ title: "Error", description: "Please enter a product name", variant: "destructive" });
      return;
    }
    
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      toast({ title: "Error", description: "Please enter a valid price", variant: "destructive" });
      return;
    }
    
    const priceValue = parseFloat(parseFloat(price).toFixed(2));
    const inventoryValue = Math.max(0, parseInt(inventory) || 0);
    
    try {
      setSubmitting(true);
      
      // Create product
      const productId = await createProduct(store.id, {
        name,
        description,
        price: priceValue,
        category,
        inventory: inventoryValue,
        images: []
      });
      
      // Upload images if any
      if (images.length > 0) {
        const uploadedImageUrls = await Promise.all(
          images.map(async (image) => {
            return await uploadProductImage(productId, image);
          })
        );
        
        // Update product with image URLs
        await updateProduct(productId, { images: uploadedImageUrls });
      }
      
      toast({
        title: "Product created",
        description: "Your product has been created successfully",
      });
      
      navigate("/store/dashboard");
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center" style={{ minHeight: "calc(100vh - 64px)" }}>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Add New Product</h1>
            <Button variant="outline" onClick={() => navigate("/store/dashboard")}>
              Cancel
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>
                Fill in the details for your new product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your product..."
                      className="min-h-[120px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="29.99"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border rounded-md px-3 py-2 w-full"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="inventory">Inventory</Label>
                      <Input
                        id="inventory"
                        type="number"
                        min="0"
                        value={inventory}
                        onChange={(e) => setInventory(e.target.value)}
                        placeholder="10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Product Images</Label>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {previewImages.map((src, index) => (
                        <div key={index} className="relative aspect-square border rounded-md overflow-hidden group">
                          <img src={src} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      ))}
                      
                      {previewImages.length < 5 && (
                        <label className="aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                          <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Add Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="sr-only"
                          />
                        </label>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Upload up to 5 images. First image will be used as the product thumbnail.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/store/dashboard")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {submitting ? "Creating Product..." : "Create Product"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AddProduct;
