import { Router } from 'express'
import type { AcademicServiceClient } from '../clients/academic-service.client.js'
import { createGatewayController } from '../controllers/gateway.controller.js'

interface GatewayRoutesDependencies {
  academicServiceClient: AcademicServiceClient
}

export function createGatewayRouter(dependencies: GatewayRoutesDependencies): Router {
  const router = Router()
  const controller = createGatewayController(dependencies)

  router.get('/health', controller.health)
  router.get('/subjects', controller.getSubjects)
  router.get('/subjects/:subjectId/courses', controller.getSubjectCourses)
  router.get('/courses/:courseId/resources', controller.getCourseResources)
  router.post('/students/:studentId/resources/:resourceId/complete', controller.completeResource)
  router.get('/students/:studentId/progress', controller.getStudentProgress)
  router.get('/students/:studentId/recommendations', controller.getStudentRecommendations)

  return router
}
