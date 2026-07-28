import { z } from 'zod'

/**
 * Bounding box in "minLng,minLat,maxLng,maxLat" order (same convention as
 * Mapbox GL's `map.getBounds()`).
 */
const bboxSchema = z
  .string()
  .transform((value) => value.split(',').map(Number))
  .pipe(
    z
      .tuple([
        z.number().min(-180).max(180), // minLng
        z.number().min(-90).max(90), // minLat
        z.number().min(-180).max(180), // maxLng
        z.number().min(-90).max(90), // maxLat
      ])
      .refine(([minLng, minLat, maxLng, maxLat]) => minLng < maxLng && minLat < maxLat, {
        message: 'bbox must be ordered as minLng,minLat,maxLng,maxLat',
      })
      .transform(([minLng, minLat, maxLng, maxLat]) => ({ minLng, minLat, maxLng, maxLat }))
  )
  .optional()

export const listFacilitiesQuerySchema = z.object({
  bbox: bboxSchema,
  q: z.string().trim().min(1).max(100).optional(),
  region: z.string().trim().min(1).max(100).optional(),
  area: z.string().trim().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export type ListFacilitiesQuery = z.infer<typeof listFacilitiesQuerySchema>

export const facilityIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'id must be a positive integer'),
})
