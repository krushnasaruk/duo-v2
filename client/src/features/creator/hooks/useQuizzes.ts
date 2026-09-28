import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizService } from '../services/quiz.service';
import type { CreateQuizInput, QuizQuestionInput } from '@codequest/shared';
import { useAuth } from '@/features/auth/AuthContext';
import { useParams } from 'react-router-dom';

export const quizKeys = {
  all: ['quizzes'] as const,
  lists: (lectureId: string) => [...quizKeys.all, 'list', lectureId] as const,
  detail: (quizId: string) => [...quizKeys.all, 'detail', quizId] as const,
  questions: (quizId: string) => [...quizKeys.detail(quizId), 'questions'] as const,
};

export function useQuizzes(lectureId: string) {
  const { user } = useAuth();
  const creatorId = user?.id || '';

  return useQuery({
    queryKey: quizKeys.lists(lectureId),
    queryFn: () => quizService.listQuizzes(lectureId, creatorId),
    enabled: !!lectureId && !!creatorId,
  });
}

export function useQuiz(quizId: string, lectureId: string) {
  const { user } = useAuth();
  const creatorId = user?.id || '';

  return useQuery({
    queryKey: quizKeys.detail(quizId),
    queryFn: () => quizService.getQuiz(quizId, lectureId, creatorId),
    enabled: !!quizId && !!lectureId && !!creatorId,
  });
}

export function useCreateQuiz(lectureId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  
  return useMutation({
    mutationFn: async (data: CreateQuizInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (courseId) {
        const { courseService } = await import('../services/course.service');
        await courseService.ensureCourseEditable(courseId, user.id);
      }
      return quizService.createQuiz(lectureId, user.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.lists(lectureId) });
    },
  });
}

export function useUpdateQuiz(lectureId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  
  return useMutation({
    mutationFn: async ({ quizId, data }: { quizId: string, data: Partial<CreateQuizInput> }) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (courseId) {
        const { courseService } = await import('../services/course.service');
        await courseService.ensureCourseEditable(courseId, user.id);
      }
      return quizService.updateQuiz(quizId, lectureId, user.id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.lists(lectureId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(variables.quizId) });
    },
  });
}

export function useDeleteQuiz(lectureId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  
  return useMutation({
    mutationFn: async (quizId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (courseId) {
        const { courseService } = await import('../services/course.service');
        await courseService.ensureCourseEditable(courseId, user.id);
      }
      return quizService.deleteQuiz(quizId, lectureId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.lists(lectureId) });
    },
  });
}

export function useReorderQuizzes(lectureId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  
  return useMutation({
    mutationFn: async (orderedQuizIds: string[]) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (courseId) {
        const { courseService } = await import('../services/course.service');
        await courseService.ensureCourseEditable(courseId, user.id);
      }
      return quizService.reorderQuizzes(lectureId, user.id, orderedQuizIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.lists(lectureId) });
    },
  });
}

export function useQuizQuestions(quizId: string) {
  const { user } = useAuth();
  const creatorId = user?.id || '';

  return useQuery({
    queryKey: quizKeys.questions(quizId),
    queryFn: () => quizService.listQuizQuestions(quizId, creatorId),
    enabled: !!quizId && !!creatorId,
  });
}

export function useCreateQuizQuestion(quizId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (data: QuizQuestionInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      return quizService.createQuizQuestion(quizId, user.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.questions(quizId) });
      // Invalidate the quiz detail since it includes questions
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(quizId) });
    },
  });
}

export function useUpdateQuizQuestion(quizId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ questionId, data }: { questionId: string, data: Partial<QuizQuestionInput> }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return quizService.updateQuizQuestion(questionId, quizId, user.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.questions(quizId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(quizId) });
    },
  });
}

export function useDeleteQuizQuestion(quizId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (questionId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      return quizService.deleteQuizQuestion(questionId, quizId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.questions(quizId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(quizId) });
    },
  });
}

export function useReorderQuizQuestions(quizId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (orderedQuestionIds: string[]) => {
      if (!user?.id) throw new Error('Not authenticated');
      return quizService.reorderQuizQuestions(quizId, user.id, orderedQuestionIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.questions(quizId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(quizId) });
    },
  });
}
