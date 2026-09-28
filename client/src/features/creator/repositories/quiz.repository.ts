import type { Quiz, QuizQuestion, CreateQuizInput, QuizQuestionInput } from '@codequest/shared';

export interface IQuizRepository {
  listQuizzes(lectureId: string, creatorId: string): Promise<Quiz[]>;
  getQuiz(quizId: string, lectureId: string, creatorId: string): Promise<Quiz>;
  createQuiz(lectureId: string, creatorId: string, input: CreateQuizInput): Promise<Quiz>;
  updateQuiz(quizId: string, lectureId: string, creatorId: string, input: Partial<CreateQuizInput>): Promise<Quiz>;
  deleteQuiz(quizId: string, lectureId: string, creatorId: string): Promise<void>;
  reorderQuizzes(lectureId: string, creatorId: string, orderedQuizIds: string[]): Promise<void>;

  listQuizQuestions(quizId: string, creatorId: string): Promise<QuizQuestion[]>;
  getQuizQuestion(questionId: string, quizId: string, creatorId: string): Promise<QuizQuestion>;
  createQuizQuestion(quizId: string, creatorId: string, input: QuizQuestionInput): Promise<QuizQuestion>;
  updateQuizQuestion(questionId: string, quizId: string, creatorId: string, input: Partial<QuizQuestionInput>): Promise<QuizQuestion>;
  deleteQuizQuestion(questionId: string, quizId: string, creatorId: string): Promise<void>;
  reorderQuizQuestions(quizId: string, creatorId: string, orderedQuestionIds: string[]): Promise<void>;
}
