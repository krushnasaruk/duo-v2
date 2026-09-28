import type { Project, ProjectMilestone, CreateProjectInput, CreateProjectMilestoneInput } from '@codequest/shared';
import type { IProjectRepository } from './project.repository';

// In-memory array acting as our database
let projectsMemory: Project[] = [];
let milestonesMemory: ProjectMilestone[] = [];

export class DevelopmentProjectRepository implements IProjectRepository {
  
  async listProjects(lectureId: string, _creatorId: string): Promise<Project[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return projectsMemory
      .filter(p => p.lectureId === lectureId)
      .sort((a, b) => a.position - b.position);
  }

  async getProject(projectId: string, lectureId: string, _creatorId: string): Promise<Project> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const project = projectsMemory.find(p => p.id === projectId && p.lectureId === lectureId);
    if (!project) throw new Error('Project not found');
    return { ...project };
  }

  async createProject(lectureId: string, _creatorId: string, input: CreateProjectInput): Promise<Project> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const now = new Date();
    const lectureProjects = projectsMemory.filter(p => p.lectureId === lectureId);
    const position = lectureProjects.length > 0 
      ? Math.max(...lectureProjects.map(p => p.position)) + 1 
      : 0;
    
    const newProject: Project = {
      id: crypto.randomUUID(),
      lectureId,
      title: input.title,
      description: input.description,
      instructions: input.instructions,
      xp: input.xp,
      position,
      createdAt: now,
      updatedAt: now,
    };

    projectsMemory.push(newProject);
    return { ...newProject };
  }

  async updateProject(projectId: string, lectureId: string, _creatorId: string, input: Partial<CreateProjectInput>): Promise<Project> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = projectsMemory.findIndex(p => p.id === projectId && p.lectureId === lectureId);
    if (index === -1) throw new Error('Project not found');

    const updatedProject: Project = {
      ...projectsMemory[index],
      ...input,
      id: projectsMemory[index].id,
      lectureId: projectsMemory[index].lectureId,
      position: projectsMemory[index].position,
      createdAt: projectsMemory[index].createdAt,
      updatedAt: new Date(),
    };

    projectsMemory[index] = updatedProject;
    return { ...updatedProject };
  }

  async deleteProject(projectId: string, lectureId: string, _creatorId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = projectsMemory.findIndex(p => p.id === projectId && p.lectureId === lectureId);
    if (index === -1) throw new Error('Project not found');

    projectsMemory.splice(index, 1);
    
    // Cascade delete milestones
    milestonesMemory = milestonesMemory.filter(m => m.projectId !== projectId);

    // Normalize positions
    const lectureProjects = projectsMemory
      .filter(p => p.lectureId === lectureId)
      .sort((a, b) => a.position - b.position);

    lectureProjects.forEach((p, idx) => {
      const globalIdx = projectsMemory.findIndex(mp => mp.id === p.id);
      projectsMemory[globalIdx].position = idx;
    });
  }

  async reorderProjects(lectureId: string, _creatorId: string, orderedProjectIds: string[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const lectureProjects = projectsMemory.filter(p => p.lectureId === lectureId);
    if (lectureProjects.length !== orderedProjectIds.length) {
      throw new Error('Invalid reorder request: project count mismatch');
    }

    orderedProjectIds.forEach((id, newPosition) => {
      const idx = projectsMemory.findIndex(p => p.id === id && p.lectureId === lectureId);
      if (idx !== -1) {
        projectsMemory[idx].position = newPosition;
        projectsMemory[idx].updatedAt = new Date();
      }
    });
  }

  // --- Milestones ---

  async listProjectMilestones(projectId: string, _creatorId: string): Promise<ProjectMilestone[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const project = projectsMemory.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    return milestonesMemory
      .filter(m => m.projectId === projectId)
      .sort((a, b) => a.position - b.position);
  }

  async getProjectMilestone(milestoneId: string, projectId: string, _creatorId: string): Promise<ProjectMilestone> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const milestone = milestonesMemory.find(m => m.id === milestoneId && m.projectId === projectId);
    if (!milestone) throw new Error('Milestone not found');
    return { ...milestone };
  }

  async createProjectMilestone(projectId: string, _creatorId: string, input: CreateProjectMilestoneInput): Promise<ProjectMilestone> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const project = projectsMemory.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const projectMilestones = milestonesMemory.filter(m => m.projectId === projectId);
    const position = projectMilestones.length > 0 
      ? Math.max(...projectMilestones.map(m => m.position)) + 1 
      : 0;

    const now = new Date();
    const newMilestone: ProjectMilestone = {
      ...input,
      id: crypto.randomUUID(),
      projectId,
      position,
      createdAt: now,
      updatedAt: now
    };

    milestonesMemory.push(newMilestone);
    return { ...newMilestone };
  }

  async updateProjectMilestone(milestoneId: string, projectId: string, _creatorId: string, input: Partial<CreateProjectMilestoneInput>): Promise<ProjectMilestone> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = milestonesMemory.findIndex(m => m.id === milestoneId && m.projectId === projectId);
    if (index === -1) throw new Error('Milestone not found');

    const updatedMilestone: ProjectMilestone = {
      ...milestonesMemory[index],
      ...input,
      id: milestonesMemory[index].id,
      projectId: milestonesMemory[index].projectId,
      position: milestonesMemory[index].position,
      createdAt: milestonesMemory[index].createdAt,
      updatedAt: new Date(),
    };

    milestonesMemory[index] = updatedMilestone;
    return { ...updatedMilestone };
  }

  async deleteProjectMilestone(milestoneId: string, projectId: string, _creatorId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = milestonesMemory.findIndex(m => m.id === milestoneId && m.projectId === projectId);
    if (index === -1) throw new Error('Milestone not found');

    milestonesMemory.splice(index, 1);

    // Normalize positions
    const sortedMilestones = milestonesMemory
      .filter(m => m.projectId === projectId)
      .sort((a, b) => a.position - b.position);
    
    sortedMilestones.forEach((m, idx) => {
      const globalIdx = milestonesMemory.findIndex(gM => gM.id === m.id);
      milestonesMemory[globalIdx].position = idx;
    });
  }

  async reorderProjectMilestones(projectId: string, _creatorId: string, orderedMilestoneIds: string[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const projectMilestones = milestonesMemory.filter(m => m.projectId === projectId);
    
    if (projectMilestones.length !== orderedMilestoneIds.length) {
      throw new Error('Invalid reorder request: milestone count mismatch');
    }

    orderedMilestoneIds.forEach((id, newPosition) => {
      const idx = milestonesMemory.findIndex(m => m.id === id && m.projectId === projectId);
      if (idx !== -1) {
        milestonesMemory[idx].position = newPosition;
        milestonesMemory[idx].updatedAt = new Date();
      }
    });
  }
}
