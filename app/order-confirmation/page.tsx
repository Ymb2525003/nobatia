"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, MessageCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderData {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  customerInfo: {
    name: string;
    phone: string;
    location: string;
    notes: string;
  };
  createdAt: { seconds: number; nanoseconds: number };
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() } as OrderData);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  const generateWhatsAppMessage = () => {
    if (!order) return '';
    const itemsList = order.items
      .map((item) => `• ${item.name} x${item.quantity} — RM${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');
    const message = `Hello Nobatia! 🍚\n\nI just placed an order:\n\nOrder #${order.id.slice(0, 8).toUpperCase()}\n${itemsList}\n\nTotal: RM${order.total.toFixed(2)}\n\nName: ${order.customerInfo.name}\nPhone: ${order.customerInfo.phone}\nAddress: ${order.customerInfo.location}${order.customerInfo.notes ? `\nNotes: ${order.customerInfo.notes}` : ''}\n\nThank you!`;
    return encodeURIComponent(message);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-serif text-foreground mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">We couldn't find this order.</p>
          <Button asChild>
            <Link href="/menu">Back to Menu</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold font-serif text-foreground mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-muted-foreground">
            Thank you for your order, {order.customerInfo.name}. We'll start preparing it right away.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-card-foreground">
                    {item.name} x {item.quantity}
                  </span>
                  <span className="text-muted-foreground">
                    RM{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between font-semibold">
              <span className="text-card-foreground">Total</span>
              <span className="text-primary">RM{order.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Delivery Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Name:</strong> {order.customerInfo.name}</p>
            <p><strong>Phone:</strong> {order.customerInfo.phone}</p>
            <p><strong>Address:</strong> {order.customerInfo.location}</p>
            {order.customerInfo.notes && (
              <p><strong>Notes:</strong> {order.customerInfo.notes}</p>
            )}
          </CardContent>
        </Card>

        {/* WhatsApp Notification */}
        <Card className="mb-6 border-emerald-200 bg-emerald-50">
          <CardContent className="p-6">
            <div className="text-center">
              <MessageCircle className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Notify us on WhatsApp
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Join our WhatsApp group to stay updated on your order status and receive notifications when it's ready.
              </p>
              <a
                href={`https://wa.me/60${''/*replace with your number*/}?text=${generateWhatsAppMessage()}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                <MessageCircle className="h-5 w-5" />
                Send via WhatsApp
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/dashboard">
              Track Your Order
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/menu">Order More</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
