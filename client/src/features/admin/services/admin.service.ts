import type { Course, ReviewHistoryRecord, ReviewDecision } from '@codequest/shared';
import { coursesMemory, reviewHistoryMemory } from '../../creator/repositories/development.repository';

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

  async getAllCourses(userRole: string): Promise<Course[]> {
    if (userRole !== 'ADMIN') {
      throw new Error('Forbidden: ADMIN role required');
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [...coursesMemory].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
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
    
    return { ...course };
  },

  async getCourseReviewHistory(courseId: string, userRole: string): Promise<ReviewHistoryRecord[]> {
    if (userRole !== 'ADMIN') {
      throw new Error('Forbidden: ADMIN role required');
    }
    await new Promise(resolve => setTimeout(resolve, 200));
    return reviewHistoryMemory.filter(r => r.courseId === courseId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
    let decision: ReviewDecision;
    if (action === 'APPROVE') {
      newStatus = 'PUBLISHED';
      decision = 'APPROVED';
    } else if (action === 'REJECT') {
      if (!feedback || feedback.trim() === '') throw new Error('Feedback is required for rejection');
      newStatus = 'REJECTED';
      decision = 'REJECTED';
    } else if (action === 'REQUEST_CHANGES') {
      if (!feedback || feedback.trim() === '') throw new Error('Feedback is required to request changes');
      newStatus = 'CHANGES_REQUESTED';
      decision = 'CHANGES_REQUESTED';
    } else {
      throw new Error('Invalid review action');
    }

    coursesMemory[index].status = newStatus;
    coursesMemory[index].updatedAt = new Date();
    coursesMemory[index].reviewFeedback = action === 'APPROVE' ? null : feedback?.trim();

    reviewHistoryMemory.push({
      id: crypto.randomUUID(),
      courseId,
      decision,
      feedback: action === 'APPROVE' ? null : feedback?.trim(),
      createdAt: new Date()
    });

    return { ...coursesMemory[index] };
  }
};
