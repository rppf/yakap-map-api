import { z } from 'zod'

/**
 * Comma-separated list of tag slugs. Multiple slugs are combined with AND
 * semantics — a facility must carry every listed tag to match.
 */
const tagsSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .transform((value) =>
    [...new Set(value.split(',').map((slug) => slug.trim()).filter((slug) => slug.length > 0))]
  )
  .pipe(z.array(z.string().min(1).max(100)).min(1))

/**
 * Strict boolean query param: accepts only "true" or "false" (case-sensitive);
 * anything else is rejected with a 400. Omit to apply no filter.
 */
const withPrescriptionSchema = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')
  .optional()

export const listFacilitiesQuerySchema = z.object({
  tags: tagsSchema.optional(),
  q: z.string().trim().min(1).max(100).optional(),
  withPrescription: withPrescriptionSchema,
  limit: z.coerce.number().int().min(1).max(1000).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export type ListFacilitiesQuery = z.infer<typeof listFacilitiesQuerySchema>

export const facilityIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'id must be a positive integer'),
})
