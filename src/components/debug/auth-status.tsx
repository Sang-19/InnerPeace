'use client';

import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Shield, AlertCircle, CheckCircle } from 'lucide-react';

export function AuthStatus() {
  const { appUser, loading } = useAuth();
  const firebaseUser = auth.currentUser;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading authentication status...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Authentication Status
        </CardTitle>
        <CardDescription>Debug information for authentication</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {firebaseUser ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Firebase User: Authenticated</span>
              <Badge variant="default">✓ Logged In</Badge>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>Firebase User: Not authenticated</span>
              <Badge variant="destructive">✗ Not Logged In</Badge>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {appUser ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>App User: Available</span>
              <Badge variant="default">✓ Profile Loaded</Badge>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>App User: Not available</span>
              <Badge variant="destructive">✗ Profile Missing</Badge>
            </>
          )}
        </div>

        {firebaseUser && (
          <div className="p-3 bg-muted rounded-md">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Firebase User Details:
            </h4>
            <div className="text-sm space-y-1">
              <p><strong>UID:</strong> {firebaseUser.uid}</p>
              <p><strong>Email:</strong> {firebaseUser.email}</p>
              <p><strong>Email Verified:</strong> {firebaseUser.emailVerified ? '✓' : '✗'}</p>
              <p><strong>Display Name:</strong> {firebaseUser.displayName || 'None'}</p>
            </div>
          </div>
        )}

        {appUser && (
          <div className="p-3 bg-muted rounded-md">
            <h4 className="font-semibold mb-2">App User Details:</h4>
            <div className="text-sm space-y-1">
              <p><strong>Name:</strong> {appUser.name}</p>
              <p><strong>Email:</strong> {appUser.email}</p>
              <p><strong>Role:</strong> {appUser.role}</p>
              <p><strong>Department:</strong> {appUser.department || 'None'}</p>
              <p><strong>Year:</strong> {appUser.year || 'None'}</p>
            </div>
          </div>
        )}

        {!firebaseUser && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> User is not authenticated with Firebase. 
              This will cause PERMISSION_DENIED errors when trying to access Firestore.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
