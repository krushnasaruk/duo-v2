import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { ApiError } from '../../errors/api.error';
import crypto from 'crypto';

export class CourseController {
  
  getCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUserId = req.user!.id;
      
      // Fetch profile to get profile ID
      const profile = await prisma.profile.findUnique({
        where: { userId: authUserId }
      });
      
      if (!profile) {
        throw new ApiError(404, 'Creator profile not found');
      }

      const courses = await prisma.course.findMany({
        where: { creator_id: profile.id },
        orderBy: { updated_at: 'desc' }
      });

      // Map prisma fields to shared interface fields
      const formattedCourses = courses.map(course => ({
        id: course.id,
        creatorId: course.creator_id,
        title: course.title,
        shortDescription: course.short_description,
        fullDescription: course.full_description,
        tagline: course.tagline,
        category: course.category,
        subcategory: course.subcategory,
        difficulty: course.difficulty,
        language: course.language,
        targetAudience: course.target_audience,
        duration: course.estimated_duration,
        prerequisites: course.prerequisites,
        learningObjectives: course.learning_objectives,
        skills: course.skills_gained,
        thumbnailUrl: course.thumbnail_url,
        status: course.status,
        createdAt: course.created_at,
        updatedAt: course.updated_at
      }));

      res.json({ courses: formattedCourses });
    } catch (error) {
      next(error);
    }
  };

  getCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const authUserId = req.user!.id;

      const profile = await prisma.profile.findUnique({
        where: { userId: authUserId }
      });

      const course = await prisma.course.findUnique({
        where: { id }
      });

      if (!course) {
        throw new ApiError(404, 'Course not found');
      }

      // Check ownership
      if (profile && course.creator_id !== profile.id && req.user!.role !== 'ADMIN') {
        throw new ApiError(403, 'Not authorized to access this course');
      }

      res.json({
        course: {
          id: course.id,
          creatorId: course.creator_id,
          title: course.title,
          shortDescription: course.short_description,
          fullDescription: course.full_description,
          tagline: course.tagline,
          category: course.category,
          subcategory: course.subcategory,
          difficulty: course.difficulty,
          language: course.language,
          targetAudience: course.target_audience,
          duration: course.estimated_duration,
          prerequisites: course.prerequisites,
          learningObjectives: course.learning_objectives,
          skills: course.skills_gained,
          thumbnailUrl: course.thumbnail_url,
          status: course.status,
          createdAt: course.created_at,
          updatedAt: course.updated_at
        }
      });
    } catch (error) {
      next(error);
    }
  };

  createCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const authUserId = req.user!.id;
      
      const profile = await prisma.profile.findUnique({
        where: { userId: authUserId }
      });
      
      if (!profile) {
        throw new ApiError(404, 'Creator profile not found');
      }

      // Generate a unique slug based on title + random string
      const slugBase = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const uniqueSuffix = crypto.randomBytes(4).toString('hex');
      const slug = `${slugBase}-${uniqueSuffix}`;

      const course = await prisma.course.create({
        data: {
          creator_id: profile.id,
          title: data.title,
          slug,
          short_description: data.shortDescription,
          full_description: data.fullDescription,
          tagline: data.tagline,
          category: data.category,
          subcategory: data.subcategory,
          difficulty: data.difficulty,
          language: data.language,
          target_audience: data.targetAudience,
          estimated_duration: data.duration,
          prerequisites: data.prerequisites || [],
          learning_objectives: data.learningObjectives || [],
          skills_gained: data.skills || [],
          thumbnail_url: data.thumbnailUrl,
          status: 'DRAFT', // Explicitly start as draft
        }
      });

      res.status(201).json({
        course: {
          id: course.id,
          creatorId: course.creator_id,
          title: course.title,
          shortDescription: course.short_description,
          fullDescription: course.full_description,
          tagline: course.tagline,
          category: course.category,
          subcategory: course.subcategory,
          difficulty: course.difficulty,
          language: course.language,
          targetAudience: course.target_audience,
          duration: course.estimated_duration,
          prerequisites: course.prerequisites,
          learningObjectives: course.learning_objectives,
          skills: course.skills_gained,
          thumbnailUrl: course.thumbnail_url,
          status: course.status,
          createdAt: course.created_at,
          updatedAt: course.updated_at
        }
      });
    } catch (error) {
      next(error);
    }
  };

  updateCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const data = req.body;
      const authUserId = req.user!.id;
      
      const profile = await prisma.profile.findUnique({
        where: { userId: authUserId }
      });
      
      const existingCourse = await prisma.course.findUnique({
        where: { id }
      });

      if (!existingCourse) {
        throw new ApiError(404, 'Course not found');
      }

      if (profile && existingCourse.creator_id !== profile.id && req.user!.role !== 'ADMIN') {
        throw new ApiError(403, 'Not authorized to modify this course');
      }

      const course = await prisma.course.update({
        where: { id },
        data: {
          title: data.title,
          short_description: data.shortDescription,
          full_description: data.fullDescription,
          tagline: data.tagline,
          category: data.category,
          subcategory: data.subcategory,
          difficulty: data.difficulty,
          language: data.language,
          target_audience: data.targetAudience,
          estimated_duration: data.duration,
          prerequisites: data.prerequisites,
          learning_objectives: data.learningObjectives,
          skills_gained: data.skills,
          thumbnail_url: data.thumbnailUrl,
          // Explicitly omit status updates as required
        }
      });

      res.json({
        course: {
          id: course.id,
          creatorId: course.creator_id,
          title: course.title,
          shortDescription: course.short_description,
          fullDescription: course.full_description,
          tagline: course.tagline,
          category: course.category,
          subcategory: course.subcategory,
          difficulty: course.difficulty,
          language: course.language,
          targetAudience: course.target_audience,
          duration: course.estimated_duration,
          prerequisites: course.prerequisites,
          learningObjectives: course.learning_objectives,
          skills: course.skills_gained,
          thumbnailUrl: course.thumbnail_url,
          status: course.status,
          createdAt: course.created_at,
          updatedAt: course.updated_at
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
