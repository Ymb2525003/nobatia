import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Clock, Truck, Instagram } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-dessert.jpg"
            alt="Delicious Nobatia dessert"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary">
              Traditional Recipe
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-serif text-foreground leading-tight text-balance">
              Authentic Arabic Nobatia Desserts
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
              Experience the rich, creamy taste of our traditional dessert. Made with love using recipes passed down through generations from Sudan and Egypt.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/menu">
                  Explore Menu
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="mt-10 rounded-3xl border border-border bg-card/80 p-8 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-primary">Follow Us</p>
                  <h2 className="text-xl font-semibold text-foreground">Stay inspired on Instagram</h2>
                  <p className="mt-2 text-muted-foreground max-w-xl">
                    Follow @nobatia0249 for new dessert releases, menu highlights, and special offers.
                  </p>
                </div>
                <a
                  href="https://www.instagram.com/nobatia0249?igsh=azl3eG52NmtiMmZz&utm_source=qr"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
                >
                  <Instagram className="h-5 w-5" />
                  Follow on Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-card border border-border">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Star className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Premium Quality</h3>
              <p className="text-muted-foreground">
                Made with the finest ingredients and traditional recipes
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-card border border-border">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Fresh Daily</h3>
              <p className="text-muted-foreground">
                Prepared fresh every day to ensure the best taste
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-card border border-border">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Truck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">
                Quick delivery to bring sweetness to your doorstep
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Preview Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4">
              Our Delicious Menu
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose from our selection of authentic Nobatia desserts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Product Card 1 */}
            <div className="group rounded-2xl overflow-hidden bg-card border border-border hover:shadow-lg transition-shadow">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src="/images/product-pure.png"
                  alt="Pure Rice with Milk"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Pure Rice with Milk</h3>
                <p className="text-muted-foreground mb-4">
                  Classic creamy rice pudding made with premium rice and fresh milk
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">RM8.99</span>
                  <Button asChild>
                    <Link href="/menu">Order</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Product Card 2 */}
            <div className="group rounded-2xl overflow-hidden bg-card border border-border hover:shadow-lg transition-shadow">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src="/images/product-lotus.jpg"
                  alt="Rice with Milk + Lotus"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Rice with Milk + Lotus</h3>
                <p className="text-muted-foreground mb-4">
                  Delicious rice pudding topped with crushed Lotus biscuits
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">RM10.99</span>
                  <Button asChild>
                    <Link href="/menu">Order</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Product Card 3 */}
            <div className="group rounded-2xl overflow-hidden bg-card border border-border hover:shadow-lg transition-shadow">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src="/images/product-raisins.jpg"
                  alt="Rice with Milk + Raisins"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Rice with Milk + Raisins</h3>
                <p className="text-muted-foreground mb-4">
                  Sweet rice pudding with golden raisins and almonds
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">RM9.99</span>
                  <Button asChild>
                    <Link href="/menu">Order</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link href="/menu">
                View Full Menu
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary-foreground mb-4">
            Ready to Taste Tradition?
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">
            Discover the authentic taste of our Nobatia dessert
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8">
            <Link href="/menu">
              Browse Menu
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
