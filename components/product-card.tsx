"use client";

import Image from 'next/image';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Plus } from 'lucide-react';
import { toast } from 'sonner';

// ============================
// PRODUCT TYPE DEFINITION
// ============================

export interface Product {
  id: string;
  // TODO: Put product name here
  name: string;
  // TODO: Put product description here
  description: string;
  // TODO: Put product price here
  price: number;
  // TODO: Put product image base64 string here
  imageBase64: string;
  createdAt?: Date;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  // ============================
  // ADMIN EDIT SECTION
  // Replace values below
  // ============================

  // Put image base64 string here
  const imageSource = product.imageBase64;
  // Put product price here
  const productPrice = product.price;
  // Put description here
  const productDescription = product.description;
  // Put product name here
  const productName = product.name;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: productName,
      price: productPrice,
      imageBase64: imageSource,
    });
    toast.success(`${productName} added to cart!`);
  };

  return (
    <Card className="group overflow-hidden rounded-2xl border border-border hover:shadow-lg transition-all duration-300">
      {/* image here */}
      {/* Product image (base64 from Firestore) */}
      <div className="relative h-64 overflow-hidden bg-muted">
        {imageSource ? (
          <Image
            src={imageSource}
            alt={productName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            {/* TODO: Put product image base64 string here */}
            No Image Available
          </div>
        )}
      </div>

      <CardContent className="p-6">
        {/* Product name */}
        {/* name here */}
        <h3 className="text-xl font-semibold text-card-foreground mb-2">
          {/* TODO: Put product name here */}
          {productName}
        </h3>
        
        {/* description here */}
        {/* Product description */}
        <p className="text-muted-foreground leading-relaxed mb-4">
          {/* TODO: Put product description here */}
          {productDescription}
        </p>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex items-center justify-between">
        {/* price here */}
        {/* Product price */}
        <span className="text-2xl font-bold text-primary">
          RM{productPrice.toFixed(2)}
        </span>
        
        {/* Add to cart button */}
        <Button onClick={handleAddToCart} className="gap-2">
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}

// ============================
// PRODUCT CARD SKELETON
// For loading states
// ============================

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl border border-border">
      <div className="h-64 bg-muted animate-pulse" />
      <CardContent className="p-6">
        <div className="h-6 bg-muted rounded animate-pulse mb-2 w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
      </CardContent>
      <CardFooter className="p-6 pt-0 flex items-center justify-between">
        <div className="h-8 bg-muted rounded animate-pulse w-20" />
        <div className="h-10 bg-muted rounded animate-pulse w-32" />
      </CardFooter>
    </Card>
  );
}
