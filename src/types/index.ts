import type { HealthFacility } from '../../zenstack/models'

/**
 * Public shape of a tag as it appears on a facility. `id` is serialized as a
 * number (BigInt is not JSON-serializable).
 */
export interface TagDTO {
  id: number
  name: string
  slug: string
}

/**
 * Shape returned by `GET /api/tags` — a tag plus the number of facilities
 * linked to it.
 */
export interface TagWithCountDTO extends TagDTO {
  description: string | null
  facilityCount: number
}

/**
 * Public API shape of a health facility. `id` is serialized as a number
 * (BigInt is not JSON-serializable); the PostGIS `coordinates` column is
 * not queryable by the ORM (Unsupported type) and thus never leaves the API.
 * `tags` carries the facility's directory tags.
 */
export type HealthFacilityDTO = Omit<HealthFacility, 'id' | 'coordinates' | 'facilityTags'> & {
  id: number
  tags: TagDTO[]
}

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}
