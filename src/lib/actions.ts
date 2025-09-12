'use server';

import { revalidatePath } from 'next/cache';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Mood } from './types';

export async function sendEmergencyAlert(formData: FormData) {
  const studentId = formData.get('studentId') as string;
  const studentName = formData.get('studentName') as string;
  const message = formData.get('message') as string;

  if (!studentId || !studentName) {
    return { error: 'User information is missing.' };
  }

  try {
    await addDoc(collection(db, 'alerts'), {
      studentId,
      studentName,
      message: message || 'Urgent assistance requested.',
      date: serverTimestamp(),
      status: 'pending',
    });
    return { success: 'Alert sent successfully.' };
  } catch (error) {
    return { error: 'Failed to send alert. Please try again.' };
  }
}

export async function submitMood(formData: FormData) {
  const userId = formData.get('userId') as string;
  const mood = formData.get('mood') as Mood;

  if (!userId || !mood) {
    return { error: 'User ID and mood are required.' };
  }

  try {
    await addDoc(collection(db, 'users', userId, 'moodLogs'), {
      mood,
      date: serverTimestamp(),
    });
    revalidatePath('/student/dashboard');
    return { success: 'Mood logged successfully.' };
  } catch (error) {
    return { error: 'Failed to log mood.' };
  }
}

export async function addJournalEntry(formData: FormData) {
    const userId = formData.get('userId') as string;
    const content = formData.get('content') as string;

    if (!userId || !content) {
        return { error: 'User ID and content are required.' };
    }

    try {
        await addDoc(collection(db, 'users', userId, 'journalEntries'), {
            content,
            date: serverTimestamp(),
        });
        revalidatePath('/student/journal');
        return { success: 'Journal entry added.' };
    } catch (error) {
        return { error: 'Failed to add journal entry.' };
    }
}
