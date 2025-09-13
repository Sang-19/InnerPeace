
import Link from 'next/link';
import { SignUpForm } from '@/components/auth/signup-form';
import { Logo } from '@/components/shared/logo';

export default function SignUpPage() {
  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Create an Account</h1>
            <p className="text-balance text-muted-foreground">
              Enter your details below to start your journey.
            </p>
          </div>
          <SignUpForm />
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/" className="underline">
              Login
            </Link>
          </div>
        </div>
      </div>
       <div className="hidden lg:flex flex-col items-center justify-center bg-primary/10 p-10 text-center">
        <Logo />
        <p className="mt-6 text-lg text-muted-foreground italic">
          &ldquo;The journey of a thousand miles begins with a single step.&rdquo;
        </p>
      </div>
    </div>
  );
}
