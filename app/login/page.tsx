import { AuthForm } from '@/components/auth-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Login - Nobatia',
  description: 'Sign in to your Nobatia account',
};

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-secondary/20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-serif text-foreground">Nobatia</h1>
          <p className="text-muted-foreground mt-2">Welcome back to authentic taste</p>
        </div>
        <AuthForm mode="login" />
        <div className="mt-8 rounded-3xl bg-card border border-border p-6 text-center shadow-sm">
          <p className="text-sm text-muted-foreground mb-4">
            Sign in to access the Nobatia menu and place your order in RM.
          </p>
          <Button asChild className="w-full">
            <Link href="/menu">Order Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
