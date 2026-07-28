import type { ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: { message: err.message } }, err.status)
  }

  console.error('Unhandled error:', err)
  return c.json({ error: { message: 'Internal Server Error' } }, 500)
}
