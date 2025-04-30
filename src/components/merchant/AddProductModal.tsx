
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";

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
  createdAt: string;
  updatedAt: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: (product: Product) => void;
  merchantId: string;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onProductAdded,
  merchantId,
}) => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("0");
  const [inventory, setInventory] = useState<string>("1");
  const [isDigital, setIsDigital] = useState<boolean>(false);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProductImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDigitalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDigitalFile(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("0");
    setInventory("1");
    setIsDigital(false);
    setProductImage(null);
    setDigitalFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      let imageUrl: string | undefined = undefined;
      let digitalFileUrl: string | undefined = undefined;
      
      // Upload product image if provided
      if (productImage) {
        const imagePath = `${merchantId}/${Date.now()}_${productImage.name}`;
        const { data: imageData, error: imageError } = await supabase.storage
          .from('products')
          .upload(imagePath, productImage);
        
        if (imageError) throw imageError;
        
        // Get public URL
        const { data: urlData } = await supabase.storage
          .from('products')
          .getPublicUrl(imagePath);
          
        imageUrl = urlData.publicUrl;
      }
      
      // Upload digital file if this is a digital product
      if (isDigital && digitalFile) {
        const filePath = `digital/${merchantId}/${Date.now()}_${digitalFile.name}`;
        const { data: fileData, error: fileError } = await supabase.storage
          .from('products')
          .upload(filePath, digitalFile);
        
        if (fileError) throw fileError;
        
        // Get public URL (or private URL depending on your needs)
        const { data: urlData } = await supabase.storage
          .from('products')
          .getPublicUrl(filePath);
          
        digitalFileUrl = urlData.publicUrl;
      }
      
      // Create product in database
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert([{
          merchant_id: merchantId,
          name,
          description,
          price: parseFloat(price),
          inventory_count: isDigital ? 0 : parseInt(inventory, 10),
          is_digital: isDigital,
          image_url: imageUrl,
          digital_file_url: digitalFileUrl
        }])
        .select()
        .single();
      
      if (productError) throw productError;
      
      // Format product for the callback
      const newProduct: Product = {
        id: productData.id,
        merchantId: productData.merchant_id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        imageUrl: productData.image_url,
        inventoryCount: productData.inventory_count,
        isDigital: productData.is_digital,
        digitalFileUrl: productData.digital_file_url,
        createdAt: productData.created_at,
        updatedAt: productData.updated_at
      };
      
      onProductAdded(newProduct);
      resetForm();
      onClose();
      
      toast({
        title: "Success",
        description: "Product added successfully",
      });
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Create a new product for your store
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid items-center gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>
            
            <div className="grid items-center gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description"
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid items-center gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              
              {!isDigital && (
                <div className="grid items-center gap-2">
                  <Label htmlFor="inventory">Inventory</Label>
                  <Input
                    id="inventory"
                    type="number"
                    min="0"
                    step="1"
                    value={inventory}
                    onChange={(e) => setInventory(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="digital-product"
                checked={isDigital}
                onCheckedChange={setIsDigital}
              />
              <Label htmlFor="digital-product">Digital Product</Label>
            </div>

            <div className="grid items-center gap-2">
              <Label htmlFor="product-image">Product Image</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-[120px]"
                  onClick={() => document.getElementById("product-image")?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Input
                  id="product-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="h-20 w-20 relative overflow-hidden rounded border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {isDigital && (
              <div className="grid items-center gap-2">
                <Label htmlFor="digital-file">Digital File</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-[120px]"
                    onClick={() => document.getElementById("digital-file")?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                  <Input
                    id="digital-file"
                    type="file"
                    className="hidden"
                    onChange={handleDigitalFileChange}
                  />
                  {digitalFile && (
                    <span className="text-sm truncate max-w-[200px]">
                      {digitalFile.name}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                </>
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
