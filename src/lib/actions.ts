'use server';

import { revalidatePath } from 'next/cache';
import { addDoc, collection, serverTimestamp, doc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Mood } from './types';
import { analyzeCommunityReport } from '@/ai/flows/community-report-analysis';

export async function sendEmergencyAlert(formData: FormData) {
  const studentId = formData.get('studentId') as string;
  const studentName = formData.get('studentName') as string;
  const studentEmail = formData.get('studentEmail') as string;
  const locationLink = formData.get('locationLink') as string;

  console.log('sendEmergencyAlert called with:', {
    studentId: studentId ? '[REDACTED]' : 'MISSING',
    studentName: studentName || 'MISSING',
    studentEmail: studentEmail ? '[REDACTED]' : 'MISSING',
    locationLink: locationLink ? '[REDACTED]' : 'MISSING'
  });

  if (!studentId || !studentName || !studentEmail) {
    console.error('Missing required user information:', { studentId: !!studentId, studentName: !!studentName, studentEmail: !!studentEmail });
    return { success: false, error: 'User information is missing.' };
  }

  try {
    console.log('Creating alert document...');
    // Create the alert document
    const alertRef = await addDoc(collection(db, 'alerts'), {
      studentId,
      studentName,
      studentEmail,
      locationLink: locationLink || null,
      timestamp: serverTimestamp(),
      status: 'pending',
      resolvedAt: null,
      resolvedBy: null,
    });
    console.log('Alert document created:', alertRef.id);

    console.log('Fetching admin users...');
    // Get the admin users to notify
    const adminUsers = await getDocs(
      query(collection(db, 'users'), where('role', '==', 'admin'))
    );
    console.log('Found admin users:', adminUsers.docs.length);

    if (adminUsers.docs.length > 0) {
      console.log('Creating notifications for admins...');
      // Create notifications for each admin
      const notifications = adminUsers.docs.map((adminDoc) => {
        return addDoc(collection(db, 'notifications'), {
          userId: adminDoc.id,
          type: 'emergency_alert',
          title: 'New Emergency Alert',
          message: `${studentName} (${studentEmail}) has triggered an emergency alert.`,
          read: false,
          relatedId: alertRef.id,
          timestamp: serverTimestamp(),
        });
      });

      await Promise.all(notifications);
      console.log('Notifications created successfully');
    } else {
      console.warn('No admin users found to notify');
    }
    
    return { success: true, message: 'Alert sent successfully.' };
  } catch (error) {
    console.error('Error sending emergency alert:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return { success: false, error: `Failed to send alert: ${error instanceof Error ? error.message : 'Unknown error'}` };
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
        // Don't change message status immediately - let it remain visible until admin review
        // const messageRef = doc(db, 'community-chat', messageId);
        // await updateDoc(messageRef, { status: 'reported' });

        await addDoc(collection(db, 'community-reports'), {
            messageId,
            studentId,
            studentName,
            message,
            date: serverTimestamp(),
            status: 'pending',
        });

        // Create notification for admins about new report
        const adminUsers = await getDocs(
            query(collection(db, 'users'), where('role', '==', 'admin'))
        );

        if (adminUsers.docs.length > 0) {
            const notifications = adminUsers.docs.map((adminDoc) => {
                return addDoc(collection(db, 'notifications'), {
                    userId: adminDoc.id,
                    type: 'community_report',
                    title: 'New Community Report',
                    message: `A message has been reported in the community chat and needs review.`,
                    read: false,
                    relatedId: messageId,
                    timestamp: serverTimestamp(),
                });
            });
            await Promise.all(notifications);
        }
        
        revalidatePath('/student/community');
        revalidatePath('/admin/reports');
        return { success: 'Message reported and sent for admin review.' };
    } catch (error)
    {
        console.error(error);
        return { error: 'Failed to report message.' };
    }
}

export async function approveReportedMessage(formData: FormData) {
  const reportId = formData.get('reportId') as string;
  const messageId = formData.get('messageId') as string;
  const adminId = formData.get('adminId') as string;
  const adminName = formData.get('adminName') as string;
  const adminComment = formData.get('adminComment') as string;

  if (!reportId || !messageId || !adminId || !adminName) {
    return { success: false, error: 'Missing required information.' };
  }

  try {
    // Update the report status to approved
    const reportRef = doc(db, 'community-reports', reportId);
    await updateDoc(reportRef, {
      status: 'approved',
      reviewedBy: adminName,
      reviewedAt: serverTimestamp(),
      adminComment: adminComment || 'Message approved for removal',
    });

    // Hide the message by updating its status
    const messageRef = doc(db, 'community-chat', messageId);
    await updateDoc(messageRef, { status: 'hidden' });

    revalidatePath('/admin/reports');
    revalidatePath('/student/community');
    return { success: true, message: 'Report approved and message hidden successfully.' };
  } catch (error) {
    console.error('Error approving report:', error);
    return { success: false, error: 'Failed to approve report.' };
  }
}

export async function rejectReportedMessage(formData: FormData) {
  const reportId = formData.get('reportId') as string;
  const adminId = formData.get('adminId') as string;
  const adminName = formData.get('adminName') as string;
  const adminComment = formData.get('adminComment') as string;

  if (!reportId || !adminId || !adminName) {
    return { success: false, error: 'Missing required information.' };
  }

  try {
    // Update the report status to rejected
    const reportRef = doc(db, 'community-reports', reportId);
    await updateDoc(reportRef, {
      status: 'rejected',
      reviewedBy: adminName,
      reviewedAt: serverTimestamp(),
      adminComment: adminComment || 'Report was not valid - message remains visible',
    });

    revalidatePath('/admin/reports');
    return { success: true, message: 'Report rejected successfully. Message remains visible.' };
  } catch (error) {
    console.error('Error rejecting report:', error);
    return { success: false, error: 'Failed to reject report.' };
  }
}

export async function resolveEmergencyAlert(formData: FormData) {
  const alertId = formData.get('alertId') as string;
  const adminId = formData.get('adminId') as string;
  const adminName = formData.get('adminName') as string;

  if (!alertId || !adminId || !adminName) {
    return { success: false, error: 'Missing required information.' };
  }

  try {
    const alertRef = doc(db, 'alerts', alertId);
    await updateDoc(alertRef, {
      status: 'resolved',
      resolvedAt: serverTimestamp(),
      resolvedBy: adminName,
      resolvedByUserId: adminId,
    });

    revalidatePath('/admin/emergency');
    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Alert resolved successfully.' };
  } catch (error) {
    console.error('Error resolving alert:', error);
    return { success: false, error: 'Failed to resolve alert.' };
  }
}

export async function submitMood(formData: FormData) {
  const userId = formData.get('userId') as string;
  const mood = formData.get('mood') as Mood;

  console.log('submitMood called with:', {
    userId: userId ? '[REDACTED]' : 'MISSING',
    mood: mood || 'MISSING'
  });

  if (!userId || !mood) {
    console.error('Missing required parameters:', { userId: !!userId, mood: !!mood });
    return { error: 'User ID and mood are required.' };
  }

  try {
    console.log('Adding mood to mood-logs collection...');
    // Add to mood-logs collection for historical tracking
    const moodLogRef = await addDoc(collection(db, `users/${userId}/mood-logs`), {
      mood,
      date: serverTimestamp(),
    });
    console.log('Mood log created:', moodLogRef.id);

    console.log('Updating user document with latest mood...');
    // Update the latest mood on the user's document for quick access
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      latestMood: {
        mood,
        date: serverTimestamp(),
      },
    });
    console.log('User document updated successfully');

    revalidatePath('/student/dashboard');
    return { success: 'Mood submitted successfully.' };
  } catch (error) {
    console.error('Error submitting mood:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return { error: `Failed to submit mood: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}
