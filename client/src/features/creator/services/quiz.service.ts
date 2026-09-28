import type { Quiz, QuizQuestion, CreateQuizInput, QuizQuestionInput } from '@codequest/shared';
import { DevelopmentQuizRepository } from '../repositories/development-quiz.repository';

const repository = new DevelopmentQuizRepository();

export const quizService = {
  async listQuizzes(lectureId: string, creatorId: string): Promise<Quiz[]> {
    return repository.listQuizzes(lectureId, creatorId);
  },

  async getQuiz(quizId: string, lectureId: string, creatorId: string): Promise<Quiz> {
    return repository.getQuiz(quizId, lectureId, creatorId);
  },

  async createQuiz(lectureId: string, creatorId: string, input: CreateQuizInput): Promise<Quiz> {
    return repository.createQuiz(lectureId, creatorId, input);
  },

  async updateQuiz(quizId: string, lectureId: string, creatorId: string, input: Partial<CreateQuizInput>): Promise<Quiz> {
    return repository.updateQuiz(quizId, lectureId, creatorId, input);
  },

  async deleteQuiz(quizId: string, lectureId: string, creatorId: string): Promise<void> {
    return repository.deleteQuiz(quizId, lectureId, creatorId);
  },

  async reorderQuizzes(lectureId: string, creatorId: string, orderedQuizIds: string[]): Promise<void> {
    return repository.reorderQuizzes(lectureId, creatorId, orderedQuizIds);
  },

  async listQuizQuestions(quizId: string, creatorId: string): Promise<QuizQuestion[]> {
    return repository.listQuizQuestions(quizId, creatorId);
  },

  async getQuizQuestion(questionId: string, quizId: string, creatorId: string): Promise<QuizQuestion> {
    return repository.getQuizQuestion(questionId, quizId, creatorId);
  },

  async createQuizQuestion(quizId: string, creatorId: string, input: QuizQuestionInput): Promise<QuizQuestion> {
    return repository.createQuizQuestion(quizId, creatorId, input);
  },

  async updateQuizQuestion(questionId: string, quizId: string, creatorId: string, input: Partial<QuizQuestionInput>): Promise<QuizQuestion> {
    return repository.updateQuizQuestion(questionId, quizId, creatorId, input);
  },

  async deleteQuizQuestion(questionId: string, quizId: string, creatorId: string): Promise<void> {
    return repository.deleteQuizQuestion(questionId, quizId, creatorId);
  },

  async reorderQuizQuestions(quizId: string, creatorId: string, orderedQuestionIds: string[]): Promise<void> {
    return repository.reorderQuizQuestions(quizId, creatorId, orderedQuestionIds);
  }
};
