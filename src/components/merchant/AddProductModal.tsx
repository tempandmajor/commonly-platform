
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Product } from "@/types/product";

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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isDigital, setIsDigital] = useState(false);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [inventory, setInventory] = useState("1");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImage(null);
    setIsDigital(false);
    setDigitalFile(null);
    setInventory("1");
    setCategory("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add products",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Validate form
      if (!name.trim()) {
        toast({ title: "Error", description: "Product name is required", variant: "destructive" });
        return;
      }

      if (!price || isNaN(Number(price)) || Number(price) <= 0) {
        toast({ title: "Error", description: "Please enter a valid price", variant: "destructive" });
        return;
      }

      if (isDigital && !digitalFile) {
        toast({ title: "Error", description: "Please upload a digital file", variant: "destructive" });
        return;
      }

      // Create product
      const productData = {
        merchant_id: merchantId,
        name,
        description,
        price: Number(price),
        is_digital: isDigital,
        inventory_count: Number(inventory),
        category: category || undefined
      };

      const { data: productRecord, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;

      let imageUrl = undefined;
      let digitalFileUrl = undefined;

      // Upload image if provided
      if (image && productRecord) {
        const fileExt = image.name.split('.').pop();
        const filePath = `${merchantId}/${productRecord.id}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;

        // Update product with image URL
        await supabase
          .from('products')
          .update({ image_url: imageUrl })
          .eq('id', productRecord.id);
      }

      // Upload digital file if provided
      if (isDigital && digitalFile && productRecord) {
        const fileExt = digitalFile.name.split('.').pop();
        const filePath = `${merchantId}/digital/${productRecord.id}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, digitalFile, { contentType: digitalFile.type });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        digitalFileUrl = urlData.publicUrl;

        // Update product with digital file URL
        await supabase
          .from('products')
          .update({ digital_file_url: digitalFileUrl })
          .eq('id', productRecord.id);
      }

      const newProduct: Product = {
        id: productRecord.id,
        merchantId: productRecord.merchant_id,
        name: productRecord.name,
        description: productRecord.description || undefined,
        price: productRecord.price,
        imageUrl: imageUrl || productRecord.image_url,
        inventoryCount: productRecord.inventory_count,
        isDigital: productRecord.is_digital,
        digitalFileUrl: digitalFileUrl || productRecord.digital_file_url,
        createdAt: productRecord.created_at,
        updatedAt: productRecord.updated_at,
        category: productRecord.category
      };

      toast({
        title: "Product added",
        description: `${name} has been added to your store`,
      });
      
      onProductAdded(newProduct);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive"
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
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="9.99"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Apparel, Digital"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="digital"
                checked={isDigital}
                onCheckedChange={setIsDigital}
              />
              <Label htmlFor="digital">This is a digital product</Label>
            </div>

            {!isDigital && (
              <div className="grid gap-2">
                <Label htmlFor="inventory">Inventory Count *</Label>
                <Input
                  id="inventory"
                  type="number"
                  min="1"
                  step="1"
                  value={inventory}
                  onChange={(e) => setInventory(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="image">Product Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
              />
            </div>

            {isDigital && (
              <div className="grid gap-2">
                <Label htmlFor="digitalFile">Digital File *</Label>
                <Input
                  id="digitalFile"
                  type="file"
                  onChange={(e) => setDigitalFile(e.target.files ? e.target.files[0] : null)}
                  required={isDigital}
                />
                <p className="text-xs text-muted-foreground">
                  Upload the digital content customers will receive after purchase.
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Product"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
