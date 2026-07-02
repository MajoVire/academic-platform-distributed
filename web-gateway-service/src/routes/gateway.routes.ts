import { Router } from 'express'
import type { AcademicServiceClient } from '../clients/academic-service.client.js'
import { createGatewayController } from '../controllers/gateway.controller.js'
import { authenticateBearerToken, requireAnyRole, type TokenVerifier } from '../middleware/auth.js'

interface GatewayRoutesDependencies {
  academicServiceClient: AcademicServiceClient
  tokenVerifier: TokenVerifier
}

export function createGatewayRouter(dependencies: GatewayRoutesDependencies): Router {
  const router = Router()
  const controller = createGatewayController(dependencies)

  router.get('/health', controller.health)

  router.use(authenticateBearerToken(dependencies.tokenVerifier))
  router.get('/subjects', requireAnyRole('STUDENT', 'PROFESSOR'), controller.getSubjects)
  router.get('/subjects/:subjectId/courses', requireAnyRole('STUDENT', 'PROFESSOR'), controller.getSubjectCourses)
  router.get('/courses/:courseId/resources', requireAnyRole('STUDENT', 'PROFESSOR'), controller.getCourseResources)
  router.post('/students/:studentId/resources/:resourceId/complete', requireAnyRole('STUDENT'), controller.completeResource)
  router.get('/students/:studentId/progress', requireAnyRole('STUDENT', 'PROFESSOR'), controller.getStudentProgress)
  router.get('/students/:studentId/recommendations', requireAnyRole('STUDENT'), controller.getStudentRecommendations)
  router.get('/catalog/resources/count', requireAnyRole('STUDENT', 'PROFESSOR'), controller.getCatalogResourceCount)
  router.post('/students/:studentId/courses/:courseId/enroll', requireAnyRole('STUDENT'), controller.enrollStudent)
  router.get('/students/:studentId/courses', requireAnyRole('STUDENT'), controller.getStudentEnrolledCourses)
  router.get('/professors/:professorId/students', requireAnyRole('PROFESSOR'), controller.getProfessorStudents)

  return router
}
