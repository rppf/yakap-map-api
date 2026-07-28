import { PrismaNeonHTTP } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import { enhance } from '@zenstackhq/runtime'

/**
 * Creates a request-scoped enhanced Prisma client backed by Neon's
 * serverless HTTP driver (stateless fetch-based queries — a good fit for
 * this read-only API; no interactive transactions needed).
 * `enhance` applies the access policies from zenstack/schema.zmodel.
 */
export function getDb(databaseUrl: string) {
  const adapter = new PrismaNeonHTTP(databaseUrl, { arrayMode: false, fullResults: true })
  const prisma = new PrismaClient({ adapter })
  return enhance(prisma)
}

export type Db = ReturnType<typeof getDb>
