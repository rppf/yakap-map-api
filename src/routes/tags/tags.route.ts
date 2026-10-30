import { zValidator } from '@hono/zod-validator'
import { cache } from 'hono/cache'
import { Hono } from 'hono'
import type { Bindings } from '../../env'
import { listTagsQuerySchema } from './tags.schema'
import { listTags } from './tags.service'

export const tagsRoute = new Hono<{ Bindings: Bindings }>()
  .use(
    cache({
      cacheName: 'yakap-map-api',
      cacheControl: 'public, max-age=3600',
    })
  )
  .get(
    '/',
    zValidator('query', listTagsQuerySchema, (result, c) => {
      if (!result.success) {
        return c.json(
          { error: { message: 'Invalid query parameters', issues: result.error.issues } },
          400
        )
      }
    }),
    async (c) => {
      const query = c.req.valid('query')
      const tags = await listTags(c.env.DATABASE_URL, query)
      return c.json({ data: tags })
    }
  )
