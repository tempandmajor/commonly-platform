import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ImagePlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AddProduct = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: 0,
    isDigital: false,
    inventoryCount: 1,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIsDigitalChange = (checked: boolean) => {
    setProduct((prevData) => ({
      ...prevData,
      isDigital: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData?.uid) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create products',
        variant: 'destructive'
      });
      return;
    }
    
    if (!product.name || product.price <= 0) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      let imageUrl = '';
      let digitalFileUrl = '';
      
      // Upload product image if provided
      if (imageFile) {
        const imagePath = `${userData.uid}/${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(imagePath, imageFile);
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('products')
          .getPublicUrl(imagePath);
          
        imageUrl = data.publicUrl;
      }
      
      // Upload digital file if applicable
      if (product.isDigital && digitalFile) {
        const digitalFilePath = `${userData.uid}/${Date.now()}-${digitalFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(digitalFilePath, digitalFile);
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('products')
          .getPublicUrl(digitalFilePath);
          
        digitalFileUrl = data.publicUrl;
      }
      
      // Create the product
      const { error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description,
          price: product.price,
          inventory_count: product.inventoryCount,
          is_digital: product.isDigital,
          digital_file_url: digitalFileUrl || null,
          image_url: imageUrl || null,
          merchant_id: userData.uid
        });
        
      if (error) throw error;
      
      toast({
        title: 'Product created',
        description: 'Your product has been created successfully'
      });
      
      navigate('/merchant/dashboard');
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create product',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
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
              value={product.name}
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
              value={product.description}
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
              value={product.price}
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
              value={product.inventoryCount}
              onChange={handleInputChange}
              placeholder="Enter inventory count"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Label htmlFor="isDigital">Is Digital Product?</Label>
            <Switch
              id="isDigital"
              checked={product.isDigital}
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

          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
