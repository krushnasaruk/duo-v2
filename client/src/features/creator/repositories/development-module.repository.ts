import type { Module, CreateModuleInput } from '@codequest/shared';
import type { IModuleRepository } from './module.repository';

// In-memory array acting as our database
let modulesMemory: Module[] = [];

/**
 * Temporary development repository that stores modules in process memory.
 */
export class DevelopmentModuleRepository implements IModuleRepository {
  
  async listModules(courseId: string, _creatorId: string): Promise<Module[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // We mock ownership checks implicitly here by assuming the course ownership 
    // has already been validated, but ideally, we should verify the course belongs to creatorId.
    // For now, we return modules that match the courseId.
    return modulesMemory
      .filter(m => m.courseId === courseId)
      .sort((a, b) => a.position - b.position);
  }

  async getModule(moduleId: string, courseId: string, _creatorId: string): Promise<Module> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const module = modulesMemory.find(m => m.id === moduleId && m.courseId === courseId);
    
    if (!module) {
      throw new Error('Module not found');
    }

    return { ...module };
  }

  async createModule(courseId: string, _creatorId: string, input: CreateModuleInput): Promise<Module> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const now = new Date();
    const courseModules = modulesMemory.filter(m => m.courseId === courseId);
    const position = courseModules.length > 0 
      ? Math.max(...courseModules.map(m => m.position)) + 1 
      : 0;
    
    const newModule: Module = {
      id: crypto.randomUUID(),
      courseId,
      title: input.title,
      description: input.description,
      position,
      createdAt: now,
      updatedAt: now,
    };

    modulesMemory.push(newModule);
    return { ...newModule };
  }

  async updateModule(moduleId: string, courseId: string, _creatorId: string, input: Partial<CreateModuleInput>): Promise<Module> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const index = modulesMemory.findIndex(m => m.id === moduleId && m.courseId === courseId);
    
    if (index === -1) {
      throw new Error('Module not found');
    }

    const updatedModule: Module = {
      ...modulesMemory[index],
      ...input,
      id: modulesMemory[index].id,
      courseId: modulesMemory[index].courseId,
      position: modulesMemory[index].position,
      createdAt: modulesMemory[index].createdAt,
      updatedAt: new Date(),
    };

    modulesMemory[index] = updatedModule;
    return { ...updatedModule };
  }

  async deleteModule(moduleId: string, courseId: string, _creatorId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = modulesMemory.findIndex(m => m.id === moduleId && m.courseId === courseId);
    if (index === -1) {
      throw new Error('Module not found');
    }

    // Remove module
    modulesMemory.splice(index, 1);

    // Reorder remaining modules for this course
    const courseModules = modulesMemory
      .filter(m => m.courseId === courseId)
      .sort((a, b) => a.position - b.position);

    courseModules.forEach((mod, idx) => {
      const globalIdx = modulesMemory.findIndex(m => m.id === mod.id);
      modulesMemory[globalIdx].position = idx;
    });
  }

  async reorderModules(courseId: string, _creatorId: string, orderedModuleIds: string[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const courseModules = modulesMemory.filter(m => m.courseId === courseId);
    
    // Validate that all ordered IDs exist in the course
    if (courseModules.length !== orderedModuleIds.length) {
      throw new Error('Invalid reorder request: module count mismatch');
    }

    // Update positions based on array index
    orderedModuleIds.forEach((id, newPosition) => {
      const idx = modulesMemory.findIndex(m => m.id === id && m.courseId === courseId);
      if (idx !== -1) {
        modulesMemory[idx].position = newPosition;
        modulesMemory[idx].updatedAt = new Date();
      }
    });
  }
}
