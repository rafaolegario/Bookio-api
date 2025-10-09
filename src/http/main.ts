import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import multipart from '@fastify/multipart'
import { PrismaClient } from '@prisma/client'
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
    docExpansion: 'list', // 'list', 'full' ou 'none'
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
  staticCSP: true,
  transformStaticCSP: (header: string) => header,
  customCss: `
    body { background: #0a0e27 !important; }
    .swagger-ui { background: #0a0e27; color: #e0e0e0; }
    .swagger-ui .topbar { background: linear-gradient(135deg, #1a1f3a, #0a0e27); border-bottom: 2px solid #2196F3; box-shadow: 0 2px 10px rgba(33,150,243,0.3); }
    .swagger-ui .topbar .download-url-wrapper { display: none; }
    .swagger-ui .info .title { color: #2196F3; font-size: 48px; font-weight: 700; text-shadow: 0 0 20px rgba(33,150,243,0.5); }
    .swagger-ui .info .description { color: #b0b0b0; font-size: 18px; }
    .swagger-ui .opblock-tag { color: #e0e0e0; font-size: 18px; font-weight: 600; padding: 15px 20px; margin: 5px 10px; border-radius: 8px; transition: all 0.3s; }
    .swagger-ui .opblock-tag:hover { background: rgba(33,150,243,0.1); border-left: 4px solid #2196F3; }
    .swagger-ui .opblock { background: #0d1117; border: 1px solid #1f2937; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
    .swagger-ui .opblock:hover { border-color: #2196F3; box-shadow: 0 4px 12px rgba(33,150,243,0.4); }
    .swagger-ui .opblock .opblock-summary { background: #161b22; padding: 15px; }
    .swagger-ui .opblock-summary-path { color: #e0e0e0; }
    .swagger-ui .opblock.opblock-post { border-left: 4px solid #4CAF50; background: linear-gradient(90deg, rgba(76,175,80,0.1), #0d1117 20%); }
    .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #4CAF50; }
    .swagger-ui .opblock.opblock-get { border-left: 4px solid #2196F3; background: linear-gradient(90deg, rgba(33,150,243,0.1), #0d1117 20%); }
    .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #2196F3; }
    .swagger-ui .opblock.opblock-put { border-left: 4px solid #FF9800; background: linear-gradient(90deg, rgba(255,152,0,0.1), #0d1117 20%); }
    .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #FF9800; }
    .swagger-ui .opblock.opblock-patch { border-left: 4px solid #9C27B0; background: linear-gradient(90deg, rgba(156,39,176,0.1), #0d1117 20%); }
    .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #9C27B0; }
    .swagger-ui .opblock.opblock-delete { border-left: 4px solid #f44336; background: linear-gradient(90deg, rgba(244,67,54,0.1), #0d1117 20%); }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #f44336; }
    .swagger-ui .btn { border-radius: 6px; font-weight: 600; text-transform: uppercase; transition: all 0.3s; }
    .swagger-ui .btn.authorize { background: linear-gradient(135deg, #2196F3, #1976D2); border: none; box-shadow: 0 4px 8px rgba(33,150,243,0.4); }
    .swagger-ui .btn.execute { background: linear-gradient(135deg, #4CAF50, #388E3C); border: none; }
    .swagger-ui input, .swagger-ui textarea, .swagger-ui select { background: #0d1117; border: 1px solid #374151; color: #e0e0e0; border-radius: 6px; }
    .swagger-ui input:focus, .swagger-ui textarea:focus { border-color: #2196F3; box-shadow: 0 0 0 3px rgba(33,150,243,0.1); }
    .swagger-ui table { background: #0d1117; border: 1px solid #1f2937; }
    .swagger-ui table thead tr { background: #161b22; border-bottom: 2px solid #2196F3; }
    .swagger-ui table thead tr th { color: #2196F3; font-weight: 700; }
    .swagger-ui .response { background: #161b22; border: 1px solid #1f2937; }
    .swagger-ui .response.response_current { background: rgba(33,150,243,0.1); border-color: #2196F3; }
    .swagger-ui .model-box { background: #0d1117; border: 1px solid #1f2937; }
    .swagger-ui .model-title { color: #2196F3; }
    .swagger-ui ::-webkit-scrollbar { width: 10px; }
    .swagger-ui ::-webkit-scrollbar-track { background: #0d1117; }
    .swagger-ui ::-webkit-scrollbar-thumb { background: #2196F3; border-radius: 5px; }
  `,
  customSiteTitle: 'Bookio API - Documentação',
  customfavIcon: '/favicon.ico',
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
const prisma = new PrismaClient()
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
