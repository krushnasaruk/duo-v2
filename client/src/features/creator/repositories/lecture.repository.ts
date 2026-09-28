import type { Lecture, CreateLectureInput } from '@codequest/shared';

export interface ILectureRepository {
  listLectures(moduleId: string, creatorId: string): Promise<Lecture[]>;
  getLecture(lectureId: string, moduleId: string, creatorId: string): Promise<Lecture>;
  createLecture(moduleId: string, creatorId: string, input: CreateLectureInput): Promise<Lecture>;
  updateLecture(lectureId: string, moduleId: string, creatorId: string, input: Partial<CreateLectureInput>): Promise<Lecture>;
  deleteLecture(lectureId: string, moduleId: string, creatorId: string): Promise<void>;
  reorderLectures(moduleId: string, creatorId: string, orderedLectureIds: string[]): Promise<void>;
}
