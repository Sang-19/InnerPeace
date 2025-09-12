'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/firebase';
import { AppUser } from '@/lib/types';
import { usePathname, useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  loading: true,
});

const publicRoutes = ['/', '/signup'];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as AppUser;
          setAppUser(userData);
          if (publicRoutes.includes(pathname)) {
             router.push(userData.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
          }
        } else {
          // New user, potentially during signup process
          setAppUser(null);
        }
      } else {
        setUser(null);
        setAppUser(null);
        if (!publicRoutes.includes(pathname)) {
            router.push('/');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <AuthContext.Provider value={{ user, appUser, loading }}>{children}</AuthContext.Provider>;
};
