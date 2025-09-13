'use server';

import { revalidatePath } from 'next/cache';
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Mood } from './types';
import { analyzeCommunityReport } from '@/ai/flows/community-report-analysis';

export async function sendEmergencyAlert(formData: FormData) {
  const studentId = formData.get('studentId') as string;
  const studentName = formData.get('studentName') as string;
  const studentEmail = formData.get('studentEmail') as string;
  const message = formData.get('message') as string;

  if (!studentId || !studentName || !studentEmail) {
    return { error: 'User information is missing.' };
  }

  try {
    await addDoc(collection(db, 'alerts'), {
      studentId,
      studentName,
      studentEmail,
      message: message || 'Urgent assistance requested.',
      timestamp: serverTimestamp(),
      status: 'pending',
    });
    return { success: 'Alert sent successfully.' };
  } catch (error) {
    return { error: 'Failed to send alert. Please try again.' };
  }
}

export async function addJournalEntry(formData: FormData) {
    const userId = formData.get('userId') as string;
    const content = formData.get('content') as string;

    if (!userId || !content) {
        return { error: 'User ID and content are required.' };
    }

    try {
        await addDoc(collection(db, `users/${userId}/journalEntries`), {
            content: content,
            date: serverTimestamp(),
        });
        revalidatePath('/student/journal');
        return { success: 'Journal entry added.' };
    } catch (error) {
        console.error("Error adding journal entry:", error);
        return { error: 'Failed to add journal entry.' };
    }
}

export async function sendCommunityMessage(formData: FormData) {
  const senderId = formData.get('senderId') as string;
  const message = formData.get('message') as string;

  if (!senderId || !message) {
    return { error: 'Sender ID and message are required.' };
  }

  try {
    const analysis = await analyzeCommunityReport({ message });

    await addDoc(collection(db, 'community-chat'), {
      senderId,
      message,
      timestamp: serverTimestamp(),
      isHarmful: analysis.isHarmful,
      status: analysis.isHarmful ? 'reported' : 'visible',
    });
    
    if (analysis.isHarmful) {
       await addDoc(collection(db, 'community-reports'), {
            messageId: 'N/A', // We don't have the doc ID yet, but can be updated later if needed.
            studentId: senderId,
            studentName: 'Anonymous',
            message: message,
            date: serverTimestamp(),
            status: 'pending',
        });
    }

    revalidatePath('/student/community');

    if (analysis.isHarmful) {
      return { success: 'Message sent. Please be mindful of our community guidelines.', warning: true };
    }
    return { success: 'Message sent.' };

  } catch (error) {
    console.error(error);
    return { error: 'Failed to send message.' };
  }
}

export async function reportCommunityMessage(formData: FormData) {
    const messageId = formData.get('messageId') as string;
    const studentId = formData.get('studentId') as string;
    const studentName = formData.get('studentName') as string;
    const message = formData.get('message') as string;

    if (!messageId || !studentId || !studentName || !message) {
        return { error: 'Missing required information for reporting.' };
    }

    try {
        const messageRef = doc(db, 'community-chat', messageId);
        await updateDoc(messageRef, { status: 'reported' });

        await addDoc(collection(db, 'community-reports'), {
            messageId,
            studentId,
            studentName,
            message,
            date: serverTimestamp(),
            status: 'pending',
        });
        
        revalidatePath('/student/community');
        return { success: 'Message reported.' };
    } catch (error)
    {
        console.error(error);
        return { error: 'Failed to report message.' };
    }
}

export async function submitMood(formData: FormData) {
  const userId = formData.get('userId') as string;
  const mood = formData.get('mood') as Mood;

  if (!userId || !mood) {
    return { error: 'User ID and mood are required.' };
  }

  try {
    // Add to mood-logs collection for historical tracking
    await addDoc(collection(db, `users/${userId}/mood-logs`), {
      mood,
      date: serverTimestamp(),
    });

    // Update the latest mood on the user's document for quick access
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      latestMood: {
        mood,
        date: serverTimestamp(),
      },
    });

    revalidatePath('/student/dashboard');
    return { success: 'Mood submitted successfully.' };
  } catch (error) {
    console.error('Error submitting mood:', error);
    return { error: 'Failed to submit mood.' };
  }
}