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
import { accountRoutes } from './controllers/account/routes'

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
})

app.register(accountRoutes, { prefix: '/api' })

app.get('/health', async () => {
  return { status: 'ok' }
})

const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' })
    console.log('Server is running on http://localhost:3000')
    console.log('Swagger docs available at http://localhost:3000/docs')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
