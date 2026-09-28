export type CourseStatus = 
  | 'DRAFT'
  | 'READY_FOR_REVIEW'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'CHANGES_REQUESTED';

export interface Course {
  id: string;
  creatorId: string;
  title: string;
  shortDescription?: string | null;
  fullDescription?: string | null;
  tagline?: string | null;
  category?: string | null;
  subcategory?: string | null;
  difficulty?: string | null;
  language: string;
  targetAudience?: string | null;
  duration?: string | null;
  prerequisites: string[];
  learningObjectives: string[];
  skills: string[];
  glossary?: { id?: string; term: string; definition: string; relatedTerms: string[] }[];
  thumbnailUrl?: string | null;
  status: CourseStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}
