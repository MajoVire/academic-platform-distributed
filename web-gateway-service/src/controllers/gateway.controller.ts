import type { Request, RequestHandler } from 'express'
import type { AcademicServiceClient } from '../clients/academic-service.client.js'
import { sendUpstreamResponse } from '../utils/http.js'
import { parsePositiveInteger } from '../utils/validation.js'
import { asyncHandler } from '../utils/async-handler.js'

interface GatewayControllerDependencies {
  academicServiceClient: AcademicServiceClient
}

function buildAcademicPath(requestPath: string): string {
  return `/api${requestPath}`
}

function proxyAcademicRoute(
  academicServiceClient: AcademicServiceClient,
  pathBuilder: (request: Request) => string,
): RequestHandler {
  return asyncHandler(async (request, response) => {
    const upstreamResponse = await academicServiceClient.forward({
      method: request.method,
      path: pathBuilder(request),
      query: request.query,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      headers: request.headers,
    })

    sendUpstreamResponse(response, upstreamResponse)
  })
}

function requirePositiveParam(request: Request, key: string): number {
  return parsePositiveInteger(request.params[key], key)
}

export function createGatewayController({ academicServiceClient }: GatewayControllerDependencies) {
  const health: RequestHandler = asyncHandler(async (request, response) => {
    const upstreamResponse = await academicServiceClient.forward({
      method: 'GET',
      path: buildAcademicPath('/health'),
      query: request.query,
      headers: request.headers,
    })

    response.status(upstreamResponse.status).json({
      status: upstreamResponse.status === 200 ? 'UP' : 'DEGRADED',
      service: 'web-gateway-service',
      upstream: upstreamResponse.data,
    })
  })

  return {
    health,
    getSubjects: proxyAcademicRoute(academicServiceClient, () => buildAcademicPath('/subjects')),
    getSubjectCourses: proxyAcademicRoute(academicServiceClient, (request) => {
      const subjectId = requirePositiveParam(request, 'subjectId')
      return buildAcademicPath(`/subjects/${subjectId}/courses`)
    }),
    getCourseResources: proxyAcademicRoute(academicServiceClient, (request) => {
      const courseId = requirePositiveParam(request, 'courseId')
      return buildAcademicPath(`/courses/${courseId}/resources`)
    }),
    completeResource: proxyAcademicRoute(academicServiceClient, (request) => {
      const studentId = requirePositiveParam(request, 'studentId')
      const resourceId = requirePositiveParam(request, 'resourceId')
      return buildAcademicPath(`/students/${studentId}/resources/${resourceId}/complete`)
    }),
    getStudentProgress: proxyAcademicRoute(academicServiceClient, (request) => {
      const studentId = requirePositiveParam(request, 'studentId')
      return buildAcademicPath(`/students/${studentId}/progress`)
    }),
    getStudentRecommendations: proxyAcademicRoute(academicServiceClient, (request) => {
      const studentId = requirePositiveParam(request, 'studentId')
      return buildAcademicPath(`/students/${studentId}/recommendations`)
    }),
    getCatalogResourceCount: proxyAcademicRoute(academicServiceClient, () => buildAcademicPath('/catalog/resources/count')),
    enrollStudent: proxyAcademicRoute(academicServiceClient, (request) => {
      const studentId = requirePositiveParam(request, 'studentId')
      const courseId = requirePositiveParam(request, 'courseId')
      return buildAcademicPath(`/students/${studentId}/courses/${courseId}/enroll`)
    }),
    getStudentEnrolledCourses: proxyAcademicRoute(academicServiceClient, (request) => {
      const studentId = requirePositiveParam(request, 'studentId')
      return buildAcademicPath(`/students/${studentId}/courses`)
    }),
    getProfessorStudents: proxyAcademicRoute(academicServiceClient, (request) => {
      const professorId = requirePositiveParam(request, 'professorId')
      return buildAcademicPath(`/professors/${professorId}/students`)
    }),
  }
}
