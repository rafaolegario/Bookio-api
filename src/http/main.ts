import fastify from 'fastify'
import 'module-alias/register';

import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import multipart from '@fastify/multipart'
import { prisma } from '@/lib/prisma'
import { accountRoutes } from './controllers/account/routes'
import { booksRoutes } from './controllers/books/routes'
import { loansRoutes } from './controllers/loans/routes'
import { penaltiesRoutes } from './controllers/penalties/routes'
import { schedulingsRoutes } from './controllers/schedulings/routes'
import { LoanMonitoringService } from '../use-cases/library/loans/loan-monitoring-service'
import { SchedulingVerificationService } from '../use-cases/library/scheduling/scheduling-verification-service'
import { PenalityVerificationService } from '../use-cases/library/penalities/penality-verification-service'
import { PrismaLoanRepository } from '../repositories/prisma/prisma-loan-repository'
import { PrismaPenalityRepository } from '../repositories/prisma/prisma-penality-repository'
import { PrismaSchedulingRepository } from '../repositories/prisma/prisma-scheduling-repository'
import { PrismaReaderRepository } from '../repositories/prisma/prisma-reader-repository'


const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(cookie)

app.register(multipart, {
  attachFieldsToBody: 'keyValues',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
})

app.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
})

app.register(require('@fastify/swagger'), {
  openapi: {
    info: {
      title: 'Bookio API',
      description: 'API para gerenciamento de livros e leitores',
      version: '1.0.0',
    },
    servers: [],
  },
  transform: jsonSchemaTransform,
})

app.register(require('@fastify/swagger-ui'), {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
    displayOperationId: false,
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
  },
  staticCSP: false,
  theme: {
    css: [
      {
        filename: 'custom.css',
        content: `
          body {
            background: #0a0e27 !important;
            margin: 0;
            padding: 0;
          }
          .swagger-ui {
            background: #0a0e27 !important;
            color: #e0e0e0 !important;
          }
          .swagger-ui .topbar {
            background: linear-gradient(135deg, #1a1f3a, #0a0e27) !important;
            border-bottom: 2px solid #2196F3 !important;
            box-shadow: 0 2px 10px rgba(33,150,243,0.3) !important;
          }
          .swagger-ui .topbar .download-url-wrapper {
            display: none !important;
          }
          .swagger-ui .info .title {
            color: #2196F3 !important;
            font-size: 48px !important;
            font-weight: 700 !important;
            text-shadow: 0 0 20px rgba(33,150,243,0.5) !important;
          }
          .swagger-ui .info .description {
            color: #b0b0b0 !important;
            font-size: 18px !important;
          }
          .swagger-ui .opblock-tag {
            color: #e0e0e0 !important;
            font-size: 18px !important;
            font-weight: 600 !important;
            padding: 15px 20px !important;
            margin: 5px 10px !important;
            border-radius: 8px !important;
            transition: all 0.3s !important;
          }
          .swagger-ui .opblock-tag:hover {
            background: rgba(33,150,243,0.1) !important;
            border-left: 4px solid #2196F3 !important;
          }
          .swagger-ui .opblock {
            background: #0d1117 !important;
            border: 1px solid #1f2937 !important;
            border-radius: 8px !important;
            margin-bottom: 20px !important;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3) !important;
          }
          .swagger-ui .opblock:hover {
            border-color: #2196F3 !important;
            box-shadow: 0 4px 12px rgba(33,150,243,0.4) !important;
          }
          .swagger-ui .opblock .opblock-summary {
            background: #161b22 !important;
            padding: 15px !important;
          }
          .swagger-ui .opblock-summary-path {
            color: #e0e0e0 !important;
          }
          .swagger-ui .opblock.opblock-post {
            border-left: 4px solid #4CAF50 !important;
            background: linear-gradient(90deg, rgba(76,175,80,0.1), #0d1117 20%) !important;
          }
          .swagger-ui .opblock.opblock-post .opblock-summary-method {
            background: #4CAF50 !important;
          }
          .swagger-ui .opblock.opblock-get {
            border-left: 4px solid #2196F3 !important;
            background: linear-gradient(90deg, rgba(33,150,243,0.1), #0d1117 20%) !important;
          }
          .swagger-ui .opblock.opblock-get .opblock-summary-method {
            background: #2196F3 !important;
          }
          .swagger-ui .opblock.opblock-put {
            border-left: 4px solid #FF9800 !important;
            background: linear-gradient(90deg, rgba(255,152,0,0.1), #0d1117 20%) !important;
          }
          .swagger-ui .opblock.opblock-put .opblock-summary-method {
            background: #FF9800 !important;
          }
          .swagger-ui .opblock.opblock-patch {
            border-left: 4px solid #9C27B0 !important;
            background: linear-gradient(90deg, rgba(156,39,176,0.1), #0d1117 20%) !important;
          }
          .swagger-ui .opblock.opblock-patch .opblock-summary-method {
            background: #9C27B0 !important;
          }
          .swagger-ui .opblock.opblock-delete {
            border-left: 4px solid #f44336 !important;
            background: linear-gradient(90deg, rgba(244,67,54,0.1), #0d1117 20%) !important;
          }
          .swagger-ui .opblock.opblock-delete .opblock-summary-method {
            background: #f44336 !important;
          }
          .swagger-ui .btn {
            border-radius: 6px !important;
            font-weight: 600 !important;
            text-transform: uppercase !important;
            transition: all 0.3s !important;
          }
          .swagger-ui .btn.authorize {
            background: linear-gradient(135deg, #2196F3, #1976D2) !important;
            border: none !important;
            box-shadow: 0 4px 8px rgba(33,150,243,0.4) !important;
          }
          .swagger-ui .btn.execute {
            background: linear-gradient(135deg, #4CAF50, #388E3C) !important;
            border: none !important;
          }
          .swagger-ui input,
          .swagger-ui textarea,
          .swagger-ui select {
            background: #0d1117 !important;
            border: 1px solid #374151 !important;
            color: #e0e0e0 !important;
            border-radius: 6px !important;
          }
          .swagger-ui input:focus,
          .swagger-ui textarea:focus {
            border-color: #2196F3 !important;
            box-shadow: 0 0 0 3px rgba(33,150,243,0.1) !important;
          }
          .swagger-ui table {
            background: #0d1117 !important;
            border: 1px solid #1f2937 !important;
          }
          .swagger-ui table thead tr {
            background: #161b22 !important;
            border-bottom: 2px solid #2196F3 !important;
          }
          .swagger-ui table thead tr th {
            color: #2196F3 !important;
            font-weight: 700 !important;
          }
          .swagger-ui .response {
            background: #161b22 !important;
            border: 1px solid #1f2937 !important;
          }
          .swagger-ui .response.response_current {
            background: rgba(33,150,243,0.1) !important;
            border-color: #2196F3 !important;
          }
          .swagger-ui .model-box {
            background: #0d1117 !important;
            border: 1px solid #1f2937 !important;
          }
          .swagger-ui .model-title {
            color: #2196F3 !important;
          }
          .swagger-ui ::-webkit-scrollbar {
            width: 10px !important;
          }
          .swagger-ui ::-webkit-scrollbar-track {
            background: #0d1117 !important;
          }
          .swagger-ui ::-webkit-scrollbar-thumb {
            background: #2196F3 !important;
            border-radius: 5px !important;
          }
        `,
      },
    ],
  },
})

