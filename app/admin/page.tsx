"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Package, Clock, CheckCircle, Loader2, ShoppingBag, Users, DollarSign, AlertCircle, Trash2, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  cancelReason?: string;
  deliveredConfirmed?: boolean;
  feedbackRating?: number;
  feedbackComment?: string;
  isDeleted?: boolean;
  deletedBy?: 'admin' | 'user';
  deletedAt?: any;
  createdAt: { seconds: number; nanoseconds: number };
  customerInfo: {
    name: string;
    phone: string;
    location: string;
    notes: string;
  };
}

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  preparing: { label: 'Preparing', icon: Package, color: 'bg-blue-100 text-blue-800' },
  ready: { label: 'Ready', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Cancelled', icon: AlertCircle, color: 'bg-rose-100 text-rose-800' },
};

export default function AdminPage() {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [activeCancelOrder, setActiveCancelOrder] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (userData && !userData.isAdmin) {
        router.push('/dashboard');
        toast.error('Access denied. Admin only.');
      }
    }
  }, [user, userData, authLoading, router]);

  useEffect(() => {
    async function fetchAllOrders() {
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const fetchedOrders: Order[] = [];
        querySnapshot.forEach((doc) => {
          fetchedOrders.push({
            id: doc.id,
            ...doc.data(),
          } as Order);
        });
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    }

    if (user && userData?.isAdmin) {
      fetchAllOrders();
    }
  }, [user, userData]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
        )
      );
      
      toast.success('Order status updated');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleStartCancel = (orderId: string) => {
    setActiveCancelOrder(orderId);
    setCancelReason('');
  };

  const handleCancelOrder = async (orderId: string) => {
    setUpdatingOrder(orderId);
    try {
      const trimmedReason = cancelReason.trim() || 'Cancelled by admin';
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'cancelled',
        cancelReason: trimmedReason,
      });

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId
            ? { ...order, status: 'cancelled', cancelReason: trimmedReason }
            : order,
        ),
      );

      toast.success('Order cancelled');
      setActiveCancelOrder(null);
      setCancelReason('');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setUpdatingOrder(orderId);
    try {
      const orderRef = doc(db, 'orders', orderId);
      const timestamp = new Date();
      await updateDoc(orderRef, {
        isDeleted: true,
        deletedBy: 'admin',
        deletedAt: timestamp,
      });

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId
            ? { ...order, isDeleted: true, deletedBy: 'admin', deletedAt: timestamp }
            : order,
        ),
      );

      toast.success('Order moved to deleted orders');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    } finally {
      setUpdatingOrder(null);
    }
  };

  if (authLoading || !user || !userData?.isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeOrders = orders.filter(order => !order.isDeleted);
  const deletedOrders = orders.filter(order => order.isDeleted);
  const totalRevenue = activeOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = activeOrders.filter(o => o.status === 'pending').length;
  const preparingOrders = activeOrders.filter(o => o.status === 'preparing').length;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Manage orders and track your business</p>
          </div>
          <Button asChild>
            <Link href="/admin/products">
              <UtensilsCrossed className="mr-2 h-4 w-4" />
              Manage Products
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
              <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{pendingOrders}</p>
                <p className="text-muted-foreground text-sm">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{preparingOrders}</p>
                <p className="text-muted-foreground text-sm">Preparing</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">RM{totalRevenue.toFixed(2)}</p>
                <p className="text-muted-foreground text-sm">Revenue</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground">All Orders</CardTitle>
            <CardDescription>
              View and manage all customer orders
            </CardDescription>
            <div className="mt-2">
              <a href="#deleted-orders" className="text-sm text-primary hover:underline">
                View deleted orders
              </a>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">No Active Orders</h3>
                <p className="text-muted-foreground">
                  There are no active orders right now. Check the deleted orders section below.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {activeOrders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.pending;
                  const orderDate = order.createdAt 
                    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A';

                  return (
                    <div
                      key={order.id}
                      className="p-6 rounded-lg border border-border bg-card"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold text-card-foreground">
                              Order #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{orderDate}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusUpdate(order.id, value)}
                            disabled={updatingOrder === order.id}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Update status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="preparing">Preparing</SelectItem>
                              <SelectItem value="ready">Ready</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          {updatingOrder === order.id && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                          {order.status !== 'cancelled' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartCancel(order.id)}
                              disabled={updatingOrder === order.id}
                            >
                              Cancel Order
                            </Button>
                          )}
                          {order.status === 'cancelled' && !order.isDeleted && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-rose-600 hover:bg-rose-50"
                              onClick={() => handleDeleteOrder(order.id)}
                              disabled={updatingOrder === order.id}
                              aria-label="Delete cancelled order"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {activeCancelOrder === order.id && (
                          <div className="mt-4 space-y-3">
                            <textarea
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              placeholder="Reason for cancellation"
                              className="w-full min-h-[100px] rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <div className="flex flex-wrap gap-3">
                              <Button
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={updatingOrder === order.id}
                              >
                                Confirm Cancel
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setActiveCancelOrder(null)}
                                disabled={updatingOrder === order.id}
                              >
                                Dismiss
                              </Button>
                            </div>
                          </div>
                        )}
                        {order.cancelReason && (
                          <p className="mt-4 text-sm text-rose-700">
                            <strong>Cancel reason:</strong> {order.cancelReason}
                          </p>
                        )}

                        {order.deliveredConfirmed && (
                          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                            <p className="font-semibold">Delivery confirmed by customer.</p>
                            {order.feedbackRating != null && (
                              <p>Rating: {order.feedbackRating} / 5</p>
                            )}
                          </div>
                        )}

                        {order.feedbackComment && (
                          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-card-foreground">
                            <p className="font-semibold mb-2">Customer feedback</p>
                            <p>{order.feedbackComment}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Info */}
                        <div>
                          <h4 className="font-medium text-card-foreground mb-2 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Customer Details
                          </h4>
                          <div className="space-y-1 text-sm">
                            <p className="text-card-foreground"><strong>Name:</strong> {order.customerInfo?.name || 'N/A'}</p>
                            <p className="text-card-foreground"><strong>Phone:</strong> {order.customerInfo?.phone || 'N/A'}</p>
                            <p className="text-card-foreground"><strong>Address:</strong> {order.customerInfo?.location || 'N/A'}</p>
                            {order.customerInfo?.notes && (
                              <p className="text-muted-foreground">
                                <strong>Notes:</strong> {order.customerInfo.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Order Items */}
                        <div>
                          <h4 className="font-medium text-card-foreground mb-2 flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4" />
                            Order Items
                          </h4>
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
                            <Separator />
                            <div className="flex justify-between font-semibold">
                              <span className="text-card-foreground">Total</span>
                              <span className="text-primary">RM{order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        {deletedOrders.length > 0 && (
          <Card id="deleted-orders" className="mt-8">
            <CardHeader>
              <CardTitle className="text-card-foreground">Deleted Orders</CardTitle>
              <CardDescription>
                Orders that have been removed from the active list.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deletedOrders.map((order) => {
                  const deletedDate = order.deletedAt
                    ? order.deletedAt.seconds
                      ? new Date(order.deletedAt.seconds * 1000)
                      : new Date(order.deletedAt)
                    : null;

                  return (
                    <div key={order.id} className="rounded-2xl border border-border bg-muted p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <p className="font-semibold text-card-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                        <Badge className="bg-rose-100 text-rose-800">Deleted</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Deleted by {order.deletedBy || 'admin'}{deletedDate ? ` on ${deletedDate.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}` : ''}
                      </p>
                      {order.cancelReason && (
                        <p className="mt-2 text-sm text-rose-700">
                          <strong>Reason:</strong> {order.cancelReason}
                        </p>
                      )}
                      <div className="mt-3 text-sm text-muted-foreground">
                        <span className="font-semibold">Total:</span> RM{order.total.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
