import type { Course, CreateCourseInput } from '@codequest/shared';
import type { ICourseRepository } from './course.repository';

// In-memory array acting as our database (exported for admin access in development)
export const coursesMemory: Course[] = [];

/**
 * Temporary development repository that stores data in process memory.
 * Data will disappear when the browser/development server restarts.
 * This will be replaced by a Supabase repository in a later phase.
 */
export class DevelopmentCourseRepository implements ICourseRepository {
  
  async listCourses(creatorId: string): Promise<Course[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return coursesMemory
      .filter(c => c.creatorId === creatorId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getCourse(courseId: string, creatorId: string): Promise<Course> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const course = coursesMemory.find(c => c.id === courseId);
    
    if (!course) {
      throw new Error('Course not found');
    }
    
    if (course.creatorId !== creatorId) {
      throw new Error('Unauthorized access');
    }

    return { ...course };
  }

  async createCourse(creatorId: string, input: CreateCourseInput): Promise<Course> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const now = new Date();
    
    const newCourse: Course = {
      id: crypto.randomUUID(),
      creatorId,
      title: input.title,
      shortDescription: input.shortDescription,
      fullDescription: input.fullDescription,
      tagline: input.tagline || null,
      category: input.category,
      subcategory: input.subcategory || null,
      difficulty: input.difficulty,
      language: input.language,
      targetAudience: input.targetAudience || null,
      duration: input.duration || null,
      prerequisites: input.prerequisites || [],
      learningObjectives: input.learningObjectives || [],
      skills: input.skills || [],
      glossary: input.glossary || [],
      thumbnailUrl: input.thumbnailUrl || null,
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now,
    };

    coursesMemory.push(newCourse);
    return { ...newCourse };
  }

  async updateCourse(courseId: string, creatorId: string, input: Partial<CreateCourseInput>): Promise<Course> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const index = coursesMemory.findIndex(c => c.id === courseId);
    
    if (index === -1) {
      throw new Error('Course not found');
    }

    if (coursesMemory[index].creatorId !== creatorId) {
      throw new Error('Unauthorized access');
    }

    const updatedCourse: Course = {
      ...coursesMemory[index],
      ...input,
      // Ensure these fields can't be updated
      id: coursesMemory[index].id,
      creatorId: coursesMemory[index].creatorId,
      status: coursesMemory[index].status,
      createdAt: coursesMemory[index].createdAt,
      updatedAt: new Date(),
    };

    coursesMemory[index] = updatedCourse;
    return { ...updatedCourse };
  }

  async updateCourseStatus(courseId: string, creatorId: string, status: Course['status']): Promise<Course> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const index = coursesMemory.findIndex(c => c.id === courseId);
    
    if (index === -1) {
      throw new Error('Course not found');
    }

    if (coursesMemory[index].creatorId !== creatorId) {
      throw new Error('Unauthorized access');
    }

    coursesMemory[index].status = status;
    coursesMemory[index].updatedAt = new Date();

    return { ...coursesMemory[index] };
  }
}
