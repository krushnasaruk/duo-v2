import type { Course, CreateCourseInput } from '@codequest/shared';
import { DevelopmentCourseRepository } from '../repositories/development.repository';

// Initialize the repository.
// For Phase 2C, this is the memory-based Development Repository.
// Later, this will be `new SupabaseCourseRepository()`.
const repository = new DevelopmentCourseRepository();

/**
 * Service abstraction for Course operations.
 */
export const courseService = {
  async getCourses(creatorId: string): Promise<Course[]> {
    return repository.listCourses(creatorId);
  },

  async getCourse(id: string, creatorId: string): Promise<Course> {
    return repository.getCourse(id, creatorId);
  },

  async createCourse(creatorId: string, input: CreateCourseInput): Promise<Course> {
    return repository.createCourse(creatorId, input);
  },

  async updateCourse(id: string, creatorId: string, input: Partial<CreateCourseInput>): Promise<Course> {
    return repository.updateCourse(id, creatorId, input);
  },

  async updateCourseStatus(id: string, creatorId: string, status: Course['status']): Promise<Course> {
    return repository.updateCourseStatus(id, creatorId, status);
  },

  async ensureCourseEditable(id: string, creatorId: string): Promise<void> {
    const course = await repository.getCourse(id, creatorId);
    if (course.status === 'PENDING_REVIEW' || course.status === 'PUBLISHED') {
      throw new Error('Course is locked and cannot be edited in its current status.');
    }
    if (course.status === 'READY_FOR_REVIEW' || course.status === 'CHANGES_REQUESTED') {
      await repository.updateCourseStatus(id, creatorId, 'DRAFT');
    }
  }
};
