import { User } from 'firebase/auth';

export type Mood = 'Happy' | 'Neutral' | 'Sad' | 'Anxious' | 'Angry';

export type MoodLog = {
  id: string;
  date: Date;
  mood: Mood;
  userId: string;
};

export type JournalEntry = {
  id: string;
  date: { seconds: number, nanoseconds: number };
  content: string;
  userId: string;
};

export type AppUser = {
  uid: string;
  name: string;
  email: string | null;
  role: 'student' | 'admin';
  contact?: string;
  department?: string;
  year?: string;
  avatarUrl?: string;
};

export type Student = AppUser & {
  role: 'student';
  progress?: number;
};

export type Admin = AppUser & {
  role: 'admin';
};

export type CommunityMessage = {
  id: string;
  senderId: string;
  message: string;
  timestamp: { seconds: number, nanoseconds: number };
  isHarmful: boolean;
  status: 'visible' | 'hidden' | 'reported';
};

export type CommunityReport = {
  id: string;
  studentId: string;
  studentName: string;
  message: string;
  date: Date;
  status: 'pending' | 'reviewed';
  messageId: string;
};

export type Feedback = {
  id: string;
  studentId: string;
  studentName: string;
  message: string;
  date: Date;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
};

export type AdminTask = {
  id: string;
  task: string;
  status: 'pending' | 'completed';
};

export type EmergencyAlert = {
  id: string;
  studentId: string;
  studentName: string;
  message: string;
  date: { seconds: number; nanoseconds: number; };
  status: 'pending' | 'resolved';
};

export type RelaxationGuide = {
  id: string;
  title: string;
  description: string;
  type: 'breathing' | 'meditation' | 'yoga';
  steps: string[];
  duration?: number; // in minutes
  imageId?: string;
};

export type Helpline = {
  id:string;
  name: string;
  contact: string;
  type: 'phone' | 'email' | 'chat';
};
