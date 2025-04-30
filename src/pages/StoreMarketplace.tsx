
import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Search, ShoppingCart, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "@/types/merchant";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

const CATEGORIES = [
  "All",
  "Clothing",
  "Electronics",
  "Accessories",
  "Home",
  "Books",
];

// Use the service to fetch products
const StoreMarketplace: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [digitalOnly, setDigitalOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Simulate API call with timeout
        setTimeout(() => {
          // Mock data for products (this would be replaced with actual Supabase calls)
          const mockProducts: Product[] = [
            {
              id: "1",
              merchantId: "merchant1",
              name: "Wireless Headphones",
              description: "High quality wireless headphones with noise cancellation",
              price: 129.99,
              imageUrl: "/placeholder.svg",
              inventoryCount: 15,
              isDigital: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              category: "Electronics",
            },
            {
              id: "2",
              merchantId: "merchant1",
              name: "Digital Marketing eBook",
              description: "Comprehensive guide to digital marketing strategies",
              price: 24.99,
              imageUrl: "/placeholder.svg",
              inventoryCount: 999,
              isDigital: true,
              digitalFileUrl: "https://example.com/files/ebook.pdf",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              category: "Books",
            },
            {
              id: "3",
              merchantId: "merchant2",
              name: "Premium T-Shirt",
              description: "100% cotton premium quality t-shirt",
              price: 29.99,
              imageUrl: "/placeholder.svg",
              inventoryCount: 50,
              isDigital: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              category: "Clothing",
            },
          ];
          
          setProducts(mockProducts);
          setLoading(false);
        }, 500);
        
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [toast]);

  // Get main image for a product
  const getMainImage = (product: Product) => {
    return product.imageUrl || '/placeholder.svg';
  };

  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter((product) =>
      selectedCategory === "All" || product.category === selectedCategory
    )
    .filter((product) =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    )
    .filter((product) =>
      !digitalOnly || product.isDigital
    )
    .filter((product) =>
      !inStockOnly || product.inventoryCount > 0
    );

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setPriceRange([0, 1000]);
    setDigitalOnly(false);
    setInStockOnly(false);
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Marketplace</h1>
            <p className="text-gray-600">
              Discover unique products from our community
            </p>
          </div>
          <Link to="/cart">
            <Button variant="outline" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-grow max-w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search products..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <SlidersHorizontal className="h-4 w-4 mr-2" /> Filter
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Products</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-6">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Price Range: ${priceRange[0]} - ${priceRange[1]}</Label>
                  <Slider
                    min={0}
                    max={1000}
                    step={10}
                    value={priceRange}
                    onValueChange={setPriceRange}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="digital-only"
                      checked={digitalOnly}
                      onCheckedChange={(checked) => setDigitalOnly(!!checked)}
                    />
                    <Label htmlFor="digital-only">Digital Products Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="in-stock"
                      checked={inStockOnly}
                      onCheckedChange={(checked) => setInStockOnly(!!checked)}
                    />
                    <Label htmlFor="in-stock">In Stock Only</Label>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-5 w-1/4 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <SlidersHorizontal className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              We couldn't find any products matching your current filters.
              Try adjusting your search criteria.
            </p>
            <Button onClick={handleResetFilters}>Reset All Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`}>
                <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-md">
                  <div
                    className="h-48 bg-center bg-cover"
                    style={{ backgroundImage: `url(${getMainImage(product)})` }}
                  />
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <h3 className="font-medium text-lg mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-primary font-semibold mb-2">
                      ${product.price.toFixed(2)}
                    </p>
                    {product.category && (
                      <Badge variant="outline" className="self-start mb-2">
                        {product.category}
                      </Badge>
                    )}
                    {product.description && (
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                        {product.description}
                      </p>
                    )}
                    <div className="flex justify-between mt-auto pt-2">
                      <span className="text-sm text-gray-500">
                        {product.inventoryCount > 0
                          ? `${product.inventoryCount} in stock`
                          : "Out of stock"}
                      </span>
                      {product.isDigital && (
                        <Badge variant="secondary">Digital</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default StoreMarketplace;
