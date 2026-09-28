export interface CodingTestCase {
  id: string;
  input: string;
  expectedOutput: string;
}

export interface CodingHint {
  id: string;
  content: string;
  position: number;
}

export interface CodingCheckpoint {
  id: string;
  lectureId: string;
  title: string;
  instructions: string;
  language: 'python';
  starterCode: string;
  visibleTests: CodingTestCase[];
  hiddenTests: CodingTestCase[];
  hints: CodingHint[];
  xp: number;
  maxAttempts: number;
  mandatory: boolean;
  position: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
