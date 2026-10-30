import { Hono } from 'hono'
import type { Bindings } from './env'
import { corsMiddleware } from './middleware/cors'
import { errorHandler } from './middleware/error-handler'
import { facilitiesRoute } from './routes/facilities/facilities.route'
import { healthRoute } from './routes/health'
import { tagsRoute } from './routes/tags/tags.route'

const app = new Hono<{ Bindings: Bindings }>()

app.onError(errorHandler)
app.notFound((c) => c.json({ error: { message: 'Not Found' } }, 404))
app.use('*', corsMiddleware)

const routes = app
  .route('/health', healthRoute)
  .basePath('/api')
  .route('/facilities', facilitiesRoute)
  .route('/tags', tagsRoute)

/** RPC type for `hono/client` consumers (e.g. yakap-map-web). */
export type AppType = typeof routes

export default app
