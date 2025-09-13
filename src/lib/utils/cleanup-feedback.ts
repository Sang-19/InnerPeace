'use client';

import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

export async function cleanupFeedbackData() {
  try {
    console.log('Starting feedback data cleanup...');
    
    const feedbackCollection = collection(db, 'feedback');
    const snapshot = await getDocs(feedbackCollection);
    
    let processedCount = 0;
    let deletedCount = 0;
    let updatedCount = 0;
    
    for (const docRef of snapshot.docs) {
      const data = docRef.data();
      processedCount++;
      
      console.log(`Processing feedback ${docRef.id}:`, {
        hasDate: !!data.date,
        hasMessage: !!data.message,
        hasFeedback: !!data.feedback,
        hasStudentName: !!data.studentName,
        dateType: typeof data.date
      });
      
      // Check if document is corrupted or missing essential fields
      if (!data.studentName && !data.studentId) {
        console.log(`Deleting corrupted feedback ${docRef.id} - missing student info`);
        await deleteDoc(doc(db, 'feedback', docRef.id));
        deletedCount++;
        continue;
      }
      
      // Fix missing date
      if (!data.date) {
        console.log(`Updating feedback ${docRef.id} - adding missing date`);
        await updateDoc(doc(db, 'feedback', docRef.id), {
          date: new Date(), // Use current date as fallback
        });
        updatedCount++;
      }
      
      // Fix missing sentiment for old feedback with rating
      if (!data.sentiment && data.rating) {
        const sentiment = data.rating >= 4 ? 'Positive' : data.rating <= 2 ? 'Negative' : 'Neutral';
        console.log(`Updating feedback ${docRef.id} - adding sentiment based on rating`);
        await updateDoc(doc(db, 'feedback', docRef.id), {
          sentiment: sentiment,
        });
        updatedCount++;
      }
    }
    
    console.log('Feedback cleanup completed:', {
      processed: processedCount,
      deleted: deletedCount,
      updated: updatedCount
    });
    
    return {
      success: true,
      processed: processedCount,
      deleted: deletedCount,
      updated: updatedCount
    };
    
  } catch (error) {
    console.error('Error during feedback cleanup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
