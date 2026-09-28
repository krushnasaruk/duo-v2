import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/project.service';
import type { CreateProjectInput, CreateProjectMilestoneInput } from '@codequest/shared';
import { useAuth } from '@/features/auth/AuthContext';
import { useParams } from 'react-router-dom';

export const projectKeys = {
  all: ['projects'] as const,
  lists: (lectureId: string) => [...projectKeys.all, 'list', lectureId] as const,
  detail: (projectId: string) => [...projectKeys.all, 'detail', projectId] as const,
  milestones: (projectId: string) => [...projectKeys.detail(projectId), 'milestones'] as const,
};

export function useProjects(lectureId: string) {
  const { user } = useAuth();
  const creatorId = user?.id || '';

  return useQuery({
    queryKey: projectKeys.lists(lectureId),
    queryFn: () => projectService.listProjects(lectureId, creatorId),
    enabled: !!lectureId && !!creatorId,
  });
}

export function useProject(projectId: string, lectureId: string) {
  const { user } = useAuth();
  const creatorId = user?.id || '';

  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => projectService.getProject(projectId, lectureId, creatorId),
    enabled: !!projectId && !!lectureId && !!creatorId,
  });
}

export function useCreateProject(lectureId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  
  return useMutation({
    mutationFn: async (data: CreateProjectInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (courseId) {
        const { courseService } = await import('../services/course.service');
        await courseService.ensureCourseEditable(courseId, user.id);
      }
      return projectService.createProject(lectureId, user.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists(lectureId) });
    },
  });
}

export function useUpdateProject(lectureId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  
  return useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string, data: Partial<CreateProjectInput> }) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (courseId) {
        const { courseService } = await import('../services/course.service');
        await courseService.ensureCourseEditable(courseId, user.id);
      }
      return projectService.updateProject(projectId, lectureId, user.id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists(lectureId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
    },
  });
}

export function useDeleteProject(lectureId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  
  return useMutation({
    mutationFn: async (projectId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (courseId) {
        const { courseService } = await import('../services/course.service');
        await courseService.ensureCourseEditable(courseId, user.id);
      }
      return projectService.deleteProject(projectId, lectureId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists(lectureId) });
    },
  });
}

export function useReorderProjects(lectureId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  
  return useMutation({
    mutationFn: async (orderedProjectIds: string[]) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (courseId) {
        const { courseService } = await import('../services/course.service');
        await courseService.ensureCourseEditable(courseId, user.id);
      }
      return projectService.reorderProjects(lectureId, user.id, orderedProjectIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists(lectureId) });
    },
  });
}

export function useProjectMilestones(projectId: string) {
  const { user } = useAuth();
  const creatorId = user?.id || '';

  return useQuery({
    queryKey: projectKeys.milestones(projectId),
    queryFn: () => projectService.listProjectMilestones(projectId, creatorId),
    enabled: !!projectId && !!creatorId,
  });
}

export function useCreateProjectMilestone(projectId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  
  return useMutation({
    mutationFn: async (data: Omit<CreateProjectMilestoneInput, 'projectId'>) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (courseId) {
        const { courseService } = await import('../services/course.service');
        await courseService.ensureCourseEditable(courseId, user.id);
      }
      return projectService.createProjectMilestone(projectId, user.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.milestones(projectId) });
    },
  });
}

export function useUpdateProjectMilestone(projectId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  
  return useMutation({
    mutationFn: async ({ milestoneId, data }: { milestoneId: string, data: Partial<CreateProjectMilestoneInput> }) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (courseId) {
        const { courseService } = await import('../services/course.service');
        await courseService.ensureCourseEditable(courseId, user.id);
      }
      return projectService.updateProjectMilestone(milestoneId, projectId, user.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.milestones(projectId) });
    },
  });
}

export function useDeleteProjectMilestone(projectId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  
  return useMutation({
    mutationFn: async (milestoneId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (courseId) {
        const { courseService } = await import('../services/course.service');
        await courseService.ensureCourseEditable(courseId, user.id);
      }
      return projectService.deleteProjectMilestone(milestoneId, projectId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.milestones(projectId) });
    },
  });
}

export function useReorderProjectMilestones(projectId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  
  return useMutation({
    mutationFn: async (orderedMilestoneIds: string[]) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (courseId) {
        const { courseService } = await import('../services/course.service');
        await courseService.ensureCourseEditable(courseId, user.id);
      }
      return projectService.reorderProjectMilestones(projectId, user.id, orderedMilestoneIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.milestones(projectId) });
    },
  });
}
