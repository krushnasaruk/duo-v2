import type { CodingCheckpoint, CreateCodingCheckpointInput } from '@codequest/shared';

export interface ICodingCheckpointRepository {
  listCodingCheckpoints(lectureId: string, creatorId: string): Promise<CodingCheckpoint[]>;
  getCodingCheckpoint(checkpointId: string, lectureId: string, creatorId: string): Promise<CodingCheckpoint>;
  createCodingCheckpoint(lectureId: string, creatorId: string, input: CreateCodingCheckpointInput): Promise<CodingCheckpoint>;
  updateCodingCheckpoint(checkpointId: string, lectureId: string, creatorId: string, input: Partial<CreateCodingCheckpointInput>): Promise<CodingCheckpoint>;
  deleteCodingCheckpoint(checkpointId: string, lectureId: string, creatorId: string): Promise<void>;
  reorderCodingCheckpoints(lectureId: string, creatorId: string, orderedCheckpointIds: string[]): Promise<void>;
}
