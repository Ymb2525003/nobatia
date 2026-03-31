import { AuthForm } from '@/components/auth-form';

export const metadata = {
  title: 'Register - Nobatia',
  description: 'Create your Nobatia account',
};

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-secondary/20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-serif text-foreground">Nobatia</h1>
          <p className="text-muted-foreground mt-2">Join us for delicious desserts</p>
        </div>
        <AuthForm mode="register" />
      </div>
    </div>
  );
}
