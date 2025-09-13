import Image from 'next/image';
import Link from 'next/link';
import { SignUpForm } from '@/components/auth/signup-form';
import { Logo } from '@/components/shared/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function SignUpPage() {
  const loginImage = PlaceHolderImages.find(p => p.id === 'login-image');

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
       <div className="hidden bg-muted lg:block">
        {loginImage && (
          <Image
            src={loginImage.imageUrl}
            alt="Inner_Peace-SignUp"
            width="1920"
            height="1080"
            className="h-full w-full object-cover"
            data-ai-hint={loginImage.imageHint}
          />
        )}
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <Logo />
            <h1 className="text-3xl font-bold">Create an Account</h1>
            <p className="text-balance text-muted-foreground">
              Enter your details below to create your account
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
    </div>
  );
}