app.register(accountRoutes, { prefix: '/api' })
app.register(booksRoutes, { prefix: '/api' })
app.register(loansRoutes, { prefix: '/api' })
app.register(penaltiesRoutes, { prefix: '/api' })
app.register(schedulingsRoutes, { prefix: '/api' })

app.get('/health', async () => {
  return { status: 'ok' }
})

// Inicializar serviços de monitoramento
const loanRepository = new PrismaLoanRepository(prisma)
const penalityRepository = new PrismaPenalityRepository(prisma)
const schedulingRepository = new PrismaSchedulingRepository(prisma)
const readerRepository = new PrismaReaderRepository(prisma)

const loanMonitoringService = new LoanMonitoringService(
  loanRepository,
  penalityRepository,
)
const schedulingVerificationService = new SchedulingVerificationService(
  schedulingRepository,
)
const penalityVerificationService = new PenalityVerificationService(
  penalityRepository,
  readerRepository,
)

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000
    await app.listen({ port, host: '0.0.0.0' })
    console.log(`Server is running on http://localhost:${port}`)
    console.log(`Swagger docs available at http://localhost:${port}/docs`)

    // Iniciar serviços de monitoramento
    console.log('Starting monitoring services...')
    loanMonitoringService.start()
    schedulingVerificationService.start()
    penalityVerificationService.start()
    console.log('✅ All monitoring services started successfully')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...')
  loanMonitoringService.stop()
  schedulingVerificationService.stop()
  penalityVerificationService.stop()
  prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...')
  loanMonitoringService.stop()
  schedulingVerificationService.stop()
  penalityVerificationService.stop()
  prisma.$disconnect()
  process.exit(0)
})

start()
