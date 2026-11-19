import { Router } from 'express';
import { coursesController } from './courses.controller';
import { enrollmentsController } from '../enrollments/enrollments.controller';
import { authenticate, optionalAuthenticate } from '../../middlewares/authenticate';

export const coursesRouter = Router();

coursesRouter.get('/', coursesController.listCourses);
coursesRouter.get('/:id', optionalAuthenticate, coursesController.getCourseDetail);
coursesRouter.post('/:courseId/enroll', authenticate, enrollmentsController.enroll);
