import { z } from 'zod'

export const listTagsQuerySchema = z.object({
  q: z.string().trim().min(1).max(100).optional(),
})

export type ListTagsQuery = z.infer<typeof listTagsQuerySchema>
