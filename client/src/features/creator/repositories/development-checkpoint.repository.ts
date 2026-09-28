import type { CodingCheckpoint, CreateCodingCheckpointInput } from '@codequest/shared';
import type { ICodingCheckpointRepository } from './checkpoint.repository';

// In-memory array acting as our database
let checkpointsMemory: CodingCheckpoint[] = [];

export class DevelopmentCodingCheckpointRepository implements ICodingCheckpointRepository {
  
  async listCodingCheckpoints(lectureId: string, _creatorId: string): Promise<CodingCheckpoint[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return checkpointsMemory
      .filter(c => c.lectureId === lectureId)
      .sort((a, b) => a.position - b.position);
  }

  async getCodingCheckpoint(checkpointId: string, lectureId: string, _creatorId: string): Promise<CodingCheckpoint> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const checkpoint = checkpointsMemory.find(c => c.id === checkpointId && c.lectureId === lectureId);
    
    if (!checkpoint) {
      throw new Error('Coding Checkpoint not found');
    }

    return { ...checkpoint };
  }

  async createCodingCheckpoint(lectureId: string, _creatorId: string, input: CreateCodingCheckpointInput): Promise<CodingCheckpoint> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const now = new Date();
    const lectureCheckpoints = checkpointsMemory.filter(c => c.lectureId === lectureId);
    const position = lectureCheckpoints.length > 0 
      ? Math.max(...lectureCheckpoints.map(c => c.position)) + 1 
      : 0;
    
    const newCheckpoint: CodingCheckpoint = {
      id: crypto.randomUUID(),
      lectureId,
      title: input.title,
      instructions: input.instructions,
      language: input.language,
      starterCode: input.starterCode,
      visibleTests: input.visibleTests || [],
      hiddenTests: input.hiddenTests || [],
      hints: input.hints || [],
      xp: input.xp,
      maxAttempts: input.maxAttempts,
      mandatory: input.mandatory,
      position,
      createdAt: now,
      updatedAt: now,
    };

    checkpointsMemory.push(newCheckpoint);
    return { ...newCheckpoint };
  }

  async updateCodingCheckpoint(checkpointId: string, lectureId: string, _creatorId: string, input: Partial<CreateCodingCheckpointInput>): Promise<CodingCheckpoint> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const index = checkpointsMemory.findIndex(c => c.id === checkpointId && c.lectureId === lectureId);
    
    if (index === -1) {
      throw new Error('Coding Checkpoint not found');
    }

    const updatedCheckpoint: CodingCheckpoint = {
      ...checkpointsMemory[index],
      ...input,
      id: checkpointsMemory[index].id,
      lectureId: checkpointsMemory[index].lectureId,
      position: checkpointsMemory[index].position,
      createdAt: checkpointsMemory[index].createdAt,
      updatedAt: new Date(),
    };

    checkpointsMemory[index] = updatedCheckpoint;
    return { ...updatedCheckpoint };
  }

  async deleteCodingCheckpoint(checkpointId: string, lectureId: string, _creatorId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = checkpointsMemory.findIndex(c => c.id === checkpointId && c.lectureId === lectureId);
    if (index === -1) {
      throw new Error('Coding Checkpoint not found');
    }

    checkpointsMemory.splice(index, 1);

    const lectureCheckpoints = checkpointsMemory
      .filter(c => c.lectureId === lectureId)
      .sort((a, b) => a.position - b.position);

    lectureCheckpoints.forEach((chk, idx) => {
      const globalIdx = checkpointsMemory.findIndex(c => c.id === chk.id);
      checkpointsMemory[globalIdx].position = idx;
    });
  }

  async reorderCodingCheckpoints(lectureId: string, _creatorId: string, orderedCheckpointIds: string[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const lectureCheckpoints = checkpointsMemory.filter(c => c.lectureId === lectureId);
    
    if (lectureCheckpoints.length !== orderedCheckpointIds.length) {
      throw new Error('Invalid reorder request: checkpoint count mismatch');
    }

    orderedCheckpointIds.forEach((id, newPosition) => {
      const idx = checkpointsMemory.findIndex(c => c.id === id && c.lectureId === lectureId);
      if (idx !== -1) {
        checkpointsMemory[idx].position = newPosition;
        checkpointsMemory[idx].updatedAt = new Date();
      }
    });
  }
}
