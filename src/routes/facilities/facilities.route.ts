import { zValidator } from '@hono/zod-validator'
import { cache } from 'hono/cache'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { Bindings } from '../../env'
import { facilityIdParamSchema, listFacilitiesQuerySchema } from './facilities.schema'
import { getFacilityById, listFacilities } from './facilities.service'

export const facilitiesRoute = new Hono<{ Bindings: Bindings }>()
  .use(
    cache({
      cacheName: 'yakap-map-api',
      cacheControl: 'public, max-age=3600',
    })
  )
  .get(
    '/',
    zValidator('query', listFacilitiesQuerySchema, (result, c) => {
      if (!result.success) {
        return c.json(
          { error: { message: 'Invalid query parameters', issues: result.error.issues } },
          400
        )
      }
    }),
    async (c) => {
      const query = c.req.valid('query')
      const result = await listFacilities(c.env.DATABASE_URL, query)
      return c.json(result)
    }
  )
  .get(
    '/:id',
    zValidator('param', facilityIdParamSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          { error: { message: 'Invalid id parameter', issues: result.error.issues } },
          400
        )
      }
    }),
    async (c) => {
      const { id } = c.req.valid('param')
      const facility = await getFacilityById(c.env.DATABASE_URL, BigInt(id))
      if (!facility) {
        throw new HTTPException(404, { message: 'Facility not found' })
      }
      return c.json({ data: facility })
    }
  )
