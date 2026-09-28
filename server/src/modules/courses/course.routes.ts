import { Router } from 'express';
import { CourseController } from './course.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validate-request';
import { createCourseSchema } from '@codequest/shared';

const router = Router();
const controller = new CourseController();

// All course routes require authentication
router.use(authenticate);

// List courses for the current user
router.get('/', controller.getCourses);

// Get a specific course
router.get('/:id', controller.getCourse);

// Create a new course (creators only)
router.post(
  '/', 
  authorize(['CREATOR', 'ADMIN']), 
  validateRequest(createCourseSchema), 
  controller.createCourse
);

// Update a course (creators only)
router.patch(
  '/:id', 
  authorize(['CREATOR', 'ADMIN']), 
  validateRequest(createCourseSchema.partial()), 
  controller.updateCourse
);

export default router;
