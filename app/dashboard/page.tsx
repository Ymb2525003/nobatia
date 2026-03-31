"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Package, Clock, CheckCircle, Loader2, ShoppingBag, User, AlertCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  cancelReason?: string;
  deliveredConfirmed?: boolean;
  feedbackRating?: number;
  feedbackComment?: string;
  createdAt: { seconds: number; nanoseconds: number };
  customerInfo: {
    name: string;
    phone: string;
    location: string;
    notes: string;
  };
}

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, variant: 'secondary' as const },
  preparing: { label: 'Preparing', icon: Package, variant: 'default' as const },
  ready: { label: 'Ready', icon: CheckCircle, variant: 'outline' as const },
  delivered: { label: 'Delivered', icon: CheckCircle, variant: 'default' as const },
  cancelled: { label: 'Cancelled', icon: AlertCircle, variant: 'secondary' as const },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);
  const [activeFeedbackOrder, setActiveFeedbackOrder] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;

      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const fetchedOrders: Order[] = [];
        querySnapshot.forEach((doc) => {
          fetchedOrders.push({
            id: doc.id,
            ...doc.data(),
          } as Order);
        });
        setOrders(
          fetchedOrders.sort(
            (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
          ),
        );
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleCancelOrder = async (orderId: string) => {
    setDeletingOrder(orderId);
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      setOrders(prev => prev.filter((order) => order.id !== orderId));
      toast.success('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setDeletingOrder(null);
    }
  };

  const handleConfirmDelivery = (orderId: string) => {
    setActiveFeedbackOrder(orderId);
    setFeedbackRating(5);
    setFeedbackComment('');
  };

  const handleSubmitFeedback = async (orderId: string) => {
    if (!feedbackComment.trim()) {
      toast.error('Please leave a short comment about our service.');
      return;
    }

    setSubmittingFeedback(orderId);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        deliveredConfirmed: true,
        feedbackRating,
        feedbackComment: feedbackComment.trim(),
      });

      setOrders(prev =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                deliveredConfirmed: true,
                feedbackRating,
                feedbackComment: feedbackComment.trim(),
              }
            : order,
        ),
      );

      toast.success('بالعافية عليك يا حقيقي — Thank you for your feedback. Your review has been submitted.');
      setActiveFeedbackOrder(null);
      setFeedbackComment('');
      setFeedbackRating(5);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit your feedback.');
    } finally {
      setSubmittingFeedback(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-serif text-card-foreground">
                  Welcome, {userData?.name || 'User'}!
                </h1>
                <p className="text-muted-foreground">{userData?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{orders.length}</p>
                <p className="text-muted-foreground text-sm">Total Orders</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">
                  {orders.filter(o => o.status === 'pending' || o.status === 'preparing').length}
                </p>
                <p className="text-muted-foreground text-sm">Active Orders</p>
              </div>
            </CardContent>
          </Card>
          <Card className="flex items-center justify-center">
            <CardContent className="p-6 text-center">
              <Button asChild>
                <Link href="/menu">Order More</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {orders.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6 rounded-3xl border border-emerald-200 bg-emerald-50">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
                    <MessageCircle className="h-4 w-4" />
                    Order Tracking
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-foreground">Stay updated on your delivery</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Join our WhatsApp group and receive live updates when your order is ready and out for delivery.
                  </p>
                </div>
                <a
                  href="https://chat.whatsapp.com/JORv2XrrbFg80PpgjiJtHq?mode=gi_t"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  <MessageCircle className="h-5 w-5" />
                  Join WhatsApp Group
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground">Order History</CardTitle>
            <CardDescription>
              Track your past and current orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground mb-4">
                  You have not placed any orders. Start ordering delicious desserts!
                </p>
                <Button asChild>
                  <Link href="/menu">Browse Menu</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  const orderDate = order.createdAt 
                    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A';

                  return (
                    <div
                      key={order.id}
                      className="p-4 rounded-lg border border-border bg-card"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-sm text-muted-foreground">{orderDate}</p>
                        </div>
                        <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-2">
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

                      {order.cancelReason && (
                        <p className="text-sm text-rose-700 mb-3">
                          <strong>Cancel reason:</strong> {order.cancelReason}
                        </p>
                      )}

                      <div className="flex justify-between font-semibold">
                        <span className="text-card-foreground">Total</span>
                        <span className="text-primary">RM{order.total.toFixed(2)}</span>
                      </div>

                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            disabled={deletingOrder === order.id}
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            {deletingOrder === order.id ? 'Cancelling...' : 'Cancel Order'}
                          </Button>
                        </div>
                      )}

                      {order.status === 'delivered' && !order.deliveredConfirmed && (
                        <div className="mt-6 rounded-3xl border border-primary/20 bg-primary/5 p-5">
                          <p className="text-sm text-primary mb-4">
                            Has your order been delivered successfully?
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => handleConfirmDelivery(order.id)}
                          >
                            Yes, delivered
                          </Button>
                        </div>
                      )}

                      {order.status === 'delivered' && activeFeedbackOrder === order.id && (
                        <div className="mt-6 rounded-3xl border border-primary/20 bg-primary/5 p-5 space-y-4">
                          <p className="text-base font-semibold text-card-foreground">
                            Thank you for choosing Nobatia. We appreciate your business and value your feedback.
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Please rate your service experience and leave a short comment to help us improve.
                          </p>

                          <div className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <Button
                                key={value}
                                variant={feedbackRating === value ? 'default' : 'outline'}
                                className="px-3 py-2"
                                onClick={() => setFeedbackRating(value)}
                              >
                                {value}
                              </Button>
                            ))}
                          </div>

                          <textarea
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            placeholder="Share your feedback here"
                            className="w-full min-h-[100px] rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />

                          <div className="flex flex-wrap gap-3">
                            <Button
                              onClick={() => handleSubmitFeedback(order.id)}
                              disabled={submittingFeedback === order.id}
                            >
                              {submittingFeedback === order.id ? 'Submitting...' : 'Submit Feedback'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setActiveFeedbackOrder(null)}
                              disabled={submittingFeedback === order.id}
                            >
                              Not yet
                            </Button>
                          </div>
                        </div>
                      )}

                      {order.deliveredConfirmed && (
                        <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
                          <p className="font-semibold">Thank you for confirming delivery. Your feedback has been received.</p>
                          <p className="mt-3 font-semibold">بالعافية عليك يا حقيقي/ة</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
