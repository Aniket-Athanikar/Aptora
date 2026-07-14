// Exam Types
export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  passingScore: number;
  maxAttempts: number;
  isPublic: boolean;
  status: ExamStatus;
  category: string;
  tags: string[];
  authorId: string;
  author: PublicUser;
  questionCount: number;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export type ExamStatus = 'draft' | 'published' | 'archived' | 'under_review';

export interface ExamDetails extends Exam {
  questions: Question[];
  settings: ExamSettings;
  analytics: ExamAnalytics;
}

export interface ExamSettings {
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showResults: boolean;
  showCorrectAnswers: boolean;
  allowPause: boolean;
  preventCopy: boolean;
  showTimer: boolean;
  allowCalculator: boolean;
}

export interface ExamAnalytics {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  averageTime: number;
  passRate: number;
  completionRate: number;
}

export interface Question {
  id: string;
  examId: string;
  text: string;
  type: QuestionType;
  points: number;
  explanation?: string;
  imageUrl?: string;
  options?: QuestionOption[];
  correctAnswer?: string | string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'fill_blank';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  userId: string;
  status: AttemptStatus;
  score: number;
  maxScore: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  startedAt: string;
  completedAt?: string;
  answers: ExamAnswer[];
  feedback?: string;
}

export type AttemptStatus = 'in_progress' | 'completed' | 'timed_out' | 'abandoned';

export interface ExamAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  points: number;
  maxPoints: number;
  answeredAt: string;
}

export interface ExamResult {
  attemptId: string;
  examId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  rank: number;
  percentile: number;
  timeSpent: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  questionResults: QuestionResult[];
}

export interface QuestionResult {
  questionId: string;
  question: string;
  type: QuestionType;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
  points: number;
  maxPoints: number;
  explanation?: string;
}

export interface ExamCreateInput {
  title: string;
  description?: string;
  duration?: number;
  passingScore?: number;
  maxAttempts?: number;
  isPublic?: boolean;
  category?: string;
  tags?: string[];
}

export type ExamUpdateInput = Partial<ExamCreateInput> & { id: string };

export interface QuestionCreateInput {
  examId: string;
  text: string;
  type: QuestionType;
  points?: number;
  explanation?: string;
  options?: {
    text: string;
    isCorrect: boolean;
  }[];
}

interface PublicUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface ExamSubmitInput {
  attemptId: string;
  answers: {
    questionId: string;
    answer: string | string[];
  }[];
}


