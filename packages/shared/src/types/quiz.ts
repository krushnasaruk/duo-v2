export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  type: 'MCQ' | 'TRUE_FALSE';
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  xp: number;
  position: number;
}

export interface Quiz {
  id: string;
  lectureId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  position: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
