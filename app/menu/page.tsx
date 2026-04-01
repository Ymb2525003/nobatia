"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProductCard, ProductCardSkeleton, Product } from '@/components/product-card';
import { AlertCircle } from 'lucide-react';

// ============================
// DEFAULT PRODUCTS
// These are used when Firestore is not configured
// Replace with actual data from Firestore
// ============================

const defaultProducts: Product[] = [
  {
    id: '1',
    // TODO: Put product name here
    name: 'Pure Rice with Milk',
    // TODO: Put product description here
    description: 'Classic creamy rice pudding made with premium rice and fresh milk. Pure and simple, just the way it should be.',
    // TODO: Put product price here
    price: 8.99,
    // TODO: Put product image base64 string here
    imageBase64: '/images/product-pure.png',
  },
  {
    id: '2',
    // TODO: Put product name here
    name: 'Rice with Milk + Lotus',
    // TODO: Put product description here
    description: 'Our signature rice pudding generously topped with crushed Lotus Biscoff cookies for an irresistible caramel crunch.',
    // TODO: Put product price here
    price: 10.99,
    // TODO: Put product image base64 string here
    imageBase64: '/images/product-lotus.jpg',
  },
  {
    id: '3',
    // TODO: Put product name here
    name: 'Rice with Milk + Raisins (Zabeeb)',
    // TODO: Put product description here
    description: 'Traditional recipe featuring golden raisins and toasted almonds, bringing authentic Middle Eastern flavors to every spoon.',
    // TODO: Put product price here
    price: 9.99,
    // TODO: Put product image base64 string here
    imageBase64: '/images/product-raisins.jpg',
  },
  {
    id: '4',
    // TODO: Put product name here
    name: 'Rice with Milk + Chocolate',
    // TODO: Put product description here
    description: 'A rich and creamy rice pudding blended with smooth chocolate, topped with chocolate shavings for a decadent twist on the classic favorite.',
    // TODO: Put product price here
    price: 11.99,
    // Place your chocolate image in public/images/product-chocolate.png
    imageBase64: '/images/product-chocolate.png',
  },
];

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Fetch products from Firestore
        const productsRef = collection(db, 'products');
        const q = query(productsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          // Use default products if Firestore collection is empty
          setProducts(defaultProducts);
        } else {
          const fetchedProducts: Product[] = [];
          querySnapshot.forEach((doc) => {
            fetchedProducts.push({
              id: doc.id,
              ...doc.data(),
            } as Product);
          });
          setProducts(fetchedProducts);
        }
      } catch (err) {
        // Fallback to default products on error
        setProducts(defaultProducts);
        setError('Using demo products. Connect Firebase for live data.');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-4">
            Our Menu
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our selection of authentic Nobatia desserts, 
            made fresh daily with traditional recipes
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {error && (
            <div className="mb-8 p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-800">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No products available at the moment.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground mb-4">
              Made Fresh Daily
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Every bowl of our Nobatia dessert is prepared fresh using premium ingredients. 
              Our recipes have been passed down through generations, bringing you the authentic 
              taste of Sudan and Egypt. Order now and taste the tradition!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
