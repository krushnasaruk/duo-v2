import type { Lecture, CreateLectureInput } from '@codequest/shared';
import type { ILectureRepository } from './lecture.repository';

// In-memory array acting as our database
let lecturesMemory: Lecture[] = [];

/**
 * Temporary development repository that stores lectures in process memory.
 */
export class DevelopmentLectureRepository implements ILectureRepository {
  
  async listLectures(moduleId: string, _creatorId: string): Promise<Lecture[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Ownership checks are implicitly assumed to be done via the Course/Module
    return lecturesMemory
      .filter(l => l.moduleId === moduleId)
      .sort((a, b) => a.position - b.position);
  }

  async getLecture(lectureId: string, moduleId: string, _creatorId: string): Promise<Lecture> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const lecture = lecturesMemory.find(l => l.id === lectureId && l.moduleId === moduleId);
    
    if (!lecture) {
      throw new Error('Lecture not found');
    }

    return { ...lecture };
  }

  async createLecture(moduleId: string, _creatorId: string, input: CreateLectureInput): Promise<Lecture> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const now = new Date();
    const moduleLectures = lecturesMemory.filter(l => l.moduleId === moduleId);
    const position = moduleLectures.length > 0 
      ? Math.max(...moduleLectures.map(l => l.position)) + 1 
      : 0;
    
    const newLecture: Lecture = {
      id: crypto.randomUUID(),
      moduleId,
      title: input.title,
      description: input.description,
      content: input.content || [],
      video: input.video || null,
      resources: input.resources || [],
      position,
      createdAt: now,
      updatedAt: now,
    };

    lecturesMemory.push(newLecture);
    return { ...newLecture };
  }

  async updateLecture(lectureId: string, moduleId: string, _creatorId: string, input: Partial<CreateLectureInput>): Promise<Lecture> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const index = lecturesMemory.findIndex(l => l.id === lectureId && l.moduleId === moduleId);
    
    if (index === -1) {
      throw new Error('Lecture not found');
    }

    const updatedLecture: Lecture = {
      ...lecturesMemory[index],
      ...input,
      id: lecturesMemory[index].id,
      moduleId: lecturesMemory[index].moduleId,
      position: lecturesMemory[index].position,
      createdAt: lecturesMemory[index].createdAt,
      updatedAt: new Date(),
    };

    lecturesMemory[index] = updatedLecture;
    return { ...updatedLecture };
  }

  async deleteLecture(lectureId: string, moduleId: string, _creatorId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = lecturesMemory.findIndex(l => l.id === lectureId && l.moduleId === moduleId);
    if (index === -1) {
      throw new Error('Lecture not found');
    }

    // Remove lecture
    lecturesMemory.splice(index, 1);

    // Reorder remaining lectures for this module
    const moduleLectures = lecturesMemory
      .filter(l => l.moduleId === moduleId)
      .sort((a, b) => a.position - b.position);

    moduleLectures.forEach((lec, idx) => {
      const globalIdx = lecturesMemory.findIndex(l => l.id === lec.id);
      lecturesMemory[globalIdx].position = idx;
    });
  }

  async reorderLectures(moduleId: string, _creatorId: string, orderedLectureIds: string[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const moduleLectures = lecturesMemory.filter(l => l.moduleId === moduleId);
    
    // Validate that all ordered IDs exist in the module
    if (moduleLectures.length !== orderedLectureIds.length) {
      throw new Error('Invalid reorder request: lecture count mismatch');
    }

    // Update positions based on array index
    orderedLectureIds.forEach((id, newPosition) => {
      const idx = lecturesMemory.findIndex(l => l.id === id && l.moduleId === moduleId);
      if (idx !== -1) {
        lecturesMemory[idx].position = newPosition;
        lecturesMemory[idx].updatedAt = new Date();
      }
    });
  }
}
