import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkpointService } from '../services/checkpoint.service';
import type { CreateCodingCheckpointInput } from '@codequest/shared';
import { useAuth } from '@/features/auth/AuthContext';
import { useParams } from 'react-router-dom';

export const checkpointKeys = {
  all: ['checkpoints'] as const,
  lists: (lectureId: string) => [...checkpointKeys.all, 'list', lectureId] as const,
  detail: (checkpointId: string) => [...checkpointKeys.all, 'detail', checkpointId] as const,
};

export function useCodingCheckpoints(lectureId: string) {
  const { user } = useAuth();
  const creatorId = user?.id || '';

  return useQuery({
    queryKey: checkpointKeys.lists(lectureId),
    queryFn: () => checkpointService.listCodingCheckpoints(lectureId, creatorId),
    enabled: !!lectureId && !!creatorId,
  });
}

export function useCodingCheckpoint(checkpointId: string, lectureId: string) {
  const { user } = useAuth();
  const creatorId = user?.id || '';

  return useQuery({
    queryKey: checkpointKeys.detail(checkpointId),
    queryFn: () => checkpointService.getCodingCheckpoint(checkpointId, lectureId, creatorId),
    enabled: !!checkpointId && !!lectureId && !!creatorId,
  });
}

export function useCreateCodingCheckpoint(lectureId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  
  return useMutation({
    mutationFn: async (data: CreateCodingCheckpointInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (courseId) {
        const { courseService } = await import('../services/course.service');
        await courseService.ensureCourseEditable(courseId, user.id);
      }
      return checkpointService.createCodingCheckpoint(lectureId, user.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkpointKeys.lists(lectureId) });
    },
  });
}

export function useUpdateCodingCheckpoint(lectureId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  
  return useMutation({
    mutationFn: async ({ checkpointId, data }: { checkpointId: string, data: Partial<CreateCodingCheckpointInput> }) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (courseId) {
        const { courseService } = await import('../services/course.service');
        await courseService.ensureCourseEditable(courseId, user.id);
      }
      return checkpointService.updateCodingCheckpoint(checkpointId, lectureId, user.id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: checkpointKeys.lists(lectureId) });
      queryClient.invalidateQueries({ queryKey: checkpointKeys.detail(variables.checkpointId) });
    },
  });
}

export function useDeleteCodingCheckpoint(lectureId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  
  return useMutation({
    mutationFn: async (checkpointId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (courseId) {
        const { courseService } = await import('../services/course.service');
        await courseService.ensureCourseEditable(courseId, user.id);
      }
      return checkpointService.deleteCodingCheckpoint(checkpointId, lectureId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkpointKeys.lists(lectureId) });
    },
  });
}

export function useReorderCodingCheckpoints(lectureId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  
  return useMutation({
    mutationFn: async (orderedCheckpointIds: string[]) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (courseId) {
        const { courseService } = await import('../services/course.service');
        await courseService.ensureCourseEditable(courseId, user.id);
      }
      return checkpointService.reorderCodingCheckpoints(lectureId, user.id, orderedCheckpointIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkpointKeys.lists(lectureId) });
    },
  });
}
