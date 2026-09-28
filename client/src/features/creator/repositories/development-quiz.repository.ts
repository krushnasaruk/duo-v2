import type { Quiz, QuizQuestion, CreateQuizInput, QuizQuestionInput } from '@codequest/shared';
import type { IQuizRepository } from './quiz.repository';

// In-memory array acting as our database
let quizzesMemory: Quiz[] = [];

export class DevelopmentQuizRepository implements IQuizRepository {
  
  async listQuizzes(lectureId: string, _creatorId: string): Promise<Quiz[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return quizzesMemory
      .filter(q => q.lectureId === lectureId)
      .sort((a, b) => a.position - b.position);
  }

  async getQuiz(quizId: string, lectureId: string, _creatorId: string): Promise<Quiz> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const quiz = quizzesMemory.find(q => q.id === quizId && q.lectureId === lectureId);
    if (!quiz) throw new Error('Quiz not found');
    return { ...quiz };
  }

  async createQuiz(lectureId: string, _creatorId: string, input: CreateQuizInput): Promise<Quiz> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const now = new Date();
    const lectureQuizzes = quizzesMemory.filter(q => q.lectureId === lectureId);
    const position = lectureQuizzes.length > 0 
      ? Math.max(...lectureQuizzes.map(q => q.position)) + 1 
      : 0;
    
    const newQuiz: Quiz = {
      id: crypto.randomUUID(),
      lectureId,
      title: input.title,
      description: input.description,
      questions: [],
      position,
      createdAt: now,
      updatedAt: now,
    };

    quizzesMemory.push(newQuiz);
    return { ...newQuiz };
  }

  async updateQuiz(quizId: string, lectureId: string, _creatorId: string, input: Partial<CreateQuizInput>): Promise<Quiz> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = quizzesMemory.findIndex(q => q.id === quizId && q.lectureId === lectureId);
    if (index === -1) throw new Error('Quiz not found');

    const updatedQuiz: Quiz = {
      ...quizzesMemory[index],
      ...input,
      id: quizzesMemory[index].id,
      lectureId: quizzesMemory[index].lectureId,
      position: quizzesMemory[index].position,
      questions: quizzesMemory[index].questions,
      createdAt: quizzesMemory[index].createdAt,
      updatedAt: new Date(),
    };

    quizzesMemory[index] = updatedQuiz;
    return { ...updatedQuiz };
  }

  async deleteQuiz(quizId: string, lectureId: string, _creatorId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = quizzesMemory.findIndex(q => q.id === quizId && q.lectureId === lectureId);
    if (index === -1) throw new Error('Quiz not found');

    quizzesMemory.splice(index, 1);

    // Normalize positions
    const lectureQuizzes = quizzesMemory
      .filter(q => q.lectureId === lectureId)
      .sort((a, b) => a.position - b.position);

    lectureQuizzes.forEach((q, idx) => {
      const globalIdx = quizzesMemory.findIndex(mq => mq.id === q.id);
      quizzesMemory[globalIdx].position = idx;
    });
  }

  async reorderQuizzes(lectureId: string, _creatorId: string, orderedQuizIds: string[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const lectureQuizzes = quizzesMemory.filter(q => q.lectureId === lectureId);
    if (lectureQuizzes.length !== orderedQuizIds.length) {
      throw new Error('Invalid reorder request: quiz count mismatch');
    }

    orderedQuizIds.forEach((id, newPosition) => {
      const idx = quizzesMemory.findIndex(q => q.id === id && q.lectureId === lectureId);
      if (idx !== -1) {
        quizzesMemory[idx].position = newPosition;
        quizzesMemory[idx].updatedAt = new Date();
      }
    });
  }

  // --- Questions ---

  async listQuizQuestions(quizId: string, _creatorId: string): Promise<QuizQuestion[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const quiz = quizzesMemory.find(q => q.id === quizId);
    if (!quiz) throw new Error('Quiz not found');
    return [...quiz.questions].sort((a, b) => a.position - b.position);
  }

  async getQuizQuestion(questionId: string, quizId: string, _creatorId: string): Promise<QuizQuestion> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const quiz = quizzesMemory.find(q => q.id === quizId);
    if (!quiz) throw new Error('Quiz not found');

    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) throw new Error('Question not found');

    return { ...question };
  }

  async createQuizQuestion(quizId: string, _creatorId: string, input: QuizQuestionInput): Promise<QuizQuestion> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const quizIndex = quizzesMemory.findIndex(q => q.id === quizId);
    if (quizIndex === -1) throw new Error('Quiz not found');

    const questions = quizzesMemory[quizIndex].questions;
    const position = questions.length > 0 
      ? Math.max(...questions.map(q => q.position)) + 1 
      : 0;

    const newQuestion: QuizQuestion = {
      ...input,
      id: crypto.randomUUID(),
      quizId,
      position
    };

    quizzesMemory[quizIndex].questions.push(newQuestion);
    quizzesMemory[quizIndex].updatedAt = new Date();

    return { ...newQuestion };
  }

  async updateQuizQuestion(questionId: string, quizId: string, _creatorId: string, input: Partial<QuizQuestionInput>): Promise<QuizQuestion> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const quizIndex = quizzesMemory.findIndex(q => q.id === quizId);
    if (quizIndex === -1) throw new Error('Quiz not found');

    const questionIndex = quizzesMemory[quizIndex].questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) throw new Error('Question not found');

    const updatedQuestion: QuizQuestion = {
      ...quizzesMemory[quizIndex].questions[questionIndex],
      ...input,
      id: quizzesMemory[quizIndex].questions[questionIndex].id,
      quizId: quizzesMemory[quizIndex].questions[questionIndex].quizId,
      position: quizzesMemory[quizIndex].questions[questionIndex].position,
    };

    quizzesMemory[quizIndex].questions[questionIndex] = updatedQuestion;
    quizzesMemory[quizIndex].updatedAt = new Date();

    return { ...updatedQuestion };
  }

  async deleteQuizQuestion(questionId: string, quizId: string, _creatorId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const quizIndex = quizzesMemory.findIndex(q => q.id === quizId);
    if (quizIndex === -1) throw new Error('Quiz not found');

    const questionIndex = quizzesMemory[quizIndex].questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) throw new Error('Question not found');

    quizzesMemory[quizIndex].questions.splice(questionIndex, 1);

    // Normalize positions
    const sortedQuestions = [...quizzesMemory[quizIndex].questions].sort((a, b) => a.position - b.position);
    
    sortedQuestions.forEach((q, idx) => {
      const qIdx = quizzesMemory[quizIndex].questions.findIndex(mq => mq.id === q.id);
      quizzesMemory[quizIndex].questions[qIdx].position = idx;
    });

    quizzesMemory[quizIndex].updatedAt = new Date();
  }

  async reorderQuizQuestions(quizId: string, _creatorId: string, orderedQuestionIds: string[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const quizIndex = quizzesMemory.findIndex(q => q.id === quizId);
    if (quizIndex === -1) throw new Error('Quiz not found');

    if (quizzesMemory[quizIndex].questions.length !== orderedQuestionIds.length) {
      throw new Error('Invalid reorder request: question count mismatch');
    }

    orderedQuestionIds.forEach((id, newPosition) => {
      const qIdx = quizzesMemory[quizIndex].questions.findIndex(q => q.id === id);
      if (qIdx !== -1) {
        quizzesMemory[quizIndex].questions[qIdx].position = newPosition;
      }
    });

    quizzesMemory[quizIndex].updatedAt = new Date();
  }
}
