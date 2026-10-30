import type { HealthFacilityGetPayload, HealthFacilityWhereInput } from '../../../zenstack/input'
import type { Tag } from '../../../zenstack/models'
import { getDb } from '../../lib/db'
import type { HealthFacilityDTO, PaginatedResult, TagDTO } from '../../types'
import type { ListFacilitiesQuery } from './facilities.schema'

type FacilityWithTags = HealthFacilityGetPayload<{
  include: { facilityTags: { include: { tag: true } } }
}>

function normalizeRegion(region: string | null): string | null {
  if (region == null) return null
  if (/^\d+$/.test(region)) return `Region ${region}`
  return region
}

function toTagDTO(tag: Tag): TagDTO {
  return { id: Number(tag.id), name: tag.name, slug: tag.slug }
}

function toDTO(facility: FacilityWithTags): HealthFacilityDTO {
  const { facilityTags, ...rest } = facility
  return {
    ...rest,
    id: Number(facility.id),
    region: normalizeRegion(facility.region),
    tags: facilityTags.map((link) => toTagDTO(link.tag)),
  }
}

export async function listFacilities(
  databaseUrl: string,
  query: ListFacilitiesQuery
): Promise<PaginatedResult<HealthFacilityDTO>> {
  const db = getDb(databaseUrl)

  const where: HealthFacilityWhereInput = {
    ...(query.q && {
      OR: [
        { name: { contains: query.q, mode: 'insensitive' } },
        { street: { contains: query.q, mode: 'insensitive' } },
        { municipality: { contains: query.q, mode: 'insensitive' } },
      ],
    }),
    ...(query.tags && {
      AND: query.tags.map((slug) => ({ facilityTags: { some: { tag: { slug } } } })),
    }),
    ...(query.withPrescription !== undefined && {
      withYakapPrescription: query.withPrescription,
    }),
  }

  const [rows, total] = await Promise.all([
    db.healthFacility.findMany({
      where,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: query.limit,
      skip: query.offset,
      include: { facilityTags: { include: { tag: true } } },
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
  const row = await db.healthFacility.findUnique({
    where: { id },
    include: { facilityTags: { include: { tag: true } } },
  })
  return row ? toDTO(row) : null
}
