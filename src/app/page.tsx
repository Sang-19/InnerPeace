import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { Logo } from '@/components/shared/logo';

export default function LoginPage() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center py-12 px-4">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-4 text-center">
          <Logo />
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-balance text-muted-foreground">
            Login to access your mental wellness dashboard.
          </p>
        </div>
        <LoginForm />
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
