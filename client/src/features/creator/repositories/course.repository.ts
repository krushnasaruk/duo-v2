import type { Course, CreateCourseInput } from '@codequest/shared';

export interface ICourseRepository {
  listCourses(creatorId: string): Promise<Course[]>;
  getCourse(courseId: string, creatorId: string): Promise<Course>;
  createCourse(creatorId: string, input: CreateCourseInput): Promise<Course>;
  updateCourse(courseId: string, creatorId: string, input: Partial<CreateCourseInput>): Promise<Course>;
  updateCourseStatus(courseId: string, creatorId: string, status: Course['status']): Promise<Course>;
}
