export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  position: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
