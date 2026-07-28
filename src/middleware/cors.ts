import type { MiddlewareHandler } from 'hono'
import { cors } from 'hono/cors'
import type { Bindings } from '../env'

export const corsMiddleware: MiddlewareHandler<{ Bindings: Bindings }> = (c, next) => {
  const handler = cors({ origin: c.env.CORS_ORIGIN ?? '*' })
  return handler(c, next)
}
