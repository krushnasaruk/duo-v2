import { courseService } from './course.service';
import { moduleService } from './module.service';
import { lectureService } from './lecture.service';
import { checkpointService } from './checkpoint.service';
import { quizService } from './quiz.service';
import { projectService } from './project.service';
import type { CourseValidationIssue } from '@codequest/shared';

export interface CompleteCourseHierarchy {
  course: any;
  modules: any[];
  lectures: any[];
  contents: any[];
  videos: any[];
  resources: any[];
  checkpoints: any[];
  quizzes: any[];
  questions: any[];
  projects: any[];
  milestones: any[];
}

export const courseValidationService = {
  async getCompleteCourseHierarchy(courseId: string, creatorId: string): Promise<CompleteCourseHierarchy> {
    const course = await courseService.getCourse(courseId, creatorId);
    const modules = await moduleService.listModules(courseId, creatorId);
    
    let allLectures: any[] = [];
    let allContents: any[] = [];
    let allVideos: any[] = [];
    let allResources: any[] = [];
    let allCheckpoints: any[] = [];
    let allQuizzes: any[] = [];
    let allQuestions: any[] = [];
    let allProjects: any[] = [];
    let allMilestones: any[] = [];

    for (const mod of modules) {
      const lectures = await lectureService.listLectures(mod.id, creatorId);
      allLectures = [...allLectures, ...lectures];

      for (const lec of lectures) {
        // Contents, Videos, Resources are embedded in Lecture
        if (lec.content) {
          allContents = [...allContents, ...lec.content.map((c: any) => ({ ...c, lectureId: lec.id, moduleId: mod.id }))];
        }
        
        if (lec.video) {
          allVideos.push({ ...lec.video, lectureId: lec.id, moduleId: mod.id });
        }

        if (lec.resources) {
          allResources = [...allResources, ...lec.resources.map((r: any) => ({ ...r, lectureId: lec.id, moduleId: mod.id }))];
        }

        // Checkpoints
        const checkpoints = await checkpointService.listCodingCheckpoints(lec.id, creatorId);
        allCheckpoints = [...allCheckpoints, ...checkpoints];

        // Quizzes
        const quizzes = await quizService.listQuizzes(lec.id, creatorId);
        allQuizzes = [...allQuizzes, ...quizzes];

        for (const quiz of quizzes) {
          const questions = await quizService.listQuizQuestions(quiz.id, creatorId);
          allQuestions = [...allQuestions, ...questions];
        }

        // Projects
        const projects = await projectService.listProjects(lec.id, creatorId);
        allProjects = [...allProjects, ...projects];

        for (const project of projects) {
          const milestones = await projectService.listProjectMilestones(project.id, creatorId);
          allMilestones = [...allMilestones, ...milestones];
        }
      }
    }

    return {
      course,
      modules,
      lectures: allLectures,
      contents: allContents,
      videos: allVideos,
      resources: allResources,
      checkpoints: allCheckpoints,
      quizzes: allQuizzes,
      questions: allQuestions,
      projects: allProjects,
      milestones: allMilestones,
    };
  },

  async validateCourse(courseId: string, creatorId: string): Promise<CourseValidationIssue[]> {
    const data = await this.getCompleteCourseHierarchy(courseId, creatorId);
    const issues: CourseValidationIssue[] = [];

    // Course Validation
    const requiredCourseFields = [
      'title', 'shortDescription', 'description', 'tagline', 
      'categoryId', 'subcategoryId', 'difficulty', 'language', 
      'targetAudience', 'duration', 'prerequisites', 'learningObjectives', 'skills'
    ];
    for (const field of requiredCourseFields) {
      if (!data.course[field] || (Array.isArray(data.course[field]) && data.course[field].length === 0)) {
        issues.push({
          severity: 'ERROR',
          code: 'COURSE_FIELD_MISSING',
          message: `Course is missing required field: ${field}`
        });
      }
    }

    if (!data.course.thumbnailUrl) {
      issues.push({
        severity: 'WARNING',
        code: 'COURSE_THUMBNAIL_MISSING',
        message: 'Course has no thumbnail.'
      });
    }

    if (data.modules.length === 0) {
      issues.push({
        severity: 'ERROR',
        code: 'COURSE_NO_MODULES',
        message: 'Course contains zero modules.'
      });
    }

    // Module Validation
    for (const mod of data.modules) {
      if (!mod.title?.trim()) {
        issues.push({
          severity: 'ERROR',
          code: 'MODULE_TITLE_BLANK',
          message: 'Module title is blank.',
          moduleId: mod.id
        });
      }
      if (!mod.description?.trim()) {
        issues.push({
          severity: 'ERROR',
          code: 'MODULE_DESCRIPTION_BLANK',
          message: 'Module description is blank.',
          moduleId: mod.id
        });
      }

      const modLectures = data.lectures.filter(l => l.moduleId === mod.id);
      if (modLectures.length === 0) {
        issues.push({
          severity: 'ERROR',
          code: 'MODULE_NO_LECTURES',
          message: 'A module contains zero lectures.',
          moduleId: mod.id
        });
      }
    }

    // Lecture Validation
    for (const lec of data.lectures) {
      if (!lec.title?.trim()) {
        issues.push({
          severity: 'ERROR',
          code: 'LECTURE_TITLE_BLANK',
          message: 'Lecture title is blank.',
          moduleId: lec.moduleId,
          lectureId: lec.id
        });
      }
      if (!lec.description?.trim()) {
        issues.push({
          severity: 'ERROR',
          code: 'LECTURE_DESCRIPTION_BLANK',
          message: 'Lecture description is blank.',
          moduleId: lec.moduleId,
          lectureId: lec.id
        });
      }

      const lecContents = data.contents.filter(c => c.lectureId === lec.id);
      if (lecContents.length === 0) {
        issues.push({
          severity: 'ERROR',
          code: 'LECTURE_NO_CONTENT',
          message: 'Lecture has no content blocks.',
          moduleId: lec.moduleId,
          lectureId: lec.id
        });
      }

      for (const content of lecContents) {
        if (content.type === 'TEXT' && !content.content?.trim()) {
          issues.push({
            severity: 'ERROR',
            code: 'LECTURE_CONTENT_TEXT_BLANK',
            message: 'TEXT block is blank.',
            moduleId: lec.moduleId,
            lectureId: lec.id
          });
        }
        if (content.type === 'CALLOUT' && !content.content?.trim()) {
          issues.push({
            severity: 'ERROR',
            code: 'LECTURE_CONTENT_CALLOUT_BLANK',
            message: 'CALLOUT block is blank.',
            moduleId: lec.moduleId,
            lectureId: lec.id
          });
        }
        if (content.type === 'CODE') {
          const codeData = JSON.parse(content.content || '{}');
          if (!codeData.language?.trim()) {
            issues.push({
              severity: 'ERROR',
              code: 'LECTURE_CONTENT_CODE_LANGUAGE_BLANK',
              message: 'CODE block has blank language.',
              moduleId: lec.moduleId,
              lectureId: lec.id
            });
          }
          if (!codeData.code?.trim()) {
            issues.push({
              severity: 'ERROR',
              code: 'LECTURE_CONTENT_CODE_BLANK',
              message: 'CODE block has blank code.',
              moduleId: lec.moduleId,
              lectureId: lec.id
            });
          }
        }
      }

      const lecVideo = data.videos.find(v => v.lectureId === lec.id);
      if (lecVideo) {
        if (!lecVideo.url?.trim()) {
          issues.push({
            severity: 'ERROR',
            code: 'VIDEO_URL_BLANK',
            message: 'Video URL is blank.',
            moduleId: lec.moduleId,
            lectureId: lec.id
          });
        } else if (!lecVideo.url.startsWith('https://')) {
          issues.push({
            severity: 'ERROR',
            code: 'VIDEO_URL_UNSAFE',
            message: 'Video URL uses an unsafe protocol.',
            moduleId: lec.moduleId,
            lectureId: lec.id
          });
        }
        if (!lecVideo.title?.trim()) {
          issues.push({
            severity: 'ERROR',
            code: 'VIDEO_TITLE_BLANK',
            message: 'Video title is blank.',
            moduleId: lec.moduleId,
            lectureId: lec.id
          });
        }
        if (!lecVideo.description?.trim()) {
          issues.push({
            severity: 'ERROR',
            code: 'VIDEO_DESCRIPTION_BLANK',
            message: 'Video description is blank.',
            moduleId: lec.moduleId,
            lectureId: lec.id
          });
        }
      } else {
        issues.push({
          severity: 'WARNING',
          code: 'LECTURE_NO_VIDEO',
          message: 'Lecture has no video.',
          moduleId: lec.moduleId,
          lectureId: lec.id
        });
      }

      const lecResources = data.resources.filter(r => r.lectureId === lec.id);
      if (lecResources.length > 0) {
        for (const res of lecResources) {
          if (!res.title?.trim()) {
            issues.push({
              severity: 'ERROR',
              code: 'RESOURCE_TITLE_BLANK',
              message: 'Resource title is blank.',
              moduleId: lec.moduleId,
              lectureId: lec.id
            });
          }
          if (!res.url?.trim()) {
            issues.push({
              severity: 'ERROR',
              code: 'RESOURCE_URL_BLANK',
              message: 'Resource URL is blank.',
              moduleId: lec.moduleId,
              lectureId: lec.id
            });
          } else if (!res.url.startsWith('https://') && !res.url.startsWith('http://')) {
            issues.push({
              severity: 'ERROR',
              code: 'RESOURCE_URL_UNSAFE',
              message: 'Resource URL uses an unsafe protocol.',
              moduleId: lec.moduleId,
              lectureId: lec.id
            });
          }
        }
      } else {
        issues.push({
          severity: 'WARNING',
          code: 'LECTURE_NO_RESOURCES',
          message: 'Lecture has no resources.',
          moduleId: lec.moduleId,
          lectureId: lec.id
        });
      }

      const lecCheckpoints = data.checkpoints.filter(c => c.lectureId === lec.id);
      if (lecCheckpoints.length > 0) {
        for (const cp of lecCheckpoints) {
          if (!cp.title?.trim()) issues.push({ severity: 'ERROR', code: 'CHECKPOINT_TITLE_BLANK', message: 'Checkpoint title is blank.', moduleId: lec.moduleId, lectureId: lec.id, checkpointId: cp.id });
          if (!cp.instructions?.trim()) issues.push({ severity: 'ERROR', code: 'CHECKPOINT_INSTRUCTIONS_BLANK', message: 'Checkpoint instructions are blank.', moduleId: lec.moduleId, lectureId: lec.id, checkpointId: cp.id });
          if (!cp.starterCode?.trim()) issues.push({ severity: 'ERROR', code: 'CHECKPOINT_STARTER_CODE_BLANK', message: 'Checkpoint starter code is blank.', moduleId: lec.moduleId, lectureId: lec.id, checkpointId: cp.id });
          if (cp.language !== 'python') issues.push({ severity: 'ERROR', code: 'CHECKPOINT_LANGUAGE_INVALID', message: 'Checkpoint language is not Python.', moduleId: lec.moduleId, lectureId: lec.id, checkpointId: cp.id });
          if (!cp.xp || cp.xp <= 0) issues.push({ severity: 'ERROR', code: 'CHECKPOINT_XP_INVALID', message: 'Checkpoint XP is invalid.', moduleId: lec.moduleId, lectureId: lec.id, checkpointId: cp.id });
          if (!cp.maxAttempts || cp.maxAttempts <= 0) issues.push({ severity: 'ERROR', code: 'CHECKPOINT_ATTEMPTS_INVALID', message: 'Checkpoint max attempts is invalid.', moduleId: lec.moduleId, lectureId: lec.id, checkpointId: cp.id });
          
          for (const test of cp.visibleTests) {
            if (!test.input?.trim() || !test.expectedOutput?.trim()) issues.push({ severity: 'ERROR', code: 'CHECKPOINT_VISIBLE_TEST_INVALID', message: 'Checkpoint visible test input/output cannot be missing.', moduleId: lec.moduleId, lectureId: lec.id, checkpointId: cp.id });
          }
          for (const test of cp.hiddenTests) {
            if (!test.input?.trim() || !test.expectedOutput?.trim()) issues.push({ severity: 'ERROR', code: 'CHECKPOINT_HIDDEN_TEST_INVALID', message: 'Checkpoint hidden test input/output cannot be missing.', moduleId: lec.moduleId, lectureId: lec.id, checkpointId: cp.id });
          }
          for (const hint of cp.hints) {
            if (!hint.content?.trim()) issues.push({ severity: 'ERROR', code: 'CHECKPOINT_HINT_INVALID', message: 'Checkpoint hint content cannot be blank.', moduleId: lec.moduleId, lectureId: lec.id, checkpointId: cp.id });
          }
        }
      } else {
        issues.push({ severity: 'WARNING', code: 'LECTURE_NO_CHECKPOINT', message: 'Lecture has no coding checkpoint.', moduleId: lec.moduleId, lectureId: lec.id });
      }

      const lecQuizzes = data.quizzes.filter(q => q.lectureId === lec.id);
      if (lecQuizzes.length > 0) {
        for (const quiz of lecQuizzes) {
          if (!quiz.title?.trim()) issues.push({ severity: 'ERROR', code: 'QUIZ_TITLE_BLANK', message: 'Quiz title is blank.', moduleId: lec.moduleId, lectureId: lec.id, quizId: quiz.id });
          if (!quiz.description?.trim()) issues.push({ severity: 'ERROR', code: 'QUIZ_DESCRIPTION_BLANK', message: 'Quiz description is blank.', moduleId: lec.moduleId, lectureId: lec.id, quizId: quiz.id });
          
          const quizQuestions = data.questions.filter(q => q.quizId === quiz.id);
          if (quizQuestions.length === 0) {
            issues.push({ severity: 'ERROR', code: 'QUIZ_NO_QUESTIONS', message: 'Quiz has no questions.', moduleId: lec.moduleId, lectureId: lec.id, quizId: quiz.id });
          }

          for (const qq of quizQuestions) {
            if (!qq.question?.trim()) issues.push({ severity: 'ERROR', code: 'QUESTION_TEXT_BLANK', message: 'Question text is blank.', moduleId: lec.moduleId, lectureId: lec.id, quizId: quiz.id, questionId: qq.id });
            if (!qq.explanation?.trim()) issues.push({ severity: 'ERROR', code: 'QUESTION_EXPLANATION_BLANK', message: 'Question explanation is blank.', moduleId: lec.moduleId, lectureId: lec.id, quizId: quiz.id, questionId: qq.id });
            if (!qq.xp || qq.xp <= 0) issues.push({ severity: 'ERROR', code: 'QUESTION_XP_INVALID', message: 'Question XP is invalid.', moduleId: lec.moduleId, lectureId: lec.id, quizId: quiz.id, questionId: qq.id });
            if (qq.type !== 'MCQ' && qq.type !== 'TRUE_FALSE') issues.push({ severity: 'ERROR', code: 'QUESTION_TYPE_INVALID', message: 'Unsupported question type is present.', moduleId: lec.moduleId, lectureId: lec.id, quizId: quiz.id, questionId: qq.id });
            
            if (qq.type === 'MCQ') {
              if (qq.options.length < 2) issues.push({ severity: 'ERROR', code: 'QUESTION_MCQ_OPTIONS_FEW', message: 'MCQ must have at least two options.', moduleId: lec.moduleId, lectureId: lec.id, quizId: quiz.id, questionId: qq.id });
              if (qq.options.some((o: any) => !o.text?.trim())) issues.push({ severity: 'ERROR', code: 'QUESTION_MCQ_OPTIONS_BLANK', message: 'MCQ has blank options.', moduleId: lec.moduleId, lectureId: lec.id, quizId: quiz.id, questionId: qq.id });
              if (!qq.correctOptionId) issues.push({ severity: 'ERROR', code: 'QUESTION_MCQ_NO_CORRECT', message: 'MCQ must have exactly one correct option.', moduleId: lec.moduleId, lectureId: lec.id, quizId: quiz.id, questionId: qq.id });
            }

            if (qq.type === 'TRUE_FALSE') {
              if (qq.options.length !== 2) issues.push({ severity: 'ERROR', code: 'QUESTION_TF_OPTIONS_COUNT', message: 'True/False must have exactly two options.', moduleId: lec.moduleId, lectureId: lec.id, quizId: quiz.id, questionId: qq.id });
              if (!qq.options.some((o: any) => o.text === 'True') || !qq.options.some((o: any) => o.text === 'False')) issues.push({ severity: 'ERROR', code: 'QUESTION_TF_OPTIONS_INVALID', message: 'True/False options must represent True and False.', moduleId: lec.moduleId, lectureId: lec.id, quizId: quiz.id, questionId: qq.id });
              if (!qq.correctOptionId) issues.push({ severity: 'ERROR', code: 'QUESTION_TF_NO_CORRECT', message: 'True/False must have exactly one correct answer.', moduleId: lec.moduleId, lectureId: lec.id, quizId: quiz.id, questionId: qq.id });
            }
          }
        }
      } else {
        issues.push({ severity: 'WARNING', code: 'LECTURE_NO_QUIZ', message: 'Lecture has no quiz.', moduleId: lec.moduleId, lectureId: lec.id });
      }

      const lecProjects = data.projects.filter(p => p.lectureId === lec.id);
      if (lecProjects.length > 0) {
        for (const proj of lecProjects) {
          if (!proj.title?.trim()) issues.push({ severity: 'ERROR', code: 'PROJECT_TITLE_BLANK', message: 'Project title is blank.', moduleId: lec.moduleId, lectureId: lec.id, projectId: proj.id });
          if (!proj.description?.trim()) issues.push({ severity: 'ERROR', code: 'PROJECT_DESCRIPTION_BLANK', message: 'Project description is blank.', moduleId: lec.moduleId, lectureId: lec.id, projectId: proj.id });
          if (!proj.instructions?.trim()) issues.push({ severity: 'ERROR', code: 'PROJECT_INSTRUCTIONS_BLANK', message: 'Project instructions are blank.', moduleId: lec.moduleId, lectureId: lec.id, projectId: proj.id });
          if (!proj.xp || proj.xp <= 0) issues.push({ severity: 'ERROR', code: 'PROJECT_XP_INVALID', message: 'Project XP is invalid.', moduleId: lec.moduleId, lectureId: lec.id, projectId: proj.id });

          const projMilestones = data.milestones.filter(m => m.projectId === proj.id);
          if (projMilestones.length === 0) {
            issues.push({ severity: 'ERROR', code: 'PROJECT_NO_MILESTONES', message: 'Project contains no milestones.', moduleId: lec.moduleId, lectureId: lec.id, projectId: proj.id });
          }

          for (const ms of projMilestones) {
            if (!ms.title?.trim()) issues.push({ severity: 'ERROR', code: 'MILESTONE_TITLE_BLANK', message: 'Milestone title is blank.', moduleId: lec.moduleId, lectureId: lec.id, projectId: proj.id, milestoneId: ms.id });
            if (!ms.description?.trim()) issues.push({ severity: 'ERROR', code: 'MILESTONE_DESCRIPTION_BLANK', message: 'Milestone description is blank.', moduleId: lec.moduleId, lectureId: lec.id, projectId: proj.id, milestoneId: ms.id });
            if (!ms.xp || ms.xp <= 0) issues.push({ severity: 'ERROR', code: 'MILESTONE_XP_INVALID', message: 'Milestone XP is invalid.', moduleId: lec.moduleId, lectureId: lec.id, projectId: proj.id, milestoneId: ms.id });
          }
        }
      } else {
        issues.push({ severity: 'WARNING', code: 'LECTURE_NO_PROJECT', message: 'Lecture has no project.', moduleId: lec.moduleId, lectureId: lec.id });
      }
    }

    return issues;
  }
};
