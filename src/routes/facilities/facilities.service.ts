import type { HealthFacilityWhereInput } from '../../../zenstack/input'
import type { HealthFacility } from '../../../zenstack/models'
import { getDb } from '../../lib/db'
import type { HealthFacilityDTO, PaginatedResult } from '../../types'
import type { ListFacilitiesQuery } from './facilities.schema'

function normalizeRegion(region: string | null): string | null {
  if (region == null) return null
  if (/^\d+$/.test(region)) return `Region ${region}`
  return region
}

function dbRegion(input: string): string {
  return input.replace(/^Region\s+/i, '')
}

function toDTO(facility: HealthFacility): HealthFacilityDTO {
  return { ...facility, id: Number(facility.id), region: normalizeRegion(facility.region) }
}

export async function listFacilities(
  databaseUrl: string,
  query: ListFacilitiesQuery
): Promise<PaginatedResult<HealthFacilityDTO>> {
  const db = getDb(databaseUrl)

  const where: HealthFacilityWhereInput = {
    ...(query.bbox && {
      latitude: { gte: query.bbox.minLat, lte: query.bbox.maxLat },
      longitude: { gte: query.bbox.minLng, lte: query.bbox.maxLng },
    }),
    ...(query.region && { region: { equals: dbRegion(query.region), mode: 'insensitive' } }),
    ...(query.area && { area: { equals: query.area, mode: 'insensitive' } }),
    ...(query.q && {
      OR: [
        { name: { contains: query.q, mode: 'insensitive' } },
        { street: { contains: query.q, mode: 'insensitive' } },
        { municipality: { contains: query.q, mode: 'insensitive' } },
      ],
    }),
  }

  const [rows, total] = await Promise.all([
    db.healthFacility.findMany({
      where,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: query.limit,
      skip: query.offset,
    }),
    db.healthFacility.count({ where }),
  ])

  return {
    data: rows.map(toDTO),
    meta: { total, limit: query.limit, offset: query.offset },
  }
}

export async function getFacilityById(
  databaseUrl: string,
  id: bigint
): Promise<HealthFacilityDTO | null> {
  const db = getDb(databaseUrl)
  const row = await db.healthFacility.findUnique({ where: { id } })
  return row ? toDTO(row) : null
}
