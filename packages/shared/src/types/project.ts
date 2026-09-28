export interface Project {
  id: string;
  lectureId?: string;
  moduleId?: string;
  title: string;
  description: string;
  instructions: string;
  xp: number;
  position: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  xp: number;
  position: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
