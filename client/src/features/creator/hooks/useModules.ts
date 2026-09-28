import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moduleService } from '../services/module.service';
import type { CreateModuleInput } from '@codequest/shared';
import { useAuth } from '@/features/auth/AuthContext';

export const moduleKeys = {
  all: ['modules'] as const,
  lists: (courseId: string) => [...moduleKeys.all, 'list', courseId] as const,
  detail: (moduleId: string) => [...moduleKeys.all, 'detail', moduleId] as const,
};

export function useModules(courseId: string) {
  const { user } = useAuth();
  const creatorId = user?.id || '';

  return useQuery({
    queryKey: moduleKeys.lists(courseId),
    queryFn: () => moduleService.listModules(courseId, creatorId),
    enabled: !!courseId && !!creatorId,
  });
}

export function useModule(moduleId: string, courseId: string) {
  const { user } = useAuth();
  const creatorId = user?.id || '';

  return useQuery({
    queryKey: moduleKeys.detail(moduleId),
    queryFn: () => moduleService.getModule(moduleId, courseId, creatorId),
    enabled: !!moduleId && !!courseId && !!creatorId,
  });
}

export function useCreateModule(courseId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: CreateModuleInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { courseService } = await import('../services/course.service');
      await courseService.ensureCourseEditable(courseId, user.id);
      return moduleService.createModule(courseId, user.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists(courseId) });
    },
  });
}

export function useUpdateModule(courseId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ moduleId, data }: { moduleId: string, data: Partial<CreateModuleInput> }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { courseService } = await import('../services/course.service');
      await courseService.ensureCourseEditable(courseId, user.id);
      return moduleService.updateModule(moduleId, courseId, user.id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists(courseId) });
      queryClient.invalidateQueries({ queryKey: moduleKeys.detail(variables.moduleId) });
    },
  });
}

export function useDeleteModule(courseId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (moduleId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { courseService } = await import('../services/course.service');
      await courseService.ensureCourseEditable(courseId, user.id);
      return moduleService.deleteModule(moduleId, courseId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists(courseId) });
    },
  });
}

export function useReorderModules(courseId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (orderedModuleIds: string[]) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { courseService } = await import('../services/course.service');
      await courseService.ensureCourseEditable(courseId, user.id);
      return moduleService.reorderModules(courseId, user.id, orderedModuleIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists(courseId) });
    },
  });
}
