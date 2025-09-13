'use client';

import { db, auth } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export async function testFirebaseConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    console.log('Testing Firebase connection...');
    console.log('Current Firebase user:', auth.currentUser);
    console.log('User authentication state:', {
      isSignedIn: !!auth.currentUser,
      uid: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified
    });
    
    // Test 1: Try to read from a collection
    console.log('Test 1: Reading from users collection...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log('Users collection read successful, found', usersSnapshot.docs.length, 'documents');
    
    // Test 2: Try to write to a test collection
    console.log('Test 2: Writing to test collection...');
    const testDoc = await addDoc(collection(db, 'connection-test'), {
      message: 'Firebase connection test',
      timestamp: new Date(),
      test: true,
      userId: auth.currentUser?.uid || 'anonymous'
    });
    console.log('Test document created with ID:', testDoc.id);
    
    return {
      success: true,
      message: 'Firebase connection successful',
      details: {
        usersFound: usersSnapshot.docs.length,
        testDocId: testDoc.id,
        currentUser: auth.currentUser?.uid || 'Not authenticated'
      }
    };
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    console.log('Detailed error information:', {
      errorCode: (error as any)?.code,
      errorMessage: (error as any)?.message,
      currentUser: auth.currentUser?.uid || 'Not authenticated',
      timestamp: new Date().toISOString()
    });
    
    return {
      success: false,
      message: 'Firebase connection failed',
      details: {
        error: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        name: error instanceof Error ? error.name : 'Unknown',
        currentUser: auth.currentUser?.uid || 'Not authenticated'
      }
    };
  }
}
