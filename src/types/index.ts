import type { HealthFacility } from '@prisma/client'

/**
 * Public API shape of a health facility. `id` is serialized as a number
 * (BigInt is not JSON-serializable); the PostGIS `coordinates` column is
 * not exposed by Prisma Client and thus never leaves the API.
 */
export type HealthFacilityDTO = Omit<HealthFacility, 'id' | 'coordinates'> & { id: number }

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}
