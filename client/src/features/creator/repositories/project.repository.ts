import type { Project, ProjectMilestone, CreateProjectInput, CreateProjectMilestoneInput } from '@codequest/shared';

export interface IProjectRepository {
  listProjects(lectureId: string, creatorId: string): Promise<Project[]>;
  getProject(projectId: string, lectureId: string, creatorId: string): Promise<Project>;
  createProject(lectureId: string, creatorId: string, input: CreateProjectInput): Promise<Project>;
  updateProject(projectId: string, lectureId: string, creatorId: string, input: Partial<CreateProjectInput>): Promise<Project>;
  deleteProject(projectId: string, lectureId: string, creatorId: string): Promise<void>;
  reorderProjects(lectureId: string, creatorId: string, orderedProjectIds: string[]): Promise<void>;

  listProjectMilestones(projectId: string, creatorId: string): Promise<ProjectMilestone[]>;
  getProjectMilestone(milestoneId: string, projectId: string, creatorId: string): Promise<ProjectMilestone>;
  createProjectMilestone(projectId: string, creatorId: string, input: CreateProjectMilestoneInput): Promise<ProjectMilestone>;
  updateProjectMilestone(milestoneId: string, projectId: string, creatorId: string, input: Partial<CreateProjectMilestoneInput>): Promise<ProjectMilestone>;
  deleteProjectMilestone(milestoneId: string, projectId: string, creatorId: string): Promise<void>;
  reorderProjectMilestones(projectId: string, creatorId: string, orderedMilestoneIds: string[]): Promise<void>;
}
