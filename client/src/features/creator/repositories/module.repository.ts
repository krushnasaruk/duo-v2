import type { Module, CreateModuleInput } from '@codequest/shared';

export interface IModuleRepository {
  listModules(courseId: string, creatorId: string): Promise<Module[]>;
  getModule(moduleId: string, courseId: string, creatorId: string): Promise<Module>;
  createModule(courseId: string, creatorId: string, input: CreateModuleInput): Promise<Module>;
  updateModule(moduleId: string, courseId: string, creatorId: string, input: Partial<CreateModuleInput>): Promise<Module>;
  deleteModule(moduleId: string, courseId: string, creatorId: string): Promise<void>;
  reorderModules(courseId: string, creatorId: string, orderedModuleIds: string[]): Promise<void>;
}
