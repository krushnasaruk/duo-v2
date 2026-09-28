import { useQuery } from '@tanstack/react-query';
import { courseValidationService } from '../services/course-validation.service';
import { useAuth } from '@/features/auth/AuthContext';

export const courseValidationKeys = {
  all: ['course-validation'] as const,
  hierarchy: (courseId: string) => [...courseValidationKeys.all, 'hierarchy', courseId] as const,
  issues: (courseId: string) => [...courseValidationKeys.all, 'issues', courseId] as const,
};

export function useCourseHierarchy(courseId: string) {
  const { user } = useAuth();
  const creatorId = user?.id || '';

  return useQuery({
    queryKey: courseValidationKeys.hierarchy(courseId),
    queryFn: () => courseValidationService.getCompleteCourseHierarchy(courseId, creatorId),
    enabled: !!courseId && !!creatorId,
    retry: false
  });
}

export function useValidateCourse(courseId: string) {
  const { user } = useAuth();
  const creatorId = user?.id || '';

  return useQuery({
    queryKey: courseValidationKeys.issues(courseId),
    queryFn: () => courseValidationService.validateCourse(courseId, creatorId),
    enabled: !!courseId && !!creatorId,
    retry: false
  });
}
