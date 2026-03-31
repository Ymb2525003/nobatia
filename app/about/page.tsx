import { Instagram, MapPin, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'About - Nobatia',
  description: 'Learn more about Nobatia and how to contact us.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">About Nobatia</p>
            <h1 className="mt-4 text-4xl font-bold font-serif text-foreground">Authentic Arabic Dessert with a Modern Touch</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl">
              Nobatia brings traditional Sudanese and Egyptian dessert recipes to your home. We focus on premium ingredients, comforting flavors, and friendly service so every order feels special.
            </p>
            <div className="mt-10 space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 text-primary">
                  <MapPin className="h-5 w-5" />
                  <span className="font-semibold">Location</span>
                </div>
                <p className="mt-3 text-sm text-foreground">Sri Pulai Perdana 2</p>
              </div>
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 text-primary">
                  <Mail className="h-5 w-5" />
                  <span className="font-semibold">Email</span>
                </div>
                <p className="mt-3 text-sm text-foreground">yaseenmb252003@gmail.com</p>
              </div>
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 text-primary">
                  <Instagram className="h-5 w-5" />
                  <span className="font-semibold">Instagram</span>
                </div>
                <p className="mt-3 text-sm text-foreground">
                  Follow us on Instagram for menu updates, promotions, and behind-the-scenes stories.
                </p>
                <Button
                  asChild
                  className="mt-4"
                >
                  <a
                    href="https://www.instagram.com/nobatia0249?igsh=azl3eG52NmtiMmZz&utm_source=qr"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visit Instagram
                  </a>
                </Button>
              </div>
            </div>
          </div>
          <div className="rounded-[2rem] border border-border bg-card p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground">Stay connected with Nobatia</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Join our Instagram community or contact us directly whenever you want to place an order or track your delivery. We are here to help and make every experience delightful.
            </p>
            <div className="mt-8 space-y-4">
              <a
                href="https://www.instagram.com/nobatia0249?igsh=azl3eG52NmtiMmZz&utm_source=qr"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground hover:border-primary hover:text-primary transition"
              >
                <Instagram className="h-5 w-5" />
                @nobatia0249
              </a>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4" /> Sri Pulai Perdana 2
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4" /> yaseenmb252003@gmail.com
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
