import type { Project, ProjectMilestone, CreateProjectInput, CreateProjectMilestoneInput } from '@codequest/shared';
import { DevelopmentProjectRepository } from '../repositories/development-project.repository';

const repository = new DevelopmentProjectRepository();

export const projectService = {
  async listProjects(lectureId: string, creatorId: string): Promise<Project[]> {
    return repository.listProjects(lectureId, creatorId);
  },

  async getProject(projectId: string, lectureId: string, creatorId: string): Promise<Project> {
    return repository.getProject(projectId, lectureId, creatorId);
  },

  async createProject(lectureId: string, creatorId: string, input: CreateProjectInput): Promise<Project> {
    return repository.createProject(lectureId, creatorId, input);
  },

  async updateProject(projectId: string, lectureId: string, creatorId: string, input: Partial<CreateProjectInput>): Promise<Project> {
    return repository.updateProject(projectId, lectureId, creatorId, input);
  },

  async deleteProject(projectId: string, lectureId: string, creatorId: string): Promise<void> {
    return repository.deleteProject(projectId, lectureId, creatorId);
  },

  async reorderProjects(lectureId: string, creatorId: string, orderedProjectIds: string[]): Promise<void> {
    return repository.reorderProjects(lectureId, creatorId, orderedProjectIds);
  },

  async listProjectMilestones(projectId: string, creatorId: string): Promise<ProjectMilestone[]> {
    return repository.listProjectMilestones(projectId, creatorId);
  },

  async getProjectMilestone(milestoneId: string, projectId: string, creatorId: string): Promise<ProjectMilestone> {
    return repository.getProjectMilestone(milestoneId, projectId, creatorId);
  },

  async createProjectMilestone(projectId: string, creatorId: string, input: CreateProjectMilestoneInput): Promise<ProjectMilestone> {
    return repository.createProjectMilestone(projectId, creatorId, input);
  },

  async updateProjectMilestone(milestoneId: string, projectId: string, creatorId: string, input: Partial<CreateProjectMilestoneInput>): Promise<ProjectMilestone> {
    return repository.updateProjectMilestone(milestoneId, projectId, creatorId, input);
  },

  async deleteProjectMilestone(milestoneId: string, projectId: string, creatorId: string): Promise<void> {
    return repository.deleteProjectMilestone(milestoneId, projectId, creatorId);
  },

  async reorderProjectMilestones(projectId: string, creatorId: string, orderedMilestoneIds: string[]): Promise<void> {
    return repository.reorderProjectMilestones(projectId, creatorId, orderedMilestoneIds);
  }
};
