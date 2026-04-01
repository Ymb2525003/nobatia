"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, ArrowLeft, ImageIcon, Download } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageBase64: string;
  createdAt?: any;
}

const defaultProducts = [
  {
    name: 'Pure Rice with Milk',
    description: 'Classic creamy rice pudding made with premium rice and fresh milk. Pure and simple, just the way it should be.',
    price: 8.99,
    imageBase64: '/images/product-pure.png',
  },
  {
    name: 'Rice with Milk + Lotus',
    description: 'Our signature rice pudding generously topped with crushed Lotus Biscoff cookies for an irresistible caramel crunch.',
    price: 10.99,
    imageBase64: '/images/product-lotus.jpg',
  },
  {
    name: 'Rice with Milk + Raisins (Zabeeb)',
    description: 'Traditional recipe featuring golden raisins and toasted almonds, bringing authentic Middle Eastern flavors to every spoon.',
    price: 9.99,
    imageBase64: '/images/product-raisins.jpg',
  },
  {
    name: 'Rice with Milk + Chocolate',
    description: 'A rich and creamy rice pudding blended with smooth chocolate, topped with chocolate shavings for a decadent twist on the classic favorite.',
    price: 11.99,
    imageBase64: '/images/product-chocolate.png',
  },
];

const emptyForm = { name: '', description: '', price: '', imageBase64: '' };

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

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
    async function fetchProducts() {
      try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const fetched: Product[] = [];
        snapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(fetched);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    if (user && userData?.isAdmin) {
      fetchProducts();
    }
  }, [user, userData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error('Image must be under 1MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, imageBase64: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleImportDefaults = async () => {
    setSaving(true);
    try {
      const imported: Product[] = [];
      for (const product of defaultProducts) {
        const docRef = await addDoc(collection(db, 'products'), {
          ...product,
          createdAt: serverTimestamp(),
        });
        imported.push({ id: docRef.id, ...product });
      }
      setProducts((prev) => [...imported, ...prev]);
      toast.success(`${imported.length} default products imported! You can now edit them.`);
    } catch (error) {
      console.error('Error importing defaults:', error);
      toast.error('Failed to import default products');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      imageBase64: product.imageBase64,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.description.trim() || !form.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setSaving(true);
    try {
      const productData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        imageBase64: form.imageBase64,
      };

      if (editingId) {
        // Update existing
        await updateDoc(doc(db, 'products', editingId), productData);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? { ...p, ...productData } : p)),
        );
        toast.success('Product updated');
      } else {
        // Create new
        const docRef = await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp(),
        });
        setProducts((prev) => [{ id: docRef.id, ...productData }, ...prev]);
        toast.success('Product added');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success('Product deleted');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  if (authLoading || !user || !userData?.isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-serif text-foreground">
              Manage Products
            </h1>
            <p className="text-muted-foreground mt-1">Add, edit, or remove menu items</p>
          </div>
        </div>

        {/* Add Product Button */}
        {!showForm && (
          <Button
            className="mb-6"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                {editingId ? 'Edit Product' : 'New Product'}
              </CardTitle>
              <CardDescription>
                {editingId ? 'Update the product details below' : 'Fill in the details for the new product'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Rice with Milk + Lotus"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the product..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  disabled={saving}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (RM) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 8.99"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <div className="flex items-center gap-4">
                  {form.imageBase64 && (
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-border">
                      <Image
                        src={form.imageBase64}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={saving}
                      className="w-auto"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Max 1MB. JPG, PNG recommended.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? 'Update Product' : 'Add Product'}
                </Button>
                <Button variant="outline" onClick={resetForm} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground">Products ({products.length})</CardTitle>
            <CardDescription>
              These products will appear on the menu page
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">No Products Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Your menu currently shows the 4 default products. Import them to Firestore so you can edit them, or add new ones.
                </p>
                <Button onClick={handleImportDefaults} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Download className="mr-2 h-4 w-4" />
                  Import Default Products
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border"
                  >
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {product.imageBase64 ? (
                        <Image
                          src={product.imageBase64}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-card-foreground truncate">{product.name}</h4>
                      <p className="text-sm text-muted-foreground truncate">{product.description}</p>
                      <p className="text-sm font-bold text-primary mt-1">RM{product.price.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-rose-600 hover:bg-rose-50"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
