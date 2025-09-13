'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Book,
  HeartPulse,
  Phone,
  Settings,
  LogOut,
  PanelLeft,
  MessageCircle,
} from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { UserNav } from '@/components/shared/user-nav';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { AI_Chatbot } from '@/components/student/ai-chatbot';
import { DailySupportQuestion } from '@/components/student/daily-support-question';
import { useEffect } from 'react';

const studentNavItems = [
  { href: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/student/journal', icon: Book, label: 'Journal' },
  { href: '/student/community', icon: MessageCircle, label: 'Community' },
  { href: '/student/relaxation', icon: HeartPulse, label: 'Relaxation' },
  { href: '/student/helpline', icon: Phone, label: 'Helpline' },
  { href: '/student/settings', icon: Settings, label: 'Settings' },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { appUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    if (!loading && (!appUser || appUser.role !== 'student')) {
      router.push('/');
    }
  }, [appUser, loading, router]);


  if (loading || !appUser || appUser.role !== 'student') {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const NavContent = () => (
    <>
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/student/dashboard" className="flex items-center gap-2 font-semibold">
          <Logo />
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {studentNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                pathname.startsWith(item.href) ? 'bg-muted text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
         <Button variant="secondary" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar z-30 border-r">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <NavContent />
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 overflow-y-auto">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 bg-card">
              <NavContent />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Can add search bar here */}
          </div>
          <UserNav user={appUser} onLogout={handleLogout} />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background relative">
          {children}
          <AI_Chatbot />
          <DailySupportQuestion />
        </main>
      </main>
    </div>
  );
}
