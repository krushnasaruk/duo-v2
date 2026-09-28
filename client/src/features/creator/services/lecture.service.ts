import type { Lecture, CreateLectureInput } from '@codequest/shared';
import { DevelopmentLectureRepository } from '../repositories/development-lecture.repository';

// Initialize the repository.
// For Phase 4, this is the memory-based Development Repository.
const repository = new DevelopmentLectureRepository();

/**
 * Service abstraction for Lecture operations.
 */
export const lectureService = {
  async listLectures(moduleId: string, creatorId: string): Promise<Lecture[]> {
    return repository.listLectures(moduleId, creatorId);
  },

  async getLecture(lectureId: string, moduleId: string, creatorId: string): Promise<Lecture> {
    return repository.getLecture(lectureId, moduleId, creatorId);
  },

  async createLecture(moduleId: string, creatorId: string, input: CreateLectureInput): Promise<Lecture> {
    return repository.createLecture(moduleId, creatorId, input);
  },

  async updateLecture(lectureId: string, moduleId: string, creatorId: string, input: Partial<CreateLectureInput>): Promise<Lecture> {
    return repository.updateLecture(lectureId, moduleId, creatorId, input);
  },

  async deleteLecture(lectureId: string, moduleId: string, creatorId: string): Promise<void> {
    return repository.deleteLecture(lectureId, moduleId, creatorId);
  },

  async reorderLectures(moduleId: string, creatorId: string, orderedLectureIds: string[]): Promise<void> {
    return repository.reorderLectures(moduleId, creatorId, orderedLectureIds);
  }
};
