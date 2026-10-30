import type { TagGetPayload, TagWhereInput } from '../../../zenstack/input'
import { getDb } from '../../lib/db'
import type { TagWithCountDTO } from '../../types'
import type { ListTagsQuery } from './tags.schema'

type TagWithCount = TagGetPayload<{
  include: { _count: { select: { facilityTags: true } } }
}>

export async function listTags(
  databaseUrl: string,
  query: ListTagsQuery
): Promise<TagWithCountDTO[]> {
  const db = getDb(databaseUrl)

  const where: TagWhereInput | undefined = query.q
    ? {
        OR: [
          { name: { contains: query.q, mode: 'insensitive' } },
          { slug: { contains: query.q, mode: 'insensitive' } },
        ],
      }
    : undefined

  const rows = await db.tag.findMany({
    where,
    orderBy: [{ name: 'asc' }, { id: 'asc' }],
    include: { _count: { select: { facilityTags: true } } },
  })

  return rows.map((tag: TagWithCount) => ({
    id: Number(tag.id),
    name: tag.name,
    slug: tag.slug,
    description: tag.description,
    facilityCount: tag._count.facilityTags,
  }))
}
