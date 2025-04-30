
import React from "react";
import { Product } from "@/types/merchant";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        {product.isDigital && (
          <div className="absolute top-2 right-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
              Digital
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {product.description || "No description provided"}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-semibold">${product.price.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">
            Stock: {product.isDigital ? "∞" : product.inventoryCount}
          </span>
        </div>
      </div>
    </div>
  );
};
