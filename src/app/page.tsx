
import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { Logo } from '@/components/shared/logo';

export default function LoginPage() {
  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-4 text-center">
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
      <div className="hidden lg:flex flex-col items-center justify-center bg-primary/10 p-10 text-center">
        <Logo />
        <p className="mt-6 text-lg text-muted-foreground italic">
          &ldquo;The greatest wealth is peace of mind.&rdquo;
        </p>
      </div>
    </div>
  );
}
