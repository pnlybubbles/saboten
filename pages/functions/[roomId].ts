import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { room } from '../../src/db/schema'

export const onRequest: PagesFunction<{ DB: D1Database }, 'roomId'> = async ({ request, params, env, next }) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') return next()
  const id = z.string().uuid().safeParse(params.roomId)
  if (!id.success) return next()

  const response = await next()
  if (!response.ok || !response.headers.get('Content-Type')?.includes('text/html')) return response

  // DB障害時にもアプリは従来の静的HTMLで開けるようにする。
  let item: { title: string } | undefined
  try {
    const db = drizzle(env.DB)
    item = await db.select({ title: room.title }).from(room).where(eq(room.id, id.data)).get()
  } catch (error) {
    console.error('Failed to load room metadata', error)
  }

  // 静的アセットのETagやキャッシュをroom別のHTMLに引き継がない。
  const html = new Response(response.body, response)
  html.headers.set('Cache-Control', 'no-store')
  html.headers.delete('ETag')
  html.headers.delete('Last-Modified')
  html.headers.delete('Content-Length')
  if (!item) return html

  const name = item.title || '無題のルーム'
  const title = `${name} - SABOTEN`

  return new HTMLRewriter()
    .on('title', {
      element(element) {
        element.setInnerContent(title)
      },
    })
    .on('meta[property="og:title"]', {
      element(element) {
        element.setAttribute('content', title)
      },
    })
    .on('meta[property="og:url"]', {
      // セッション移行用のクエリなどを共有メタデータに含めない。
      element(element) {
        element.setAttribute('content', `https://saboten.app/${id.data}`)
      },
    })
    .transform(html)
}
