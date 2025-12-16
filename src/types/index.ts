import { Timestamp } from 'firebase/firestore';

export interface Note {
  id: string;
  title: string;
  text: string;
  completed: boolean;
  isPinned: boolean;
  color: string;
  deadline: string;
  createdAt: Timestamp | null;
}