import type { Module, CreateModuleInput } from '@codequest/shared';
import { DevelopmentModuleRepository } from '../repositories/development-module.repository';

// Initialize the repository.
// For Phase 3, this is the memory-based Development Repository.
const repository = new DevelopmentModuleRepository();

/**
 * Service abstraction for Module operations.
 */
export const moduleService = {
  async listModules(courseId: string, creatorId: string): Promise<Module[]> {
    return repository.listModules(courseId, creatorId);
  },

  async getModule(moduleId: string, courseId: string, creatorId: string): Promise<Module> {
    return repository.getModule(moduleId, courseId, creatorId);
  },

  async createModule(courseId: string, creatorId: string, input: CreateModuleInput): Promise<Module> {
    return repository.createModule(courseId, creatorId, input);
  },

  async updateModule(moduleId: string, courseId: string, creatorId: string, input: Partial<CreateModuleInput>): Promise<Module> {
    return repository.updateModule(moduleId, courseId, creatorId, input);
  },

  async deleteModule(moduleId: string, courseId: string, creatorId: string): Promise<void> {
    return repository.deleteModule(moduleId, courseId, creatorId);
  },

  async reorderModules(courseId: string, creatorId: string, orderedModuleIds: string[]): Promise<void> {
    return repository.reorderModules(courseId, creatorId, orderedModuleIds);
  }
};
