import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { uploadFile } from "@/services/storageService";
import { Product } from "@/types/merchant";
import { Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AddProduct = () => {
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: 0,
    inventoryCount: 0,
    isDigital: false,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIsDigitalChange = (checked: boolean) => {
    setProductData((prevData) => ({
      ...prevData,
      isDigital: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to create a product",
          variant: "destructive",
        });
        return;
      }

      if (!productData.name || !productData.price) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      let imageUrl = "";

      // Upload image if selected
      if (selectedImage) {
        imageUrl = await uploadFile(selectedImage, "products");
      }

      // Create the product in Supabase
      const productToCreate: Partial<Product> = {
        merchantId: currentUser.uid,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        imageUrl: imageUrl,
        inventoryCount: productData.inventoryCount || 0,
        isDigital: productData.isDigital || false,
      };

      const { data, error } = await supabase
        .from('products')
        .insert(productToCreate)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Product created",
        description: "Your product has been created successfully",
      });

      // Reset form
      setProductData({
        name: "",
        description: "",
        price: 0,
        inventoryCount: 0,
        isDigital: false,
      });
      setSelectedImage(null);
      setImagePreview("");

      // Navigate to store dashboard
      navigate("/store/dashboard");
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error creating product",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Add New Product</h1>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={productData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={productData.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              type="number"
              id="price"
              name="price"
              value={productData.price}
              onChange={handleInputChange}
              placeholder="Enter product price"
              required
            />
          </div>

          <div>
            <Label htmlFor="inventoryCount">Inventory Count</Label>
            <Input
              type="number"
              id="inventoryCount"
              name="inventoryCount"
              value={productData.inventoryCount}
              onChange={handleInputChange}
              placeholder="Enter inventory count"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Label htmlFor="isDigital">Is Digital Product?</Label>
            <Switch
              id="isDigital"
              checked={productData.isDigital}
              onCheckedChange={handleIsDigitalChange}
            />
          </div>

          <div>
            <Label htmlFor="image">Product Image</Label>
            <Input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="mb-2"
            />
            {imagePreview && (
              <div className="relative w-32 h-32">
                <img
                  src={imagePreview}
                  alt="Product Preview"
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
