import type { CodingCheckpoint, CreateCodingCheckpointInput } from '@codequest/shared';
import { DevelopmentCodingCheckpointRepository } from '../repositories/development-checkpoint.repository';

const repository = new DevelopmentCodingCheckpointRepository();

export const checkpointService = {
  async listCodingCheckpoints(lectureId: string, creatorId: string): Promise<CodingCheckpoint[]> {
    return repository.listCodingCheckpoints(lectureId, creatorId);
  },

  async getCodingCheckpoint(checkpointId: string, lectureId: string, creatorId: string): Promise<CodingCheckpoint> {
    return repository.getCodingCheckpoint(checkpointId, lectureId, creatorId);
  },

  async createCodingCheckpoint(lectureId: string, creatorId: string, input: CreateCodingCheckpointInput): Promise<CodingCheckpoint> {
    return repository.createCodingCheckpoint(lectureId, creatorId, input);
  },

  async updateCodingCheckpoint(checkpointId: string, lectureId: string, creatorId: string, input: Partial<CreateCodingCheckpointInput>): Promise<CodingCheckpoint> {
    return repository.updateCodingCheckpoint(checkpointId, lectureId, creatorId, input);
  },

  async deleteCodingCheckpoint(checkpointId: string, lectureId: string, creatorId: string): Promise<void> {
    return repository.deleteCodingCheckpoint(checkpointId, lectureId, creatorId);
  },

  async reorderCodingCheckpoints(lectureId: string, creatorId: string, orderedCheckpointIds: string[]): Promise<void> {
    return repository.reorderCodingCheckpoints(lectureId, creatorId, orderedCheckpointIds);
  }
};
