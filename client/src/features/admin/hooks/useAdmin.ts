import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';
import { useAuth } from '@/features/auth/AuthContext';
import { courseValidationService } from '@/features/creator/services/course-validation.service';

export function useAdminReviewQueue() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin', 'review-queue'],
    queryFn: () => adminService.getPendingCourses(user?.role || ''),
    enabled: !!user && user.role === 'ADMIN'
  });
}

export function useReviewCourseAction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ courseId, action, feedback }: { courseId: string, action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES', feedback?: string }) => {
      return adminService.reviewCourse(courseId, user?.role || '', action, feedback);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'review-queue'] });
      queryClient.invalidateQueries({ queryKey: ['courses', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    }
  });
}

export function useAdminReviewCourse(courseId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin', 'review-course', courseId],
    queryFn: async () => {
      // Get course to bypass creator ID check
      const course = await adminService.getCourseForReview(courseId, user?.role || '');
      // Fetch full hierarchy as the creator to reuse the creator's complex assembly logic
      const hierarchy = await courseValidationService.getCompleteCourseHierarchy(courseId, course.creatorId);
      const validation = await courseValidationService.validateCourse(courseId, course.creatorId);
      
      return { hierarchy, validation };
    },
    enabled: !!user && user.role === 'ADMIN' && !!courseId
  });
}
