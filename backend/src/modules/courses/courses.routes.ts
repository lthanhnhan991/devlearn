import { Router } from 'express';
import { coursesController } from './courses.controller';
import { enrollmentsController } from '../enrollments/enrollments.controller';
import { progressController } from '../progress/progress.controller';
import { authenticate, optionalAuthenticate } from '../../middlewares/authenticate';

export const coursesRouter = Router();

coursesRouter.get('/', coursesController.listCourses);
coursesRouter.get('/:id', optionalAuthenticate, coursesController.getCourseDetail);
coursesRouter.post('/:courseId/enroll', authenticate, enrollmentsController.enroll);
coursesRouter.get('/:courseId/learn', authenticate, progressController.getLearnStructure);
