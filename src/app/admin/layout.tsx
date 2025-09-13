'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  MessageSquareWarning,
  Star,
  Settings,
  LogOut,
  Bell,
  PanelLeft,
  ShieldAlert,
} from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { UserNav } from '@/components/shared/user-nav';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/firebase';
import { useEffect, useState, useRef } from 'react';
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const adminNavItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/students', icon: Users, label: 'Students' },
  { href: '/admin/emergency', icon: ShieldAlert, label: 'Emergency' },
  { href: '/admin/reports', icon: MessageSquareWarning, label: 'Reports' },
  { href: '/admin/feedback', icon: Star, label: 'Feedback' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { appUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [alertCount, setAlertCount] = useState(0);
  const { toast } = useToast();
  const prevAlertCountRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (!loading && (!appUser || appUser.role !== 'admin')) {
      router.push('/');
    }
  }, [appUser, loading, router]);

  useEffect(() => {
    // Query for pending alerts only to get accurate count
    const q = query(
      collection(db, 'alerts'),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const currentAlertCount = querySnapshot.size;
      const pendingAlerts = querySnapshot.docs.filter(doc => 
        doc.data().status !== 'resolved'
      );
      
      setAlertCount(pendingAlerts.length);
      
      // Show toast notification for new alerts (but not on initial load)
      if (!isInitialLoadRef.current && currentAlertCount > prevAlertCountRef.current) {
        const newAlerts = querySnapshot.docs.slice(0, currentAlertCount - prevAlertCountRef.current);
        
        newAlerts.forEach(doc => {
          const data = doc.data();
          if (data.status !== 'resolved') {
            toast({
              title: '🚨 Emergency Alert!',
              description: `${data.studentName} has triggered an emergency alert. Click to view details.`,
              variant: 'destructive',
              action: (
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/emergency">View Alert</Link>
                </Button>
              ),
            });
          }
        });
      }
      
      prevAlertCountRef.current = currentAlertCount;
      
      // After first load, enable notifications
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
      }
    });

    return () => unsubscribe();
  }, [toast]);

  if (loading || !appUser || appUser.role !== 'admin') {
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
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {adminNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
                    <div className="flex items-center gap-2">
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );

  const MobileNav = () => (
    <nav className="grid gap-2 text-lg font-medium">
      <div className="flex items-center gap-2 text-lg font-semibold mb-4">
        <Logo />
        <span className="sr-only">Inner Peace</span>
      </div>
      {adminNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${pathname.startsWith(item.href) ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-card md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <NavContent />
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-6 bg-card">
                <MobileNav />
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
              {/* Can add search bar here */}
            </div>
            <Button asChild variant="ghost" size="icon" className="rounded-full relative">
              <Link href="/admin/emergency">
                <Bell className="h-5 w-5" />
                {alertCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                    {alertCount}
                  </Badge>
                )}
                <span className="sr-only">Toggle notifications</span>
              </Link>
            </Button>
            <UserNav user={appUser} onLogout={handleLogout} />
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
  );
}
