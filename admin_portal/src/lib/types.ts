export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'student';
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
  updatedBy?: string;
  lastLoginAt?: number;
  isActive?: boolean;
}

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: number;
}

export interface QuizResult {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  completedAt: number;
}