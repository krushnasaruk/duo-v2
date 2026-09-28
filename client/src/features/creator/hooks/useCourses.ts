import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../services/course.service';
import type { CreateCourseInput } from '@codequest/shared';
import { useAuth } from '@/features/auth/AuthContext';

export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  detail: (id: string) => [...courseKeys.all, 'detail', id] as const,
};

export function useCourses() {
  const { user } = useAuth();
  const creatorId = user?.id || '';

  return useQuery({
    queryKey: courseKeys.lists(),
    queryFn: () => courseService.getCourses(creatorId),
    enabled: !!creatorId,
  });
}

export function useCourse(id: string) {
  const { user } = useAuth();
  const creatorId = user?.id || '';

  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => courseService.getCourse(id, creatorId),
    enabled: !!id && !!creatorId,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (data: CreateCourseInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      return courseService.createCourse(user.id, data);
    },
    onSuccess: (newCourse) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.setQueryData(courseKeys.detail(newCourse.id), newCourse);
    },
  });
}

export function useUpdateCourse(id: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: Partial<CreateCourseInput>) => {
      if (!user?.id) throw new Error('Not authenticated');
      await courseService.ensureCourseEditable(id, user.id);
      return courseService.updateCourse(id, user.id, data);
    },
    onSuccess: (updatedCourse) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.setQueryData(courseKeys.detail(id), updatedCourse);
    },
  });
}

export function useTransitionCourseStatus(courseId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (status: 'DRAFT' | 'READY_FOR_REVIEW' | 'PENDING_REVIEW') => {
      if (!user?.id) throw new Error('Not authenticated');
      return courseService.updateCourseStatus(courseId, user.id, status);
    },
    onSuccess: (updatedCourse) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.setQueryData(courseKeys.detail(courseId), updatedCourse);
    },
  });
}
