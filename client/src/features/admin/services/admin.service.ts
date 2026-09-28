import type { Course } from '@codequest/shared';
import { coursesMemory } from '../../creator/repositories/development.repository';

export const adminService = {
  async getPendingCourses(userRole: string): Promise<Course[]> {
    if (userRole !== 'ADMIN') {
      throw new Error('Forbidden: ADMIN role required');
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return coursesMemory
      .filter(c => c.status === 'PENDING_REVIEW')
      .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
  },

  async getCourseForReview(courseId: string, userRole: string): Promise<Course> {
    if (userRole !== 'ADMIN') {
      throw new Error('Forbidden: ADMIN role required');
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    const course = coursesMemory.find(c => c.id === courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    // We can allow viewing PUBLISHED/REJECTED for auditing, 
    // but the prompt says "Admin must NOT edit", not "Admin must not view".
    // However, if we strictly want them to only see PENDING_REVIEW in the queue,
    // they might still open a course directly. We'll return it anyway.

    return { ...course };
  },

  async reviewCourse(
    courseId: string, 
    userRole: string, 
    action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES', 
    feedback?: string
  ): Promise<Course> {
    if (userRole !== 'ADMIN') {
      throw new Error('Forbidden: ADMIN role required');
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const index = coursesMemory.findIndex(c => c.id === courseId);
    if (index === -1) {
      throw new Error('Course not found');
    }

    const course = coursesMemory[index];

    if (course.status !== 'PENDING_REVIEW') {
      throw new Error('Invalid transition: Course is no longer pending review');
    }

    let newStatus: Course['status'];
    if (action === 'APPROVE') {
      newStatus = 'PUBLISHED';
    } else if (action === 'REJECT') {
      newStatus = 'REJECTED';
    } else if (action === 'REQUEST_CHANGES') {
      newStatus = 'CHANGES_REQUESTED';
    } else {
      throw new Error('Invalid review action');
    }

    coursesMemory[index].status = newStatus;
    coursesMemory[index].updatedAt = new Date();

    // In a real backend, we'd also save the feedback as a CourseReview record or similar.
    // For now, it's just a state transition since there is no persistent review model yet.

    return { ...coursesMemory[index] };
  }
};
