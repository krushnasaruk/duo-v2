import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lectureService } from '../services/lecture.service';
import type { CreateLectureInput } from '@codequest/shared';
import { useAuth } from '@/features/auth/AuthContext';
import { useParams } from 'react-router-dom';

export const lectureKeys = {
  all: ['lectures'] as const,
  lists: (moduleId: string) => [...lectureKeys.all, 'list', moduleId] as const,
  detail: (lectureId: string) => [...lectureKeys.all, 'detail', lectureId] as const,
};

export function useLectures(moduleId: string) {
  const { user } = useAuth();
  const creatorId = user?.id || '';

  return useQuery({
    queryKey: lectureKeys.lists(moduleId),
    queryFn: () => lectureService.listLectures(moduleId, creatorId),
    enabled: !!moduleId && !!creatorId,
  });
}

export function useLecture(lectureId: string, moduleId: string) {
  const { user } = useAuth();
  const creatorId = user?.id || '';

  return useQuery({
    queryKey: lectureKeys.detail(lectureId),
    queryFn: () => lectureService.getLecture(lectureId, moduleId, creatorId),
    enabled: !!lectureId && !!moduleId && !!creatorId,
  });
}

export function useCreateLecture(moduleId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  
  return useMutation({
    mutationFn: async (data: CreateLectureInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (courseId) {
        const { courseService } = await import('../services/course.service');
        await courseService.ensureCourseEditable(courseId, user.id);
      }
      return lectureService.createLecture(moduleId, user.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lectureKeys.lists(moduleId) });
    },
  });
}

export function useUpdateLecture(moduleId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  
  return useMutation({
    mutationFn: async ({ lectureId, data }: { lectureId: string, data: Partial<CreateLectureInput> }) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (courseId) {
        const { courseService } = await import('../services/course.service');
        await courseService.ensureCourseEditable(courseId, user.id);
      }
      return lectureService.updateLecture(lectureId, moduleId, user.id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: lectureKeys.lists(moduleId) });
      queryClient.invalidateQueries({ queryKey: lectureKeys.detail(variables.lectureId) });
    },
  });
}

export function useDeleteLecture(moduleId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  
  return useMutation({
    mutationFn: async (lectureId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (courseId) {
        const { courseService } = await import('../services/course.service');
        await courseService.ensureCourseEditable(courseId, user.id);
      }
      return lectureService.deleteLecture(lectureId, moduleId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lectureKeys.lists(moduleId) });
    },
  });
}

export function useReorderLectures(moduleId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  
  return useMutation({
    mutationFn: async (orderedLectureIds: string[]) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (courseId) {
        const { courseService } = await import('../services/course.service');
        await courseService.ensureCourseEditable(courseId, user.id);
      }
      return lectureService.reorderLectures(moduleId, user.id, orderedLectureIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lectureKeys.lists(moduleId) });
    },
  });
}
