export type LectureContentBlock =
  | {
      id: string;
      type: 'TEXT';
      content: string;
    }
  | {
      id: string;
      type: 'CODE';
      language: string;
      code: string;
    }
  | {
      id: string;
      type: 'CALLOUT';
      content: string;
    };

export interface LectureVideo {
  id: string;
  url: string;
  title: string;
  description: string;
}

export interface LectureResource {
  id: string;
  title: string;
  url: string;
}

export interface Lecture {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  content: LectureContentBlock[];
  video: LectureVideo | null;
  resources: LectureResource[];
  position: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
