export type ValidationSeverity = "ERROR" | "WARNING";

export interface CourseValidationIssue {
  severity: ValidationSeverity;
  code: string;
  message: string;
  moduleId?: string;
  lectureId?: string;
  quizId?: string;
  questionId?: string;
  checkpointId?: string;
  projectId?: string;
  milestoneId?: string;
}
