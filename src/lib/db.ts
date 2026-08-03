import { neon } from '@neondatabase/serverless'
import { ZenStackClient } from '@zenstackhq/orm'
import { PolicyPlugin } from '@zenstackhq/plugin-policy'
import { NeonDialect } from 'kysely-neon'
import { schema } from '../../zenstack/schema'

/**
 * Creates a request-scoped ZenStack ORM client backed by Neon's serverless
 * HTTP driver via kysely-neon's NeonDialect (stateless fetch-based queries —
 * a good fit for this read-only API; no transactions needed).
 * `PolicyPlugin` enforces the access policies from zenstack/schema.zmodel.
 */
export function getDb(databaseUrl: string) {
  return new ZenStackClient(schema, {
    dialect: new NeonDialect({ neon: neon(databaseUrl) }),
    plugins: [new PolicyPlugin()],
  })
}

export type Db = ReturnType<typeof getDb>
